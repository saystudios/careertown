import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import type { CareerId, CharacterData, Entity, GameState, PetData, Reward, SceneId } from './types';
import { initialScene, extraFor, PLAY_BOXES } from '../data/scenes';
import { BADGES, SECRETS } from '../data/catalog';
import { MISSIONS } from '../data/missions';
import { dailyFor, todayKey } from '../data/daily';
import { STARTER_ACCESSORIES, ACCESSORIES } from '../data/accessories';
/** Wearable painted accessories (caps, glasses, bags, headphones) were retired. */
const OLD_WEARABLES = new Set(ACCESSORIES.filter((a) => a.wear && !a.toy).map((a) => a.id));
const STARTER = STARTER_ACCESSORIES.filter((id) => !OLD_WEARABLES.has(id));
import { FAMILY_DOLLS, FAMILY_PAPER, lookToDoll } from '../data/dollLooks';
import { localSave, SAVE_VERSION, ACTIVE_PROFILE, migrate, type SaveAdapter } from './save';
import { uid } from './ids';
import { setSoundEnabled, sfx } from './sfx';
import { setMusicEnabled } from './music';
import { nextDailySticker, stickerById } from '../data/stickers';

// ── Defaults ───────────────────────────────────────────
const L = { skin: '#E8AE7E', face: 'round', eyes: 'dot', hair: 'long', hairColor: '#24160E', top: 'tee', topColor: '#FF5D5D', bottom: 'jeans', bottomColor: '#6E95DB', shoes: '#FFFFFF', glasses: 'none', hat: 'none', accessory: 'none' } as CharacterData['look'];
export const DEFAULT_CHARACTERS: CharacterData[] = [
  { id: 'yuna', name: 'Yuna', age: 'child', sprite: 'yuna', look: { ...L, top: 'hoodie', topColor: '#E2483B' } },
  { id: 'natalie', name: 'Natalie', age: 'child', sprite: 'natalie', look: { ...L, hair: 'ponytail', top: 'tee', topColor: '#222222', bottom: 'pants', bottomColor: '#222222' } },
  { id: 'brother', name: 'Brother', age: 'child', sprite: 'brother', look: { ...L, hair: 'curly', top: 'hoodie', topColor: '#3D7BFF', bottom: 'shorts', bottomColor: '#222222' } },
  { id: 'nene', name: 'Nene', age: 'child', sprite: 'nene', look: { ...L, hair: 'bob', bottom: 'dress', bottomColor: '#FF9FBF' } },
  { id: 'mom', name: 'Mom', age: 'adult', sprite: 'mom', look: { ...L, hair: 'topknot', top: 'sweater', topColor: '#F2E6CF', bottom: 'widejeans', bottomColor: '#C8B08A' } },
  { id: 'dad', name: 'Dad', age: 'adult', sprite: 'dad', look: { ...L, hair: 'short', top: 'sweatshirt', topColor: '#2B2B2B' } },
].map((c) => ({ ...c, doll: FAMILY_DOLLS[c.sprite!], ...(FAMILY_PAPER[c.sprite!] ? { paper: FAMILY_PAPER[c.sprite!] } : {}) }) as CharacterData);
export const DEFAULT_PETS: PetData[] = [
  { id: 'snowy', species: 'puppy', name: 'Snowy', accessory: 'none', sprite: 'snowy' },
  { id: 'coco', species: 'puppy', name: 'Coco', accessory: 'none', sprite: 'coco' },
];

