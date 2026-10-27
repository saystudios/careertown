import type { CharacterData, Entity, PetData, SceneId } from './types';
import { ITEMS, has, type ItemDef } from '../data/items';
import { SPRITES, LAYERED, sitFrac, sitDrop } from '../data/sprites';
import type { SfxName } from './sfx';

// ── Geometry ───────────────────────────────────────────
export const ROOM_W = 1000;
export const ROOM_H = 700;

export interface Lookup {
  character: (id: string) => CharacterData | undefined;
  pet: (id: string) => PetData | undefined;
}

export function sizeOf(e: Entity, look: Lookup): { w: number; h: number } {
  if (e.kind === 'item') { const d = ITEMS[e.ref]; return { w: d?.w ?? 60, h: d?.h ?? 60 }; }
  if (e.kind === 'pet') {
    const ps = look.pet(e.ref)?.sprite; const sp = ps ? SPRITES[ps] : undefined;
    if (sp) return e.pose === 'sleep' ? { w: sp.w * 1.15, h: sp.h * 0.85 } : { w: sp.w, h: sp.h };
    return e.pose === 'sleep' ? { w: 150, h: 88 } : { w: 135, h: 123 };
  }
  const cs = look.character(e.ref)?.sprite; const csp = cs ? SPRITES[cs] : undefined;
  if (csp) {
    if (e.pose === 'sit') return { w: csp.w, h: csp.h * (LAYERED[cs!] ? sitFrac(LAYERED[cs!]) : 0.8) };
    if (e.pose === 'sleep') return { w: csp.h, h: csp.w };
    return { w: csp.w, h: csp.h };
  }
  const adult = look.character(e.ref)?.age === 'adult';
  const w = adult ? 175 : 165, h = adult ? 257 : 212;
  if (e.pose === 'sit') return { w, h: h * (adult ? 0.85 : 0.92) };
  if (e.pose === 'sleep') return { w: h, h: w * 0.75 };
  return { w, h };
}

/** Hand-drawn people sit with their shins hanging down, so their feet go below the seat. */
function layeredDrop(e: Entity, look: Lookup) {
  if (e.kind !== 'character') return 0;
  const sp = look.character(e.ref)?.sprite; const l = sp ? LAYERED[sp] : undefined;
  return l && SPRITES[sp!] ? sitDrop(l) * SPRITES[sp!].h : 0;
}

export const getState = <T,>(e: Entity, k: string) => e.state?.[k] as T | undefined;
export const withState = (e: Entity, patch: Record<string, unknown>) => ({ ...(e.state ?? {}), ...patch });

/** Depth for back-to-front sorting. Things resting on furniture sort just in front of it. */
export function depthOf(e: Entity, byId: Map<string, Entity>, guard = 0): number {
  if (e.heldBy && byId.has(e.heldBy) && guard < 8) return depthOf(byId.get(e.heldBy)!, byId, guard + 1) + 0.3;
  const on = getState<string>(e, 'on');
  const t = typeof on === 'string' ? byId.get(on) : undefined;
  if (t && guard < 8) {
    const base = depthOf(t, byId, guard + 1);
    return has(ITEMS[t.ref], 'behind') ? base - 0.5 : base + 0.5;
  }
  if (e.kind === 'item' && has(ITEMS[e.ref], 'floor')) return e.y - 1000;
  return e.y;
}

/** All entities resting on `id`, directly or indirectly (things on a table that is on…). */
export function dependentsOf(id: string, all: Entity[]): Set<string> {
  const out = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const e of all) {
      const on = getState<string>(e, 'on');
      if (!out.has(e.id) && on && (on === id || out.has(on))) { out.add(e.id); grew = true; }
    }
  }
  return out;
}

// ── Drop resolution ────────────────────────────────────
export interface Effect {
  patches: { id: string; patch: Partial<Entity> }[];
  remove: string[];
  events: string[];
  sfx?: SfxName;
  bubble?: { id: string; text: string };
  anim?: { id: string; anim: string; ms: number };
  anims?: { id: string; anim: string; ms: number }[];
  bursts?: { id: string; emoji: string }[];
  wear?: { character: string; slot: 'head' | 'eyes' | 'ears' | 'bag'; item: string };
  later?: { ms: number; patches: { id: string; patch: Partial<Entity> }[]; sfx?: SfxName; bubble?: { id: string; text: string }; events?: string[] };
  moveTo?: { scene: SceneId; entity: Entity };
}

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Where a tap on the floor sends the character: kept on the floor (below the back wall) and inside the room. */
export function walkTarget(px: number, py: number, horizon: number, xMin = 30, xMax = 970): { x: number; y: number } {
  return { x: clamp(px, xMin, xMax), y: clamp(py, horizon + 60, 695) };
}

