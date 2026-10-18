import type React from 'react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Entity, SceneId } from '../engine/types';
import { useGame, sceneOf } from '../engine/store';
import { ITEMS, has } from '../data/items';
import { LAYERED } from '../data/sprites';
import { SCENES } from '../data/scenes';
import { SECRETS, VISITORS } from '../data/catalog';
import { ROOM_H, ROOM_W, dependentsOf, depthOf, getState, resolveDrop, sizeOf, withState, type Effect, type Lookup } from '../engine/interactions';
import { type Mood } from './art/Character';
import { Person, PetPic } from './Person';
import { ItemIcon } from './ItemIcon';
import { FurnitureArt } from './art/Furniture';
import { RoomBackdrop } from './RoomBackdrop';
import { Bubble } from '../ui/kit';
import { sfx } from '../engine/sfx';
import { uid } from '../engine/ids';

interface Drag {
  id: string; ox: number; oy: number;   // grab offset (room units)
  sx: number; sy: number;               // pointer start (screen px)
  x: number; y: number;                 // current feet position
  orig: { x: number; y: number };
  moved: boolean; deps: Set<string>;
  overTrash: boolean;
  /** Pressed on something the character is wearing (tap = take it off). */
  wearSlot?: 'head' | 'eyes' | 'ears' | 'bag';
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const GREET = ['Hi there!', 'What should we do?', 'Let’s play!', 'I’m ready!', 'Hehe!', 'Wheee!'];

export function Room({ sceneId, onCustomTap, onWardrobe, townNight = false, onEdge, onCross, onMovedTo }: {
  /** While dragging: where the finger is (null when let go), so the scrolling house can follow it. */
  onEdge?: (clientX: number | null) => void;
  /** Dropped past the left/right side of this room: move it into the next room. Return true if it moved. */
  onCross?: (e: Entity, dir: -1 | 1, y: number, deps: string[]) => boolean;
  /** Someone went through a door to another room. */
  onMovedTo?: (scene: SceneId) => void;
  /** It's night in town (the map's day/night): rooms get dark and windows show the night sky. */
  townNight?: boolean;
  sceneId: SceneId;
  onCustomTap?: (e: Entity) => void;
  onWardrobe?: (characterId: string) => void;
}) {
  const { game, dispatch } = useGame();
  const def = SCENES[sceneId];
  const entities = sceneOf(game, sceneId);
  const byId = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);
  const look: Lookup = useMemo(() => ({
    character: (id) => game.characters.find((c) => c.id === id),
    pet: (id) => game.pets.find((p) => p.id === id) ?? VISITORS[id],
  }), [game.characters, game.pets]);