/** Older saves: bring in the YunaVerse family and dogs without touching anything else. */
/** Everyone gets the accessory starter pack once (new and existing saves). */
export function addStarterPack(g: GameState): GameState {
  if (!g.owned.includes('pack:accessories-1'))
    g = { ...g, owned: [...g.owned, ...STARTER.filter((id) => !g.owned.includes(id)), 'pack:accessories-1'] };
  // New living-room furniture: existing saves find it in My stuff.
  if (!g.owned.includes('pack:living-1'))
    g = { ...g, owned: [...g.owned, ...['armchair', 'plant'].filter((id) => !g.owned.includes(id)), 'pack:living-1'] };
  // Bedroom set: its own pink door and table lamp, and a study desk in My stuff.
  if (!g.owned.includes('pack:bedroom-1')) {
    const bed = g.scenes['home-bedroom'];
    const swap: Record<string, string> = { door: 'door-pink', lamp: 'lamp-pink' };
    g = { ...g, owned: [...g.owned, ...(g.owned.includes('studydesk') ? [] : ['studydesk']), 'pack:bedroom-1'],
      scenes: bed ? { ...g.scenes, 'home-bedroom': bed.map((e) => (e.kind === 'item' && swap[e.ref] ? { ...e, ref: swap[e.ref] } : e)) } : g.scenes };
  }
  // Bathroom set: white door, bath mat, mirror lined up over the sink, extras in My stuff.
  if (!g.owned.includes('pack:bathroom-1')) {
    const bath = g.scenes['home-bathroom'];
    const swap: Record<string, string> = { door: 'door-white', rug: 'bathmat' };
    let scene = bath?.map((e) => (e.kind === 'item' && swap[e.ref] ? { ...e, ref: swap[e.ref] } : e));
    const sink = scene?.find((e) => e.ref === 'bathsink');
    if (scene && sink) scene = scene.map((e) => (e.ref === 'mirror' ? { ...e, x: sink.x, y: sink.y - 112 } : e));
    const extra = ['towel-rack', 'laundry-basket', 'bath-shelf', 'bath-cart', 'trash-can', 'step-stool'].filter((id) => !g.owned.includes(id));
    g = { ...g, owned: [...g.owned, ...extra, 'pack:bathroom-1'], scenes: scene ? { ...g.scenes, 'home-bathroom': scene } : g.scenes };
  }
  // The family is now drawn as vector dress-up characters: give each one their look
  // (worn hats, glasses and bags stay on; the old hand-drawn recolours no longer apply).
  // The old painted accessories are gone: take them off everyone and out of My stuff and the rooms.
  if (!g.owned.includes('pack:no-old-acc-1')) {
    const scenes = Object.fromEntries(Object.entries(g.scenes).map(([k, es]) => [k, es.filter((e) => !(e.kind === 'item' && OLD_WEARABLES.has(e.ref)))]));
    g = { ...g, owned: [...g.owned.filter((id) => !OLD_WEARABLES.has(id)), 'pack:no-old-acc-1'], scenes: scenes as typeof g.scenes,
      characters: g.characters.map((c) => (c.wear ? { ...c, wear: undefined } : c)) };
  }
  // Yuna and Nene are now painted YunaVerse characters (their old look is kept underneath).
  if (!g.owned.includes('pack:paper-family-1')) {
    g = { ...g, owned: [...g.owned, 'pack:paper-family-1'],
      characters: g.characters.map((c) => (c.sprite && FAMILY_PAPER[c.sprite] && !c.paper ? { ...c, paper: { ...FAMILY_PAPER[c.sprite] } } : c)) };
  }
  // More things in every room (Oct 2026): add them once to rooms the player has already opened.
  if (!g.owned.includes('pack:more-items-1')) {
    const scenes = Object.fromEntries(Object.entries(g.scenes).map(([k, es]) => {
      const add = extraFor(k as SceneId).filter((x) => !(es ?? []).some((e) => e.id === x.id));
      return [k, [...(es ?? []), ...add]];
    }));
    g = { ...g, owned: [...g.owned, 'pack:more-items-1'], scenes: scenes as typeof g.scenes };
  }
  // Play boxes in the free-play places (Oct 2026)
  if (!g.owned.includes('pack:play-boxes-1')) {
    const scenes = Object.fromEntries(Object.entries(g.scenes).map(([k, es]) => {
      const add = extraFor(k as SceneId).filter((x) => PLAY_BOXES.has(x.ref) && !(es ?? []).some((e) => e.id === x.id));
      return [k, [...(es ?? []), ...add]];
    }));
    g = { ...g, owned: [...g.owned, 'pack:play-boxes-1'], scenes: scenes as typeof g.scenes };
  }
  if (!g.owned.includes('pack:paper-natalie-1')) {
    g = { ...g, owned: [...g.owned, 'pack:paper-natalie-1'],
      characters: g.characters.map((c) => (c.sprite === 'natalie' && !c.paper ? { ...c, paper: { ...FAMILY_PAPER.natalie } } : c)) };
  }
  if (!g.owned.includes('pack:paper-brother-1')) {
    g = { ...g, owned: [...g.owned, 'pack:paper-brother-1'],
      characters: g.characters.map((c) => (c.sprite === 'brother' && !c.paper ? { ...c, paper: { ...FAMILY_PAPER.brother } } : c)) };
  }
  if (!g.owned.includes('pack:paper-dad-1')) {
    g = { ...g, owned: [...g.owned, 'pack:paper-dad-1'],
      characters: g.characters.map((c) => (c.sprite === 'dad' && !c.paper ? { ...c, paper: { ...FAMILY_PAPER.dad } } : c)) };
  }
  // Mom and Dad join the YunaVerse style (Oct 2026).
  if (!g.owned.includes('pack:paper-mom-1')) {
    g = { ...g, owned: [...g.owned, 'pack:paper-mom-1'],
      characters: g.characters.map((c) => (c.sprite === 'mom' && !c.paper ? { ...c, paper: { ...FAMILY_PAPER.mom } } : c)) };
  }
  // Characters made with the older character maker: same idea, drawn in the vector style.
  if (!g.owned.includes('pack:vector-all-1')) {
    g = { ...g, owned: [...g.owned, 'pack:vector-all-1'],
      characters: g.characters.map((c) => (!c.sprite && !c.doll && c.look ? { ...c, sprite: c.age === 'adult' ? 'doll-adult' : 'doll', doll: lookToDoll(c.look, c.age === 'adult') } : c)) };
  }
  if (!g.owned.includes('pack:vector-family-1')) {
    g = { ...g, owned: [...g.owned, 'pack:vector-family-1'],
      characters: g.characters.map((c) => (c.sprite && FAMILY_DOLLS[c.sprite] && !c.doll ? { ...c, doll: { ...FAMILY_DOLLS[c.sprite] }, colors: undefined, outfit: undefined } : c)) };
  }
  return g;
}

