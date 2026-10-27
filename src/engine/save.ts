import type { GameState } from './types';
import { upgradeCharacter } from './outfit';

/**
 * Save adapters. The game only talks to this interface, so cloud saves
 * (e.g. Supabase, one row per child profile) can be swapped in later without
 * touching gameplay code.
 */
export interface SaveAdapter {
  load(profileId: string): Promise<GameState | null>;
  save(profileId: string, state: GameState): Promise<void>;
  clear(profileId: string): Promise<void>;
  /** Keep a copy of a save the game can't use (damaged, or from a newer version) so it is never lost. */
  backup?(profileId: string, raw: unknown): Promise<void>;
}

const KEY = (id: string) => `careertown:save:${id}`;
const BACKUP_KEY = (id: string) => `careertown:backup:${id}:${Date.now()}`;

export const localSave: SaveAdapter = {
  async load(id) {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(KEY(id));
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch {
      // Damaged save: keep the text so it can be recovered, then start fresh.
      if (raw) try { localStorage.setItem(BACKUP_KEY(id), raw); } catch { /* storage full */ }
      return null;
    }
  },
  async backup(id, raw) {
    try { localStorage.setItem(BACKUP_KEY(id), typeof raw === 'string' ? raw : JSON.stringify(raw)); } catch { /* storage full or blocked */ }
  },
  async save(id, state) {
    try { localStorage.setItem(KEY(id), JSON.stringify(state)); } catch { /* storage full or blocked */ }
  },
  async clear(id) {
    try { localStorage.removeItem(KEY(id)); } catch { /* ignore */ }
  },
};

/*
 * Future: Supabase adapter sketch (not bundled in the MVP).
 *
 * export const supabaseSave = (client: SupabaseClient): SaveAdapter => ({
 *   async load(profileId) {
 *     const { data } = await client.from('saves').select('state').eq('profile_id', profileId).single();
 *     return data?.state ?? null;
 *   },
 *   async save(profileId, state) {
 *     await client.from('saves').upsert({ profile_id: profileId, state, updated_at: new Date().toISOString() });
 *   },
 *   async clear(profileId) { await client.from('saves').delete().eq('profile_id', profileId); },
 * });
 *
 * Parent accounts own many child `profiles`; row-level security keeps each
 * family's saves private. No chat, no public profiles, no multiplayer.
 */

export const SAVE_VERSION = 2;

/**
 * Save upgrades. When the save format changes, bump SAVE_VERSION and add a step here that turns a
 * version-N save into a version-N+1 save. Older saves are upgraded step by step instead of being dropped.
 */
export const MIGRATIONS: Record<number, (g: GameState) => GameState> = {
  // 1 → 2 (Dress-Up Studio, Oct 2026): each character's look is checked so it is safe to draw, keeps a
  // default look to reset to, and gets room for saved looks and a chosen face. Progress is untouched.
  1: (g) => ({ ...g, characters: (g.characters ?? []).map(upgradeCharacter) }),
};
export function migrate(g: GameState): GameState {
  let v = g.version ?? 1;
  while (v < SAVE_VERSION) { g = (MIGRATIONS[v] ?? ((x) => x))({ ...g }); v += 1; g = { ...g, version: v }; }
  return g;
}
export const ACTIVE_PROFILE = 'local-child-1';