  const roomRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;
  const [bubbles, setBubbles] = useState<Record<string, { text: string; key: string }>>({});
  const [anims, setAnims] = useState<Record<string, string>>({});
  const [spawnFor, setSpawnFor] = useState<string | null>(null);
  const [bursts, setBursts] = useState<{ key: string; id: string; emoji: string }[]>([]);
  const [strolling, setStrolling] = useState<Record<string, number>>({});
  const [marks, setMarks] = useState<{ key: string; x: number; y: number }[]>([]);
  const bgTap = useRef<{ x: number; y: number; t: number } | null>(null);
  const tapLog = useRef<Record<string, number[]>>({});
  const burst = (id: string, emoji: string) => {
    const key = uid('p');
    setBursts((b) => [...b, { key, id, emoji }]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.key !== key)), 1100);
  };

  // first visit: persist the default layout so later edits have a base
  useEffect(() => {
    dispatch({ type: 'ENSURE_SCENE', scene: sceneId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  const say = (id: string, text: string) => {
    const key = uid('b');
    setBubbles((b) => ({ ...b, [id]: { text, key } }));
    window.setTimeout(() => setBubbles((b) => (b[id]?.key === key ? (({ [id]: _, ...rest }) => rest)(b) : b)), 2000);
  };
  const play = (id: string, anim: string, ms = 900) => {
    setAnims((a) => ({ ...a, [id]: anim }));
    window.setTimeout(() => setAnims((a) => (a[id] === anim ? (({ [id]: _, ...rest }) => rest)(a) : a)), ms);
  };
  const patch = (patches: Effect['patches']) => patches.length && dispatch({ type: 'PATCH_ENTITIES', scene: sceneId, patches });

  // ── Pets wander or follow their friend ──
  useEffect(() => {
    const t = window.setInterval(() => {
      const list = sceneOf(game, sceneId);
      const patches: Effect['patches'] = [];
      for (const p of list) {
        if (p.kind !== 'pet' || p.pose === 'sleep' || dragRef.current?.id === p.id) continue;
        if (Math.random() < 0.35) continue;
        const friend = getState<string>(p, 'follow') && list.find((e) => e.kind === 'character' && e.ref === getState<string>(p, 'follow'));
        const tx = friend ? friend.x + (friend.x > 500 ? -90 : 90) : 80 + Math.random() * 840;
        const ty = friend ? Math.min(692, Math.max(def.horizon + 80, friend.y + 10)) : def.horizon + 90 + Math.random() * (690 - def.horizon - 90);
        patches.push({ id: p.id, patch: { x: tx, y: ty, state: withState(p, { face: tx < p.x ? -1 : 1, walking: Date.now() }) } });
      }
      patch(patches);
    }, 3200);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, sceneId]);

  // ── Idle life: characters do little things on their own ──
  useEffect(() => {
    const t = window.setInterval(() => {
      if (dragRef.current) return;
      const people = sceneOf(game, sceneId).filter((e) => e.kind === 'character' && e.pose !== 'sleep');
      if (!people.length || Math.random() < 0.4) return;
      const who = people[Math.floor(Math.random() * people.length)];
      const r = Math.random();
      if (r < 0.45) { play(who.id, 'hop', 600); burst(who.id, ['🎵', '✨', '💭', '⭐'][Math.floor(Math.random() * 4)]); }
      else if (r < 0.62) { play(who.id, 'happy', 1400); say(who.id, ['La la la 🎵', 'What a nice day!', 'Let’s play!', 'Hmm…'][Math.floor(Math.random() * 4)]); }
      else if (r < 0.75) { play(who.id, 'sad', 2200); say(who.id, ['I’m hungry…', 'I’m a little bored…', 'Can we play?'][Math.floor(Math.random() * 3)]); }
      else play(who.id, 'wave', 1200);
    }, 6500);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, sceneId]);

  // ── Pointer → room coordinates ──
  const toRoom = (cx: number, cy: number) => {
    const r = roomRef.current!.getBoundingClientRect();
    return { x: ((cx - r.left) / r.width) * ROOM_W, y: ((cy - r.top) / r.height) * ROOM_H };
  };
  const overTrash = (cx: number, cy: number) => {
    const r = trashRef.current?.getBoundingClientRect();
    return !!r && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
  };

  const handPos = (holder: Entity) => {
    const s = sizeOf(holder, look);
    const adult = look.character(holder.ref)?.age === 'adult';
    return { x: holder.x + s.w * 0.23, y: holder.y - s.h * (holder.pose === 'sit' ? 0.14 : adult ? 0.26 : 0.21) };
  };

  /** The play area reaches the screen edges: on wide screens that is past the room's 0–1000 box. */
  const playBounds = (): [number, number] => {
    const r = roomRef.current?.getBoundingClientRect(); const w = wrapRef.current?.getBoundingClientRect();
    if (!r || !w || !r.width) return [30, 970];
    const extra = Math.max(0, ((w.width - r.width) / 2 / r.width) * ROOM_W);
    return [30 - extra, 970 + extra];
  };

  const onDown = (e: Entity, ev: React.PointerEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    const p = toRoom(ev.clientX, ev.clientY);
    const pos = e.heldBy && byId.get(e.heldBy) ? handPos(byId.get(e.heldBy)!) : { x: e.x, y: e.y };
    setDrag({
      id: e.id, ox: pos.x - p.x, oy: pos.y - p.y, sx: ev.clientX, sy: ev.clientY,
      x: pos.x, y: pos.y, orig: pos, moved: false, deps: dependentsOf(e.id, entities), overTrash: false,
      wearSlot: e.kind === 'character' ? ((ev.target as Element).closest?.('[data-wear]')?.getAttribute('data-wear') as Drag['wearSlot']) ?? undefined : undefined,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const move = (ev: PointerEvent) => {
      const d = dragRef.current; if (!d) return;
      const e = byId.get(d.id);
      const fixed = e?.kind === 'item' && ITEMS[e.ref]?.fixed;
      const moved = d.moved || Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) > 8;
      if (fixed) { if (moved !== d.moved) setDrag({ ...d, moved }); return; }
      const p = toRoom(ev.clientX, ev.clientY);
      if (moved) onEdge?.(ev.clientX);
      setDrag({ ...d, moved, x: p.x + d.ox, y: p.y + d.oy, overTrash: overTrash(ev.clientX, ev.clientY) });
    };
    const up = (ev: PointerEvent) => {
      const d = dragRef.current; setDrag(null); onEdge?.(null);
      if (!d) return;
      const e = byId.get(d.id); if (!e) return;
      const fixed = e.kind === 'item' && ITEMS[e.ref]?.fixed;
      if (!d.moved) { if (d.wearSlot && e.kind === 'character') takeOff(e, d.wearSlot); else onTap(e, ev.clientX, ev.clientY); return; }
      if (fixed) return;
      const hit = toRoom(ev.clientX, ev.clientY);
      const wr = wrapRef.current?.getBoundingClientRect();
      if (onCross && wr && !overTrash(ev.clientX, ev.clientY) && (ev.clientX < wr.left || ev.clientX > wr.right)) {
        if (e.heldBy) patch([{ id: e.heldBy, patch: { holding: undefined } }]);
        const deps = e.kind === 'item' ? [...dependentsOf(e.id, entities)].filter((id) => byId.get(id)?.kind === 'item') : [];
        if (onCross({ ...e, heldBy: undefined }, ev.clientX < wr.left ? -1 : 1, Math.min(695, Math.max(def.horizon + 60, d.y)), deps)) { sfx('whoosh'); return; }
      }
      onDrop(e, hit.x, hit.y, d.x, d.y, overTrash(ev.clientX, ev.clientY));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null, entities]);

  // ── Drop ──
  const onDrop = (e: Entity, hx: number, hy: number, x: number, y: number, trash: boolean) => {
    const pre: Effect['patches'] = [];
    let d = e;
    if (e.heldBy) {                 // pulled out of someone's hand
      pre.push({ id: e.heldBy, patch: { holding: undefined } });
      const holder = byId.get(e.heldBy);
      if (holder?.kind === 'character') { play(holder.id, 'grumpy', 1500); say(holder.id, ['Hey, I was holding that!', 'Hmph!', 'That’s mine!'][Math.floor(Math.random() * 3)]); }
      d = { ...e, heldBy: undefined, x, y };
    }
    if (trash && e.kind === 'pet' && VISITORS[e.ref]) { say(e.id, 'I’m a patient here!'); sfx('tap'); return; }
    if (trash) {
      sfx('whoosh');
      if (e.kind === 'item') {
        const deps = [...dependentsOf(e.id, entities)];
        patch(pre);
        dispatch({ type: 'REMOVE_ENTITIES', scene: sceneId, ids: [e.id, ...deps.filter((id) => byId.get(id)?.kind === 'item')] });
        const name = ITEMS[e.ref]?.name ?? 'It';
        const furniture = !has(ITEMS[e.ref], 'small') && !ITEMS[e.ref]?.emoji;
        if (furniture) dispatch({ type: 'OWN', id: e.ref });   // big furniture always goes to My stuff, never lost
        dispatch({ type: 'TOAST', text: game.owned.includes(e.ref) || furniture
          ? `📦 ${name} is in My stuff. Tap My stuff to put it back.`
          : `👍 ${name} went back where it came from. Get another from the fridge, cupboard or toy box!` });
      } else {
        dispatch({ type: 'REMOVE_ACTOR', kind: e.kind, ref: e.ref });
      }
      return;
    }
    const [xMin, xMax] = playBounds();
    const fx = resolveDrop(d, hx, hy, x, y, entities.map((v) => (v.id === d.id ? d : v)), look, def.horizon, xMin, xMax);
    if (pre.length || fx.patches.length) {
      const merged = [...pre];
      for (const p of fx.patches) {
        const i = merged.findIndex((m) => m.id === p.id);
        if (i >= 0) merged[i] = { id: p.id, patch: { ...merged[i].patch, ...p.patch } }; else merged.push(p);
      }
      if (e.heldBy && !merged.some((m) => m.id === e.id && 'heldBy' in m.patch)) merged.push({ id: e.id, patch: { heldBy: undefined } });
      patch(merged);
    }
    if (fx.remove.length) dispatch({ type: 'REMOVE_ENTITIES', scene: sceneId, ids: fx.remove });
    if (fx.moveTo) {
      dispatch({ type: 'PLACE_ACTOR', to: fx.moveTo.scene, entity: fx.moveTo.entity });
      onMovedTo?.(fx.moveTo.scene);
      const who = e.kind === 'character' ? look.character(e.ref)?.name : look.pet(e.ref)?.name;
      dispatch({ type: 'TOAST', text: `${who ?? 'They'} went to the ${SCENES[fx.moveTo.scene].label.toLowerCase()}` });
    }
    if (fx.sfx) sfx(fx.sfx);
    if (fx.bubble) say(fx.bubble.id, fx.bubble.text);
    if (fx.anim) play(fx.anim.id, fx.anim.anim, fx.anim.ms);
    fx.anims?.forEach((a) => play(a.id, a.anim, a.ms));
    fx.bursts?.forEach((b) => burst(b.id, b.emoji));
    if (fx.wear) dispatch({ type: 'WEAR', character: fx.wear.character, slot: fx.wear.slot, item: fx.wear.item });
    fx.events.forEach((name) => dispatch({ type: 'EVENT', name }));
    if (fx.later) {
      const later = fx.later;
      window.setTimeout(() => {
        dispatch({ type: 'PATCH_ENTITIES', scene: sceneId, patches: later.patches });
        if (later.sfx) sfx(later.sfx);
        if (later.bubble) say(later.bubble.id, later.bubble.text);
        later.events?.forEach((name) => dispatch({ type: 'EVENT', name }));
      }, later.ms);
    }
  };

  // ── Tap ──
  /** Tap a worn hat / glasses / headphones / bag: it comes off and lands on the floor beside them. */
  const takeOff = (e: Entity, slot: NonNullable<Drag['wearSlot']>) => {
    const c = look.character(e.ref); const item = c?.wear?.[slot]; if (!item) return;
    dispatch({ type: 'WEAR', character: e.ref, slot, item: null });
    dispatch({ type: 'ADD_ENTITY', scene: sceneId, entity: { id: uid('it'), kind: 'item', ref: item, x: Math.min(playBounds()[1], e.x + 75), y: Math.min(695, Math.max(e.y, def.horizon + 60)) } });
    say(e.id, ['Off it comes!', 'Taking it off!', 'There you go!'][Math.floor(Math.random() * 3)]); sfx('pop');
  };

  const onTap = (e: Entity, cx?: number, cy?: number) => {
    if (e.kind === 'character') {
      dispatch({ type: 'SET_ACTIVE', id: e.ref });
      if (e.holding) {
        patch([{ id: e.holding, patch: { heldBy: undefined, x: e.x + 70, y: Math.max(e.y, def.horizon + 80) } }, { id: e.id, patch: { holding: undefined } }]);
        sfx('pop'); return;
      }
      if (e.pose && e.pose !== 'stand') {
        const seat = byId.get(getState<string>(e, 'on') ?? '');
        patch([{ id: e.id, patch: { pose: 'stand', y: Math.min(695, (seat ? seat.y : e.y) + 18), state: withState(e, { on: undefined }) } }]);
        say(e.id, e.pose === 'sleep' ? 'Good morning! ☀️' : 'Up I go!'); sfx('pop'); return;
      }
      const now = Date.now();
      const log = (tapLog.current[e.id] = [...(tapLog.current[e.id] ?? []), now].filter((t0) => now - t0 < 1300));
      if (log.length >= 3) {
        tapLog.current[e.id] = [];
        play(e.id, 'tickle', 2000); say(e.id, ['Hehe! That tickles!', 'Stop it! Hahaha!', 'Giggle giggle!'][Math.floor(Math.random() * 3)]);
        burst(e.id, '😆'); sfx('sparkle'); dispatch({ type: 'EVENT', name: 'tickle' });
        return;
      }
      play(e.id, 'hop', 600); say(e.id, GREET[Math.floor(Math.random() * GREET.length)]); sfx('tap');
      return;
    }
    if (e.kind === 'pet') {
      const pet = look.pet(e.ref);
      const active = game.activeCharacterId;
      const following = getState<string>(e, 'follow');
      const follow = following ? undefined : active;
      patch([{ id: e.id, patch: { pose: 'stand', state: withState(e, { follow, on: undefined }) } }]);
      play(e.id, 'play', 1000); sfx('pop');
      const friend = follow && look.character(follow)?.name;
      say(e.id, friend ? `${pet?.species === 'kitten' ? 'Mew' : pet?.species === 'bunny' ? 'Hop hop' : 'Woof'}! Following ${friend} 💕` : '💕 Exploring!');
      return;
    }
    const d = ITEMS[e.ref]; const t = d?.tap;
    if (!t && has(d, 'floor') && cx !== undefined && cy !== undefined) { walkTo(cx, cy); return; }   // rugs and mats are floor: walk there
    if (!t) { react(e); return; }
    switch (t.type) {
      case 'toggle': patch([{ id: e.id, patch: { state: withState(e, { lit: !isOn(e), ...(getState(e, 'on') === true || getState(e, 'on') === false ? { on: undefined } : {}) }) } }]); sfx(t.sfx ?? 'click'); break;
      case 'spawn': if (t.toggle) patch([{ id: e.id, patch: { state: withState(e, { on: true }) } }]); setSpawnFor(e.id); sfx('pop'); break;
      case 'wardrobe': {
        patch([{ id: e.id, patch: { state: withState(e, { on: true }) } }]);
        const here = entities.filter((v) => v.kind === 'character');
        const who = here.find((v) => v.ref === game.activeCharacterId) ?? here[0];
        sfx('pop');
        if (who) onWardrobe?.(who.ref); else dispatch({ type: 'TOAST', text: 'Bring a character into this room first!' });
        window.setTimeout(() => dispatch({ type: 'PATCH_ENTITIES', scene: sceneId, patches: [{ id: e.id, patch: { state: withState(e, { on: false }) } }] }), 1200);
        break;
      }
      case 'custom': onCustomTap?.(e); break;
      case 'roll': {
        const dir = e.x > 500 ? -1 : 1;
        const [bl, br] = playBounds(); const nx = Math.max(bl + 10, Math.min(br - 10, e.x + dir * (160 + Math.random() * 180)));
        patch([{ id: e.id, patch: { x: nx, y: Math.max(e.y, def.horizon + 60), state: withState(e, { on: undefined }) } }]);
        play(e.id, 'spin', 800); sfx(t.sfx ?? 'pop');
        if (t.bubble) say(e.id, t.bubble[Math.floor(Math.random() * t.bubble.length)]);
        break;
      }
      case 'pop':
        sfx('bang'); burst(e.id, '💥');
        if (e.heldBy) patch([{ id: e.heldBy, patch: { holding: undefined } }]);
        dispatch({ type: 'REMOVE_ENTITIES', scene: sceneId, ids: [e.id] });
        break;
      case 'anim': play(e.id, t.anim, 1000); if (t.sfx) sfx(t.sfx); if (t.bubble) say(e.id, t.bubble[Math.floor(Math.random() * t.bubble.length)]); break;
      case 'secret': {
        const taps = (getState<number>(e, 'taps') ?? 0) + 1;
        if (t.anim) play(e.id, t.anim, 700);
        sfx(t.sfx ?? 'tap');
        if (taps >= t.taps) {
          patch([{ id: e.id, patch: { state: withState(e, { taps: 0 }) } }]);
          if (game.secrets.includes(t.secretId)) say(e.id, 'Hehe, you found me already!');
          else { sfx('sparkle'); dispatch({ type: 'FIND_SECRET', id: t.secretId }); }
        } else {
          patch([{ id: e.id, patch: { state: withState(e, { taps }) } }]);
          if (t.taps > 1 && taps === 1 && !game.secrets.includes(t.secretId)) say(e.id, 'Hmm? Keep tapping…');
        }
        break;
      }
    }
  };

  /** Things with no special tap still do something fun. */
  const react = (e: Entity) => {
    const d = ITEMS[e.ref];
    const food = has(d, 'food');
    const r = Math.random();
    if (food) { play(e.id, 'hop', 600); burst(e.id, ['😋', '✨', '💛'][Math.floor(r * 3)]); say(e.id, [`Yummy ${d.name.toLowerCase()}!`, 'Feed me to someone!', 'Mmm!'][Math.floor(r * 3)]); sfx('pop'); return; }
    if (d?.emoji) { play(e.id, r < 0.5 ? 'spin' : 'hop', 800); burst(e.id, ['✨', '⭐', '🎵', '💫'][Math.floor(r * 4)]); say(e.id, d.name); sfx(r < 0.5 ? 'sparkle' : 'pop'); return; }
    play(e.id, 'hop', 500); say(e.id, d?.name ?? ''); sfx('tap');
  };

  /** Tap the floor: the active character walks there (Toca style). */
  const walkTo = (cx: number, cy: number) => {
    const p = toRoom(cx, cy);
    const [xMin, xMax] = playBounds();
    const x = Math.max(xMin, Math.min(xMax, p.x));
    const y = Math.max(def.horizon + 60, Math.min(695, p.y));
    const key = uid('m'); setMarks((m) => [...m, { key, x, y }]);
    window.setTimeout(() => setMarks((m) => m.filter((v) => v.key !== key)), 900);
    const people = entities.filter((v) => v.kind === 'character' && v.pose !== 'sleep' && !v.heldBy);
    const who = people.find((v) => v.ref === game.activeCharacterId) ?? people[0];
    if (!who) { sfx('tap'); return; }
    const dist = Math.hypot(x - who.x, y - who.y); if (dist < 12) return;
    const ms = Math.min(1800, 500 + dist * 1.6);
    setStrolling((s) => ({ ...s, [who.id]: ms }));
    window.setTimeout(() => setStrolling((s) => (({ [who.id]: _, ...rest }) => rest)(s)), ms + 60);
    play(who.id, 'walk', ms);
    patch([{ id: who.id, patch: { x, y, pose: 'stand', state: withState(who, { on: undefined }) } }]);
    sfx('tap');
  };

  const closeSpawn = () => {
    const e = spawnFor && byId.get(spawnFor);
    if (e && ITEMS[e.ref]?.tap?.type === 'spawn' && (ITEMS[e.ref].tap as { toggle?: boolean }).toggle)
      patch([{ id: e.id, patch: { state: withState(e, { on: false }) } }]);
    setSpawnFor(null);
  };
  const spawn = (ref: string) => {
    const src = spawnFor && byId.get(spawnFor); if (!src) return;
    const x = Math.min(950, Math.max(50, src.x + (src.x > 500 ? -1 : 1) * (110 + Math.random() * 120)));
    const y = 662 + Math.random() * 28;
    dispatch({ type: 'ADD_ENTITY', scene: sceneId, entity: { id: uid('it'), kind: 'item', ref, x, y } });
    sfx('pop');
  };

  // ── Render helpers ──
  const night = townNight || entities.some((e) => e.ref === 'window' && isOn(e));
  const lampOn = entities.some((e) => (e.ref === 'lamp' || e.ref === 'lamp-pink') && isOn(e));
  const isActive = (e: Entity) =>
    (e.ref === 'stove' && entities.some((v) => getState<string>(v, 'on') === e.id && getState<boolean>(v, 'cooking'))) ||
    (e.ref === 'shower' && entities.some((v) => v.kind === 'character' && getState<string>(v, 'on') === e.id && anims[v.id] === 'shower'));

  const sorted = [...entities].sort((a, b) => {
    const da = drag?.id === a.id || drag?.deps.has(a.id) ? 1e5 + depthOf(a, byId) : depthOf(a, byId);
    const db = drag?.id === b.id || drag?.deps.has(b.id) ? 1e5 + depthOf(b, byId) : depthOf(b, byId);
    return da - db;
  });

  const renderInner = (e: Entity, holderMood?: Mood): ReactNode => {
    const anim = anims[e.id];
    if (e.kind === 'character') {
      const c = look.character(e.ref); if (!c) return null;
      const holds = e.holding ? byId.get(e.holding)?.ref : undefined;
      const carried = drag?.id === e.id && drag.moved;
      const mood: Mood = holderMood ?? (carried ? 'wow' : anim === 'sad' ? 'sad' : anim === 'grumpy' ? 'grumpy' : anim === 'eat' ? 'eat' : anim === 'brush' ? 'brush' : anim === 'tickle' ? 'silly' : anim === 'wave' || anim === 'hugl' || anim === 'hugr' ? 'wink' : anim === 'check' || anim === 'hop' || anim === 'happy' ? 'happy' : holds && ['teddy', 'balloon', 'cupcake', 'ball'].includes(holds) ? 'happy' : 'normal');
      const art = <Person c={c} pose={e.pose === 'sleep' ? 'stand' : e.pose} mood={e.pose === 'sleep' ? 'sleep' : mood} bandage={!!getState(e, 'bandage')} />;
      if (e.pose === 'sleep') {
        const st = sizeOf({ ...e, pose: 'stand' }, look);
        const sl = sizeOf(e, look);
        return (
          <>
            <div className="absolute left-1/2 top-1/2" style={{ width: `${(st.w / sl.w) * 100}%`, height: `${(st.h / sl.h) * 100}%`, transform: 'translate(-50%,-50%) rotate(-90deg)' }}>{art}</div>
            <div className="zzz absolute -top-6 right-2 font-display font-extrabold text-ink text-[clamp(12px,2vw,22px)]">z z Z</div>
          </>
        );
      }
      return <>{art}{anim === 'shower' && <div className="suds absolute inset-x-0 top-0 h-1/3" />}</>;
    }
    if (e.kind === 'pet') {
      const p = look.pet(e.ref); if (!p) return null;
      const face = getState<number>(e, 'face') ?? 1;
      return <div className="w-full h-full" style={{ transform: `scaleX(${-face})` }}><PetPic p={p} sleeping={e.pose === 'sleep'} bandage={!!getState(e, 'bandage')} /></div>;
    }
    const d = ITEMS[e.ref]; if (!d) return null;
    if (d.img) return (
      <div className="w-full h-full relative">
        <img src={d.img} alt="" draggable={false} className="sprite-img" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
    if (d.emoji) return (
      <div className="w-full h-full grid place-items-center sticker">
        <span style={{ fontSize: 'min(100%, 1em)' }} className="emoji leading-none select-none">{d.emoji}</span>
        {getState(e, 'cooking') ? <span className="steam absolute -top-1/2 left-1/2 -translate-x-1/2">♨️</span> : null}
      </div>
    );
    const to = getState<SceneId>(e, 'to');
    const doorIcon = to ? ({ 'home-kitchen': '🍳', 'home-bedroom': '🛏️', 'home-living': '🛋️', 'home-bathroom': '🛁' } as Record<string, string>)[to] : undefined;
    if (d.paint) {
      const on = isOn(e);
      return (
        <div className="w-full h-full relative">
          {(e.ref === 'lamp' || e.ref === 'lamp-pink') && on && <div className="lamp-glow absolute pointer-events-none" />}
          <img src={d.paint} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill' }} />
          {e.ref === 'tv' && on && <div className="tv-screen absolute" style={{ left: '12.5%', top: '1.5%', width: '75.5%', height: '56%' }} />}
        </div>
      );
    }
    return <FurnitureArt art={d.art!} w={d.w} h={d.h} on={isOn(e)} active={isActive(e)} variant={e.ref} label={doorIcon} img={getState<string>(e, 'img')} />;
  };

  const spawnSrc = spawnFor ? byId.get(spawnFor) : undefined;
  const spawnDef = spawnSrc && ITEMS[spawnSrc.ref];

  return (
    <div ref={wrapRef} className="room-wrap full relative w-full h-full grid place-items-center overflow-hidden"
      onPointerDown={(ev) => { bgTap.current = spawnFor || (ev.target as Element).closest?.('button, .entity') ? null : { x: ev.clientX, y: ev.clientY, t: Date.now() }; }}
      onPointerUp={(ev) => { const b = bgTap.current; bgTap.current = null; if (b && !drag && Math.hypot(ev.clientX - b.x, ev.clientY - b.y) < 10 && Date.now() - b.t < 600) walkTo(ev.clientX, ev.clientY); }}
      onPointerCancel={() => { bgTap.current = null; }}>
      <div className="room room-ext relative pointer-events-none" aria-hidden><RoomBackdrop def={def} extend /></div>
      <div ref={roomRef} className="room relative select-none" style={{ touchAction: onEdge ? 'pan-x' : 'none' }}>
        <RoomBackdrop def={def} />
        {/* night in town: the painted window shows the night sky (even in rooms saved without a window item) */}
        {townNight && def.anchors?.window?.box && !entities.some((e) => e.ref === 'window') && (() => { const b = def.anchors!.window!.box!; return (
          <div className="painted-night absolute rounded-md pointer-events-none" style={{ left: pct(b[0] + b[2] * 0.04, ROOM_W), top: pct(b[1] + b[3] * 0.04, ROOM_H), width: pct(b[2] * 0.92, ROOM_W), height: pct(b[3] * 0.92, ROOM_H) }} />
        ); })()}
        {sorted.map((e) => {
          if (e.heldBy && byId.get(e.heldBy) && drag?.id !== e.id) return null; // drawn in the holder's hand
          const anchor = e.kind === 'item' ? def.anchors?.[e.ref] : undefined;
          if (anchor?.hide && !anchor.box) return null;     // painted into the background
          const s0 = sizeOf(e, look);
          const s = anchor?.box ? { w: anchor.box[2], h: anchor.box[3] } : s0;
          const dragging = drag?.id === e.id && drag.moved;
          const depOffset = drag?.moved && drag.deps.has(e.id) ? { x: drag.x - drag.orig.x, y: drag.y - drag.orig.y } : { x: 0, y: 0 };
          const fixed = e.kind === 'item' && ITEMS[e.ref]?.fixed;
          const x = anchor?.box ? anchor.box[0] + anchor.box[2] / 2 : (dragging && !fixed ? drag.x : e.x) + depOffset.x;
          const y = anchor?.box ? anchor.box[1] + anchor.box[3] : (dragging && !fixed ? drag.y : e.y) + depOffset.y;
          const held = e.holding ? byId.get(e.holding) : undefined;
          const isEmoji = e.kind === 'item' && !!ITEMS[e.ref]?.emoji;
          const active = e.kind === 'character' && e.ref === game.activeCharacterId;
          // Hand-drawn people sink into their seat: draw the seat's front again on top of them.
          const onIt = e.kind === 'character' && !dragging ? byId.get(getState<string>(e, 'on') ?? '') : undefined;
          const onDef = onIt && onIt.kind === 'item' ? ITEMS[onIt.ref] : undefined;
          const seat = onIt && ((e.pose === 'sit' && LAYERED[look.character(e.ref)?.sprite ?? '']) || onDef?.front) ? onIt : undefined;
          const seatDef = seat ? onDef : undefined;
          const frontFrac = seatDef?.front;
          const seatFront = seat && seatDef && !has(seatDef, 'behind') && (seatDef.front || seatDef.seatLift) ? (() => {
            const ss = sizeOf(seat, look);
            const top = frontFrac ?? (ss.h - seatDef.seatLift!) / ss.h;
            return (
              <div key={`${e.id}-seatfront`} className="absolute pointer-events-none"
                style={{ left: pct(seat.x - ss.w / 2, ROOM_W), top: pct(seat.y - ss.h, ROOM_H), width: pct(ss.w, ROOM_W), height: pct(ss.h, ROOM_H), clipPath: `inset(${top * 100}% 0 0 0)` }}>
                <div className="w-full h-full relative">{renderInner(seat)}</div>
              </div>
            );
          })() : null;
          return [
            <div
              key={e.id}
              className={`entity absolute ${dragging ? 'dragging' : ''} ${e.kind === 'pet' && !dragging ? 'walking' : ''} ${strolling[e.id] && !dragging ? 'strolling' : ''} ${fixed ? 'fixed-item' : 'movable'}`}
              style={{ transitionDuration: strolling[e.id] && !dragging ? `${strolling[e.id]}ms` : undefined, left: pct(x - s.w / 2, ROOM_W), top: pct(y - s.h, ROOM_H), width: pct(s.w, ROOM_W), height: pct(s.h, ROOM_H), fontSize: isEmoji ? `${(s.h / ROOM_H) * 100 * 0.8}cqh` : undefined, zIndex: dragging ? 999 : undefined }}
              onPointerDown={(ev) => onDown(e, ev)}
              aria-label={e.kind === 'item' ? ITEMS[e.ref]?.name : e.kind === 'pet' ? look.pet(e.ref)?.name : look.character(e.ref)?.name}
            >
              {active && e.pose !== 'sleep' && <div className="active-ring absolute left-1/2 -translate-x-1/2 -bottom-[3%] w-[90%] h-[8%] rounded-[50%]" />}
              <div className={`w-full h-full relative ${anims[e.id] ? `anim-${anims[e.id]}` : ''}`}>{anchor?.hide
                ? (e.ref === 'window' && (isOn(e) || townNight) ? <div className="painted-night absolute inset-[4%] rounded-md" /> : null)
                : renderInner(e)}</div>
              {held && (() => {
                const hs = sizeOf(held, look);
                const hp = handPos(e);
                return (
                  <div className="absolute pointer-events-auto" onPointerDown={(ev) => onDown(held, ev)}
                    style={{ left: `${((hp.x - (x - s.w / 2) - hs.w * 0.35) / s.w) * 100}%`, top: `${((hp.y - (y - s.h) - hs.h * 0.7) / s.h) * 100}%`, width: `${(hs.w * 0.7 / s.w) * 100}%`, height: `${(hs.h * 0.7 / s.h) * 100}%`, fontSize: `${(hs.h * 0.7 / ROOM_H) * 100 * 0.8}cqh` }}>
                    {renderInner(held)}
                  </div>
                );
              })()}
              {bubbles[e.id] && <Bubble key={bubbles[e.id].key} text={bubbles[e.id].text} />}
              {bursts.filter((b) => b.id === e.id).map((b, i) => <span key={b.key} className="burst" style={{ ['--bx' as string]: `${(i % 3 - 1) * 26}px` }}>{b.emoji}</span>)}
            </div>,
            seatFront,
          ];
        })}

        {marks.map((m) => <span key={m.key} className="walk-mark" style={{ left: pct(m.x, ROOM_W), top: pct(m.y, ROOM_H) }} />)}
        {spawnSrc && spawnDef?.tap?.type === 'spawn' && (
          <div className="spawn-layer absolute inset-0 z-[980] bg-ink/25 grid place-items-center" onPointerDown={(ev) => ev.target === ev.currentTarget && closeSpawn()}>
            <div className="pop-in rounded-[24px] border-[4px] border-ink bg-white shadow-chunky p-3 max-w-[92%]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="font-display font-extrabold text-ink text-lg">{spawnDef.name}: tap to take out</div>
                <button onClick={closeSpawn} className="w-10 h-10 rounded-full border-[3px] border-ink bg-berry text-white font-display">✕</button>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {spawnDef.tap.items.map((ref) => (
                  <button key={ref} onClick={() => spawn(ref)} className="spawn-btn w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-[3px] border-ink bg-sky/30 grid place-items-center text-3xl sm:text-4xl shadow-chunkysm" aria-label={ITEMS[ref].name}>
                    <ItemIcon id={ref} size={52} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={trashRef} className={`trash fixed rounded-2xl border-[3px] border-ink px-3 py-2 font-display font-bold text-ink transition-all ${drag?.moved ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${drag?.overTrash ? 'bg-berry text-white scale-110' : 'bg-white'}`} style={{ zIndex: 950, right: 'max(12px, env(safe-area-inset-right, 0px))', bottom: 12 }}>
        {drag && byId.get(drag.id)?.kind !== 'item' ? '👋 Leave room' : '📦 Put away'}
      </div>
      {night && <div className="pointer-events-none absolute inset-0 transition-colors duration-700" style={{ background: lampOn ? `rgba(43,35,80,${townNight ? 0.3 : 0.18})` : `rgba(30,28,80,${townNight ? 0.5 : 0.42})`, zIndex: 900 }} />}
    </div>
  );
}

/** Switched on (lamp, TV, window = night). Older saves kept this in `on`, which now means "resting on". */
function isOn(e: Entity): boolean {
  const lit = getState<boolean>(e, 'lit');
  return lit ?? getState(e, 'on') === true;
}

/** Used by the people tray: put a character/pet into this room. */
export function placeActor(dispatch: ReturnType<typeof useGame>['dispatch'], sceneId: SceneId, kind: 'character' | 'pet', ref: string) {
  dispatch({ type: 'PLACE_ACTOR', to: sceneId, entity: { id: uid(kind), kind, ref, x: 380 + Math.random() * 240, y: 650 + Math.random() * 30, pose: 'stand' } });
  sfx('pop');
}

export { SECRETS };