export function addFamily(g: GameState): GameState {
  if (g.characters.some((c) => c.sprite)) return g;
  const living = g.scenes['home-living'] ?? initialScene('home-living');
  return {
    ...g,
    characters: [...DEFAULT_CHARACTERS, ...g.characters],
    pets: [...DEFAULT_PETS, ...g.pets],
    activeCharacterId: 'yuna',
    scenes: { ...g.scenes, 'home-living': [...living,
      { id: 'char-natalie', kind: 'character', ref: 'natalie', x: 250, y: 670, pose: 'stand' },
      { id: 'pet-snowy', kind: 'pet', ref: 'snowy', x: 640, y: 680, pose: 'stand' },
      { id: 'pet-coco', kind: 'pet', ref: 'coco', x: 760, y: 690, pose: 'stand' },
    ] },
  };
}

export function freshGame(): GameState {
  const date = todayKey();
  const kitchen = initialScene('home-kitchen');
  kitchen.push(
    { id: 'char-yuna', kind: 'character', ref: 'yuna', x: 430, y: 660, pose: 'stand' },
    { id: 'char-mom', kind: 'character', ref: 'mom', x: 270, y: 670, pose: 'stand' },
  );
  const living = initialScene('home-living');
  living.push(
    { id: 'char-natalie', kind: 'character', ref: 'natalie', x: 250, y: 670, pose: 'stand' },
    { id: 'pet-snowy', kind: 'pet', ref: 'snowy', x: 640, y: 680, pose: 'stand' },
    { id: 'pet-coco', kind: 'pet', ref: 'coco', x: 760, y: 690, pose: 'stand' },
  );
  return {
    version: SAVE_VERSION, playerName: 'Player', coins: 20, xp: 0, careerXp: {}, badges: [],
    completedMissions: {}, owned: [...STARTER, 'pack:accessories-1', 'pack:no-old-acc-1'], characters: DEFAULT_CHARACTERS, pets: DEFAULT_PETS,
    scenes: { 'home-kitchen': kitchen, 'home-living': living }, secrets: [],
    daily: { date, id: dailyFor(date).id, progress: 0, done: false },
    stats: {}, settings: { sound: true, music: true, petFollow: true }, activeCharacterId: 'yuna', seenIntro: false, stickers: [],
  };
}