function contains(e: Entity, x: number, y: number, look: Lookup, pad: number) {
  const { w, h } = sizeOf(e, look);
  return x >= e.x - w / 2 - pad && x <= e.x + w / 2 + pad && y >= e.y - h - pad && y <= e.y + pad;
}

/**
 * Work out what happens when `d` is released. (hx, hy) is where the finger lifted
 * (used to find the target); (x, y) is where the entity's feet would land.
 */
export function resolveDrop(d: Entity, hx: number, hy: number, x: number, y: number, all: Entity[], look: Lookup, horizon: number, xMin = 30, xMax = 970): Effect {
  const fx: Effect = { patches: [], remove: [], events: [] };
  const byId = new Map(all.map((e) => [e.id, e]));
  const deps = dependentsOf(d.id, all);
  const dd: ItemDef | undefined = d.kind === 'item' ? ITEMS[d.ref] : undefined;
  const P = (id: string, patch: Partial<Entity>) => fx.patches.push({ id, patch });

  const candidates = all
    .filter((e) => e.id !== d.id && !deps.has(e.id) && !e.heldBy && e.id !== d.heldBy)
    .filter((e) => contains(e, hx, hy, look, e.kind === 'item' ? 0 : 18))
    .sort((a, b) => depthOf(b, byId) - depthOf(a, byId));

  const tryRule = (t: Entity): boolean => {
    const td = t.kind === 'item' ? ITEMS[t.ref] : undefined;
    const ts = sizeOf(t, look);
    const top = t.y - ts.h + 8;

    // ── Friends meeting ──
    if ((d.kind === 'character' || d.kind === 'pet') && (t.kind === 'character' || t.kind === 'pet')) {
      const side = x < t.x ? -1 : 1;
      const hugging = d.kind === 'character' && t.kind === 'character';
      const nx = clamp(t.x + side * (d.kind === 'pet' || t.kind === 'pet' ? 85 : hugging ? 74 : 95), xMin + 10, xMax - 10);
      const pet = d.kind === 'pet' ? d : t.kind === 'pet' ? t : undefined;
      const person = d.kind === 'character' ? d : t.kind === 'character' ? t : undefined;
      P(d.id, { x: nx, y: clamp(t.y, horizon + 70, 695), pose: 'stand', state: withState(d, { on: undefined, ...(pet && person && pet.id === d.id ? { follow: person.ref } : {}) }) });
      if (pet && person && pet.id === t.id) P(t.id, { state: withState(t, { follow: person.ref }) });
      fx.anims = hugging
        ? [{ id: d.id, anim: side < 0 ? 'hugr' : 'hugl', ms: 1800 }, { id: t.id, anim: side < 0 ? 'hugl' : 'hugr', ms: 1800 }]
        : [{ id: d.id, anim: 'hop', ms: 900 }, { id: t.id, anim: 'hop', ms: 900 }];
      fx.bursts = [{ id: t.id, emoji: '💕' }, { id: d.id, emoji: '💕' }];
      if (pet && person) {
        fx.bubble = { id: person.id, text: pick(['Aww! 🥰', 'Who’s a good buddy?', 'Snuggle time!']) };
        fx.events.push('pet-play');
      } else if (!pet) {
        fx.bubble = { id: t.id, text: pick(['Hug! 🤗', 'Best friends!', 'Hi friend!', 'Yay, you’re here!']) };
        fx.events.push('hug');
      } else {
        fx.bubble = { id: t.id, text: 'Hi buddy! 💕' };
      }
      fx.sfx = 'sparkle';
      return true;
    }

    // ── People ──
    if (d.kind === 'character' || d.kind === 'pet') {
      if (has(td, 'door')) {
        const to = getState<SceneId>(t, 'to');
        if (!to) return false;
        fx.moveTo = { scene: to, entity: { ...d, x: 500, y: 660, pose: 'stand', state: {} } };
        fx.sfx = 'whoosh'; fx.events.push('door');
        return true;
      }
      if (has(td, 'bed')) {
        P(d.id, { pose: 'sleep', x: t.x + (d.kind === 'pet' ? (x > t.x ? 60 : -60) : 0), y: t.y - ts.h * 0.42, state: withState(d, { on: t.id }) });
        fx.sfx = 'snore'; fx.events.push(d.kind === 'pet' ? 'pet-nap' : 'sleep');
        return true;
      }
      if (d.kind === 'character' && has(td, 'shower')) {
        P(d.id, { pose: 'stand', x: t.x + ts.w * 0.12, y: t.y - (td?.front ? ts.h * 0.08 : 30), state: withState(d, { on: t.id }) });
        fx.anim = { id: d.id, anim: 'shower', ms: 2600 }; fx.sfx = 'splash';
        fx.bubble = { id: d.id, text: pick(['La la la! 🫧', 'So bubbly!', 'Squeaky clean!']) }; fx.events.push('shower');
        return true;
      }
      if (has(td, 'seat')) {
        const wide = ts.w > 200;
        const taken = all.some((o) => o.id !== d.id && o.kind !== 'item' && getState<string>(o, 'on') === t.id);
        if (taken && !wide) return false; // one sitter per chair
        P(d.id, {
          pose: d.kind === 'pet' ? 'sleep' : 'sit',
          x: wide ? clamp(x, t.x - ts.w / 2 + 60, t.x + ts.w / 2 - 60) : t.x,
          y: t.y - (td?.seatLift ?? 40) + layeredDrop(d, look), state: withState(d, { on: t.id }),
        });
        fx.sfx = 'pop'; fx.events.push('sit');
        return true;
      }
      return false;
    }

    // ── Objects ──
    if (!dd) return false;
    if (t.kind === 'character') {
      if (has(dd, 'food')) {
        fx.remove.push(d.id); fx.anim = { id: t.id, anim: 'eat', ms: 1400 };
        fx.bubble = { id: t.id, text: pick(['Yum!', 'Delicious!', 'Mmm, tasty!', 'Crunch crunch!']) };
        fx.sfx = 'munch'; fx.events.push('eat'); fx.bursts = [{ id: t.id, emoji: '😋' }];
        return true;
      }
      if (has(dd, 'brush')) {
        P(d.id, { x: t.x + 60, y: t.y, state: withState(d, { on: undefined }) });
        fx.anim = { id: t.id, anim: 'brush', ms: 1600 }; fx.bubble = { id: t.id, text: '✨ Sparkly teeth!' };
        fx.sfx = 'sparkle'; fx.events.push('brush');
        return true;
      }
      if (dd.medical) {
        fx.events.push('medical');
        if (dd.medical === 'bandage') {
          fx.remove.push(d.id); P(t.id, { state: withState(t, { bandage: true }) });
          fx.bubble = { id: t.id, text: 'All patched up!' }; fx.sfx = 'pop';
        } else if (dd.medical === 'thermometer') {
          P(d.id, { x: t.x + 70, y: t.y });
          fx.bubble = { id: t.id, text: `🌡️ ${(36.6 + Math.random() * 0.6).toFixed(1)}°C. Nice and normal!` }; fx.sfx = 'beep';
        } else {
          P(d.id, { x: t.x + 70, y: t.y });
          fx.bubble = { id: t.id, text: '💓 ba-dum, ba-dum!' }; fx.sfx = 'heartbeat';
        }
        fx.anim = { id: t.id, anim: 'check', ms: 900 };
        return true;
      }
      if (false && dd.wear && look.character(t.ref)?.sprite && LAYERED[look.character(t.ref)!.sprite!]) {
        fx.wear = { character: t.ref, slot: dd.wear, item: d.ref };
        fx.remove.push(d.id);
        fx.anim = { id: t.id, anim: 'hop', ms: 800 };
        fx.bubble = { id: t.id, text: pick(['Looking good! ✨', 'I love it!', 'So stylish!', 'How do I look?']) };
        fx.bursts = [{ id: t.id, emoji: '✨' }];
        fx.sfx = 'sparkle'; fx.events.push('dress');
        return true;
      }
      if (has(dd, 'small')) {
        const prev = t.holding && byId.get(t.holding);
        if (prev) P(prev.id, { heldBy: undefined, x: t.x + 70, y: t.y });
        P(d.id, { heldBy: t.id, state: withState(d, { on: undefined }) });
        P(t.id, { holding: d.id });
        fx.sfx = 'pop'; fx.events.push('hold');
        return true;
      }
      return false;
    }
    if (t.kind === 'pet') {
      if (dd.medical || has(dd, 'groom')) {
        fx.events.push('pet-care');
        fx.anim = { id: t.id, anim: 'check', ms: 900 };
        if (has(dd, 'groom')) { P(d.id, { x: t.x + 70, y: t.y }); fx.bubble = { id: t.id, text: 'So fluffy! ✨' }; fx.sfx = 'sparkle'; }
        else if (dd.medical === 'bandage') { fx.remove.push(d.id); P(t.id, { state: withState(t, { bandage: true }) }); fx.bubble = { id: t.id, text: 'All patched up! 💕' }; fx.sfx = 'pop'; }
        else if (dd.medical === 'stethoscope') { P(d.id, { x: t.x + 70, y: t.y }); fx.bubble = { id: t.id, text: '💓 thump-thump-thump! (pets’ hearts are fast)' }; fx.sfx = 'heartbeat'; }
        else { P(d.id, { x: t.x + 70, y: t.y }); fx.bubble = { id: t.id, text: '🌡️ Normal for a pet!' }; fx.sfx = 'beep'; }
        return true;
      }
      if (has(dd, 'food') || has(dd, 'petfood')) {
        fx.remove.push(d.id); fx.anim = { id: t.id, anim: 'eat', ms: 1400 };
        fx.bubble = { id: t.id, text: 'Nom nom!' }; fx.sfx = 'munch'; fx.events.push('feed-pet');
        return true;
      }
      if (has(dd, 'toy')) {
        P(d.id, { x: t.x + 70, y: t.y });
        const sp = look.pet(t.ref)?.species;
        fx.anim = { id: t.id, anim: 'play', ms: 1500 };
        fx.bubble = { id: t.id, text: sp === 'kitten' ? 'Mew mew! 💕' : sp === 'bunny' ? 'Sniff sniff! Hop hop! 💕' : 'Woof woof! 💕' }; fx.sfx = 'pop'; fx.events.push('pet-play');
        return true;
      }
      return false;
    }
    if (has(td, 'stove') && has(dd, 'cookable') && dd.cooksInto) {
      P(d.id, { x: t.x, y: top, state: withState(d, { on: t.id, cooking: true }) });
      fx.sfx = 'whoosh'; fx.bubble = { id: d.id, text: 'Sizzle…' };
      fx.later = { ms: 1900, patches: [{ id: d.id, patch: { ref: dd.cooksInto, state: { on: t.id } } }], sfx: 'pop', bubble: { id: d.id, text: 'Ding! Ready!' }, events: ['cook'] };
      return true;
    }
    if (has(td, 'sink') && has(dd, 'washable')) {
      P(d.id, { x: t.x, y: top, state: withState(d, { on: t.id }) });
      fx.anim = { id: d.id, anim: 'wash', ms: 1300 }; fx.bubble = { id: d.id, text: 'Washed! ✨' };
      fx.sfx = 'splash'; fx.events.push('wash');
      return true;
    }
    if (has(td, 'block') && has(dd, 'block')) {
      P(d.id, { x: t.x, y: t.y - ts.h + 3, state: withState(d, { on: t.id }) });
      let height = 2; let cur: Entity | undefined = t;
      while (cur && getState<string>(cur, 'on')) { cur = byId.get(getState<string>(cur, 'on')!); if (cur && ITEMS[cur.ref]?.tags.includes('block')) height++; else break; }
      fx.sfx = 'pop';
      if (height === 4) { fx.events.push('tower4'); fx.bubble = { id: d.id, text: '4 blocks tall! 🏗️' }; }
      return true;
    }
    if ((has(td, 'table') || has(td, 'stove')) && (has(dd, 'small') || has(dd, 'decor'))) {
      P(d.id, { x: clamp(x, t.x - ts.w / 2 + 25, t.x + ts.w / 2 - 25), y: top, state: withState(d, { on: t.id }) });
      fx.sfx = 'tap';
      return true;
    }
    return false;
  };

  if (!candidates.some(tryRule)) {
    const actor = d.kind !== 'item';
    const floorOnly = actor || has(dd, 'floor');
    let ny = clamp(y, floorOnly ? horizon + 70 : 40, 695);
    // Things fall to the floor (or float up, for balloons) like real toys.
    if (!actor && has(dd, 'float')) ny = 110 + Math.random() * 90;
    else if (!actor && !has(dd, 'wall') && !has(dd, 'small') && !dd?.emoji && !dd?.img) ny = Math.max(ny, horizon + 12); // big furniture stands where you put it, against the wall at the back
    else if (!actor && !has(dd, 'wall') && ny < horizon + 55) { ny = horizon + 60 + Math.random() * 45; fx.bursts = [{ id: d.id, emoji: '💫' }]; }
    const half = Math.min(sizeOf(d, look).w / 2, 200) - 30; // keep the whole thing on screen
    P(d.id, { x: clamp(x, xMin + Math.max(0, half), xMax - Math.max(0, half)), y: ny, ...(actor ? { pose: 'stand' as const } : {}), state: withState(d, { on: undefined }) });
    fx.sfx = 'tap';
  }

  // things resting on the dragged entity travel with it
  const mine = fx.patches.find((p) => p.id === d.id)?.patch;
  if (mine && mine.x !== undefined && mine.y !== undefined && !fx.moveTo) {
    const dx = mine.x - d.x, dy = mine.y - d.y;
    for (const id of deps) {
      const e = byId.get(id)!;
      if (!fx.patches.some((p) => p.id === id)) P(id, { x: e.x + dx, y: e.y + dy });
    }
  } else if (fx.moveTo || fx.remove.includes(d.id)) {
    for (const id of deps) { const e = byId.get(id)!; P(id, { state: withState(e, { on: undefined }), y: clamp(e.y + 40, horizon + 70, 695) }); }
  }
  return fx;
}