export const playerLevel = (xp: number) => 1 + Math.floor(xp / 150);
export const levelProgress = (xp: number) => (xp % 150) / 150;

// ── Actions ────────────────────────────────────────────
export interface Popup { id: string; title: string; reward: Reward }
interface Root { game: GameState; queue: Popup[]; toast?: { id: string; text: string } }

export type Action =
  | { type: 'LOAD'; game: GameState }
  | { type: 'PATCH_ENTITIES'; scene: SceneId; patches: { id: string; patch: Partial<Entity> }[] }
  | { type: 'ENSURE_SCENE'; scene: SceneId }
  | { type: 'ADD_ENTITY'; scene: SceneId; entity: Entity }
  | { type: 'REMOVE_ENTITIES'; scene: SceneId; ids: string[] }
  | { type: 'PLACE_ACTOR'; to: SceneId; entity: Entity }  // characters & pets exist in one room at a time
  | { type: 'REMOVE_ACTOR'; kind: Entity['kind']; ref: string }
  | { type: 'REWARD'; reward: Reward }
  | { type: 'COMPLETE_MISSION'; id: string }
  | { type: 'EVENT'; name: string }
  | { type: 'FIND_SECRET'; id: string }
  | { type: 'SAVE_CHARACTER'; character: CharacterData }
  | { type: 'WEAR'; character: string; slot: 'head' | 'eyes' | 'ears' | 'bag'; item: string | null }
  | { type: 'DELETE_CHARACTER'; id: string }
  | { type: 'SET_ACTIVE'; id: string }
  | { type: 'BUY'; id: string; price: number }
  | { type: 'SET_PET'; pet: PetData }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'SET_BREAK'; mins: number }
  | { type: 'SET_PLAYDATES'; on: boolean }
  | { type: 'TOGGLE_PET_FOLLOW' }
  | { type: 'NEW_DAY'; date: string }
  | { type: 'STICKER'; id: string }
  | { type: 'SEEN_INTRO' }
  | { type: 'DISMISS_POPUP' }
  | { type: 'TOAST'; text: string }
  | { type: 'OWN'; id: string }
  | { type: 'ADD_CHARACTERS'; characters: CharacterData[]; mark: string }
  | { type: 'RESET' };

export const sceneOf = (g: GameState, id: SceneId): Entity[] => g.scenes[id] ?? initialScene(id);

const PET_NAMES: Record<string, string> = { puppy: 'Biscuit', kitten: 'Mochi', bunny: 'Pebble' };

/** Free-play actions also grow career XP so the discovery panel can notice what a kid enjoys. */
const EVENT_CAREER: Record<string, [CareerId, number]> = {
  medical: ['doctor', 6], 'pet-care': ['vet', 6], draw: ['teacher', 30], tower4: ['engineer', 25], cook: ['entrepreneur', 0],
};

function applyReward(g: GameState, r: Reward): GameState {
  const next: GameState = { ...g, coins: g.coins + (r.coins ?? 0), xp: g.xp + (r.xp ?? 0) };
  if (r.career && r.careerXp) next.careerXp = { ...g.careerXp, [r.career]: (g.careerXp[r.career] ?? 0) + r.careerXp };
  if (r.badge && !g.badges.includes(r.badge)) next.badges = [...g.badges, r.badge];
  for (const u of r.unlocks ?? []) {
    if (u === 'pet:puppy' || u === 'pet:kitten' || u === 'pet:bunny') {
      const species = u.slice(4) as PetData['species'];
      if (next.pets.some((p) => p.species === species && !p.sprite)) continue; // the family dogs don't count: you still get your own puppy
      const pet: PetData = { id: uid('pet'), species, name: PET_NAMES[species], accessory: 'none' };
      next.pets = [...next.pets, pet];
      const living = sceneOf(next, 'home-living');
      next.scenes = { ...next.scenes, 'home-living': [...living, { id: uid('petent'), kind: 'pet', ref: pet.id, x: 300 + Math.random() * 300, y: 660, pose: 'stand' }] };
    } else if (!next.owned.includes(u)) {
      next.owned = [...next.owned, u];
    }
  }
  return next;
}

function withPopup(root: Root, game: GameState, reward: Reward, title: string): Root {
  return { ...root, game: applyReward(game, reward), queue: [...root.queue, { id: uid('pop'), title, reward }] };
}

function reducer(root: Root, a: Action): Root {
  const g = root.game;
  const setScene = (scene: SceneId, list: Entity[]): Root => ({ ...root, game: { ...g, scenes: { ...g.scenes, [scene]: list } } });

  switch (a.type) {
    case 'LOAD': return { ...root, game: a.game };
    case 'PATCH_ENTITIES': {
      const map = new Map(a.patches.map((p) => [p.id, p.patch]));
      return setScene(a.scene, sceneOf(g, a.scene).map((e) => (map.has(e.id) ? { ...e, ...map.get(e.id) } : e)));
    }
    case 'ENSURE_SCENE': return g.scenes[a.scene] ? root : setScene(a.scene, initialScene(a.scene));
    case 'ADD_ENTITY': return setScene(a.scene, [...sceneOf(g, a.scene), a.entity]);
    case 'REMOVE_ENTITIES': {
      const ids = new Set(a.ids);
      return setScene(a.scene, sceneOf(g, a.scene)
        .filter((e) => !ids.has(e.id))
        .map((e) => (e.holding && ids.has(e.holding) ? { ...e, holding: undefined } : e)));
    }
    case 'PLACE_ACTOR':
    case 'REMOVE_ACTOR': {
      const kind = a.type === 'PLACE_ACTOR' ? a.entity.kind : a.kind;
      const ref = a.type === 'PLACE_ACTOR' ? a.entity.ref : a.ref;
      const scenes: GameState['scenes'] = {};
      for (const [id, list] of Object.entries(g.scenes) as [SceneId, Entity[]][]) {
        const leaving = list.find((e) => e.kind === kind && e.ref === ref);
        scenes[id] = list
          .filter((e) => !(e.kind === kind && e.ref === ref))
          // whatever they were holding stays behind in the old room
          .map((e) => (leaving && e.heldBy === leaving.id ? { ...e, heldBy: undefined, x: leaving.x + 40, y: leaving.y } : e));
      }
      if (a.type === 'PLACE_ACTOR') scenes[a.to] = [...(scenes[a.to] ?? initialScene(a.to)), a.entity];
      return { ...root, game: { ...g, scenes } };
    }
    case 'REWARD': return withPopup(root, g, a.reward, a.reward.title ?? 'Nice work!');
    case 'COMPLETE_MISSION': {
      const m = MISSIONS[a.id];
      const times = g.completedMissions[a.id] ?? 0;
      const reward = times === 0 ? m.reward : m.repeatReward;
      const game = { ...g, completedMissions: { ...g.completedMissions, [a.id]: times + 1 } };
      const r1 = withPopup(root, game, reward, reward.title ?? 'Mission complete!');
      return reducer(r1, { type: 'EVENT', name: `mission:${a.id}` });
    }
    case 'EVENT': {
      let game: GameState = { ...g, stats: { ...g.stats, [a.name]: (g.stats[a.name] ?? 0) + 1 } };
      let r: Root = { ...root, game };
      const ce = EVENT_CAREER[a.name];
      if (ce && ce[1]) game = r.game = { ...game, careerXp: { ...game.careerXp, [ce[0]]: (game.careerXp[ce[0]] ?? 0) + ce[1] } };
      // Daily challenge
      const today = todayKey();
      let daily = game.daily.date === today ? game.daily : { date: today, id: dailyFor(today).id, progress: 0, done: false };
      const def = dailyFor(today);
      if (!daily.done && def.event === a.name) {
        daily = { ...daily, progress: daily.progress + 1 };
        if (daily.progress >= def.target) {
          daily = { ...daily, done: true };
          r = withPopup(r, { ...game, daily }, { coins: def.coins, xp: 30 }, 'Daily challenge done!');
          game = r.game;
        }
      }
      game = { ...game, daily };
      r = { ...r, game };
      // Free-play badges
      const badge = (id: string, cond: boolean, extra: Reward = {}) => {
        if (cond && !r.game.badges.includes(id)) r = withPopup(r, r.game, { badge: id, xp: 25, coins: 15, ...extra }, `New badge: ${BADGES[id].label}!`);
      };
      badge('chef', (game.stats.cook ?? 0) >= 3);
      badge('artist', (game.stats.draw ?? 0) >= 1);
      return r;
    }
    case 'FIND_SECRET': {
      if (g.secrets.includes(a.id)) return { ...root, toast: { id: uid('t'), text: 'You already found this secret!' } };
      const s = SECRETS[a.id];
      let r = withPopup(root, { ...g, secrets: [...g.secrets, a.id] }, s.reward, s.reward.title ?? 'Secret found!');
      if (r.game.secrets.length >= 3 && !r.game.badges.includes('explorer'))
        r = withPopup(r, r.game, { badge: 'explorer', coins: 30, xp: 40 }, 'New badge: Explorer!');
      return reducer(r, { type: 'EVENT', name: 'secret' });
    }
    case 'WEAR': {
      // One item can only be in one place: take it off anyone else and out of every room.
      const characters = g.characters.map((c) => {
        const wear = { ...(c.wear ?? {}) };
        for (const k of Object.keys(wear) as (keyof typeof wear)[]) if (a.item && wear[k] === a.item) delete wear[k];
        if (c.id === a.character) { if (a.item) wear[a.slot] = a.item; else delete wear[a.slot]; }
        return { ...c, wear };
      });
      const scenes: GameState['scenes'] = {};
      for (const [id, list] of Object.entries(g.scenes) as [SceneId, Entity[]][]) {
        const gone = new Set(list.filter((e) => e.kind === 'item' && e.ref === a.item).map((e) => e.id));
        scenes[id] = list.filter((e) => !gone.has(e.id)).map((e) => (e.holding && gone.has(e.holding) ? { ...e, holding: undefined } : e));
      }
      return { ...root, game: { ...g, characters, scenes } };
    }
    case 'SAVE_CHARACTER': {
      const exists = g.characters.some((c) => c.id === a.character.id);
      const characters = exists ? g.characters.map((c) => (c.id === a.character.id ? a.character : c)) : [...g.characters, a.character];
      return { ...root, game: { ...g, characters, activeCharacterId: a.character.id } };
    }
    case 'DELETE_CHARACTER': {
      const r = reducer(root, { type: 'REMOVE_ACTOR', kind: 'character', ref: a.id });
      return { ...r, game: { ...r.game, characters: r.game.characters.filter((c) => c.id !== a.id) } };
    }
    case 'SET_ACTIVE': return { ...root, game: { ...g, activeCharacterId: a.id } };
    case 'BUY': {
      if (g.coins < a.price || g.owned.includes(a.id)) return root;
      return { ...root, game: { ...g, coins: g.coins - a.price, owned: [...g.owned, a.id] }, toast: { id: uid('t'), text: 'Bought! Find it in your stuff.' } };
    }
    case 'SET_PET': return { ...root, game: { ...g, pets: g.pets.map((p) => (p.id === a.pet.id ? a.pet : p)) } };
    case 'SET_PLAYDATES': return { ...root, game: { ...g, settings: { ...g.settings, playdates: a.on } } };
    case 'SET_BREAK': return { ...root, game: { ...g, settings: { ...g.settings, breakMins: a.mins } } };
    case 'TOGGLE_MUSIC': return { ...root, game: { ...g, settings: { ...g.settings, music: g.settings.music === false } } };
    case 'TOGGLE_PET_FOLLOW': return { ...root, game: { ...g, settings: { ...g.settings, petFollow: g.settings.petFollow === false } } };
    case 'NEW_DAY': {
      if (g.lastPlayed === a.date) return root;
      const have = g.stickers ?? [];
      const s = nextDailySticker(have);
      const game = { ...g, lastPlayed: a.date, stickers: s ? [...have, s.id] : have, stats: { ...g.stats, days: (g.stats.days ?? 0) + 1 } };
      return withPopup(root, game, { coins: 5 }, s ? `Daily sticker: ${s.icon} ${s.name}!` : 'Welcome back! Here are 5 coins.');
    }
    case 'STICKER': {
      const have = g.stickers ?? [];
      if (have.includes(a.id)) return root;
      const s = stickerById(a.id);
      return { ...root, game: { ...g, stickers: [...have, a.id] }, toast: { id: uid('t'), text: `New sticker: ${s?.icon ?? '⭐'} ${s?.name ?? ''}! Find it in your sticker book.` } };
    }
    case 'TOGGLE_SOUND': return { ...root, game: { ...g, settings: { ...g.settings, sound: !g.settings.sound } } };
    case 'SEEN_INTRO': return { ...root, game: { ...g, seenIntro: true } };
    case 'DISMISS_POPUP': return { ...root, queue: root.queue.slice(1) };
    case 'TOAST': return { ...root, toast: { id: uid('t'), text: a.text } };
    case 'ADD_CHARACTERS': {
      if (g.owned.includes(a.mark)) return root;
      const fresh = a.characters.filter((c) => !g.characters.some((x) => x.id === c.id));
      return { ...root, game: { ...g, owned: [...g.owned, a.mark], characters: [...g.characters, ...fresh] } };
    }
    case 'OWN': return g.owned.includes(a.id) ? root : { ...root, game: { ...g, owned: [...g.owned, a.id] } };
    case 'RESET': return { game: freshGame(), queue: [] };
  }
}

// ── Context ────────────────────────────────────────────
interface Ctx { game: GameState; queue: Popup[]; toast?: Root['toast']; dispatch: (a: Action) => void }
const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children, adapter = localSave }: { children: ReactNode; adapter?: SaveAdapter }) {
  const [root, dispatch] = useReducer(reducer, undefined, () => ({ game: freshGame(), queue: [] }));
  const [loaded, setLoaded] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    adapter.load(ACTIVE_PROFILE).then(async (saved) => {
      if (saved && (saved.version ?? 1) <= SAVE_VERSION) {
        dispatch({ type: 'LOAD', game: addStarterPack(addFamily({ ...freshGame(), ...migrate(saved) })) });
      } else if (saved) {
        // A save from a newer version of the game: keep a copy rather than overwrite it.
        await adapter.backup?.(ACTIVE_PROFILE, saved);
      }
      setLoaded(true);
    });
  }, [adapter]);

  useEffect(() => {
    setSoundEnabled(root.game.settings.sound);
    setMusicEnabled(root.game.settings.music !== false);
    if (!loaded) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void adapter.save(ACTIVE_PROFILE, root.game), 400);
  }, [root.game, loaded, adapter]);

  const prevQueue = useRef(0);
  useEffect(() => {
    if (root.queue.length > prevQueue.current) sfx('success');
    prevQueue.current = root.queue.length;
  }, [root.queue.length]);

  if (!loaded) return null;
  return <GameCtx.Provider value={{ game: root.game, queue: root.queue, toast: root.toast, dispatch }}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const c = useContext(GameCtx);
  if (!c) throw new Error('useGame outside GameProvider');
  return c;
}
