import type React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { BuildingId, Entity, SceneId } from '../engine/types';
import { useGame, sceneOf } from '../engine/store';
import { Room, placeActor } from '../components/Room';
import { BUILDINGS } from '../data/buildings';
import { ITEMS, has } from '../data/items';
import type { GameState } from '../engine/types';
import { Btn, Face, Modal } from '../ui/kit';
import { Person, PetPic } from '../components/Person';
import { ItemIcon } from '../components/ItemIcon';
import { ClothesPicker } from '../components/ClothesPicker';
import { DollEditor } from '../components/DollEditor';
import { PaperEditor } from '../components/PaperEditor';
import { PetCloset } from '../components/PetCloset';
import { LAYERED } from '../data/sprites';
import { FurnitureArt } from '../components/art/Furniture';
import { LookEditor } from './CharacterCreator';
import { uid } from '../engine/ids';
import { sfx } from '../engine/sfx';
import { MISSIONS } from '../data/missions';
import { Worker } from '../components/Worker';
import { Visitors } from '../components/Visitors';
import { useDayPhase } from '../engine/dayPhase';
import { PhotoMode } from '../components/PhotoMode';
import { SCENES } from '../data/scenes';

export function SceneScreen({ sceneId: startScene, onMission }: { sceneId: SceneId; onScene: (s: SceneId) => void; onMission: (id: string) => void }) {
  const { game, dispatch } = useGame();
  const b = BUILDINGS.find((x) => x.rooms.some((r) => r.sceneId === startScene))!;
  // Toca-style: every room of the building sits side by side; swipe across them. `sceneId` = the room in the middle of the screen.
  const [sceneId, setCur] = useState<SceneId>(startScene);
  const multi = b.rooms.length > 1;
  const strip = useRef<HTMLDivElement>(null);
  const panels = useRef<Partial<Record<SceneId, HTMLDivElement | null>>>({});
  const centre = (id: SceneId, smooth = false) => {
    const p = panels.current[id]; const s = strip.current; if (!p || !s) return;
    s.scrollTo({ left: p.offsetLeft + p.offsetWidth / 2 - s.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' });
  };
  useLayoutEffect(() => { centre(startScene); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ticking = useRef(false);
  const onScroll = () => {
    if (ticking.current) return; ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false; const s = strip.current; if (!s) return;
      const mid = s.scrollLeft + s.clientWidth / 2;
      let best = sceneId, d = Infinity;
      for (const r of b.rooms) { const p = panels.current[r.sceneId]; if (!p) continue; const dd = Math.abs(p.offsetLeft + p.offsetWidth / 2 - mid); if (dd < d) { d = dd; best = r.sceneId; } }
      if (best !== sceneId) setCur(best);
    });
  };
  // dragging something to the screen edge scrolls the house
  const edge = useRef(0); const edgeLoop = useRef(0);
  const onEdge = (x: number | null) => {
    const w = window.innerWidth; const zone = Math.min(90, w * 0.08);
    edge.current = x === null ? 0 : x < zone ? -1 : x > w - zone ? 1 : 0;
    if (edge.current && !edgeLoop.current) {
      const step = () => { if (!edge.current || !strip.current) { edgeLoop.current = 0; return; } strip.current.scrollLeft += edge.current * 14; edgeLoop.current = requestAnimationFrame(step); };
      edgeLoop.current = requestAnimationFrame(step);
    }
  };
  useEffect(() => () => cancelAnimationFrame(edgeLoop.current), []);
  // carry people, pets and things into the next room
  const onCross = (from: SceneId) => (e: Entity, dir: -1 | 1, y: number, deps: string[]) => {
    const i = b.rooms.findIndex((r) => r.sceneId === from); const to = b.rooms[i + dir]?.sceneId; if (!to) return false;
    const x = dir > 0 ? 110 : 890;
    if (e.kind === 'item') {
      const list = sceneOf(game, from); const moving = [e, ...deps.map((id) => list.find((v) => v.id === id)).filter(Boolean) as Entity[]];
      dispatch({ type: 'REMOVE_ENTITIES', scene: from, ids: moving.map((v) => v.id) });
      for (const v of moving) dispatch({ type: 'ADD_ENTITY', scene: to, entity: { ...v, id: uid('it'), heldBy: undefined, x: x + (v.x - e.x), y: v === e ? y : y + (v.y - e.y), state: v.state && { ...v.state, on: undefined } } });
    } else {
      dispatch({ type: 'PLACE_ACTOR', to, entity: { ...e, id: uid(e.kind), x, y, pose: 'stand', holding: undefined, state: e.state && { ...e.state, on: undefined } } });
      if (e.kind === 'character') dispatch({ type: 'SET_ACTIVE', id: e.ref });
    }
    centre(to, true); setCur(to);
    return true;
  };
  // Undo: keep the rooms as they were before the last move, for a few seconds
  const gameRef = useRef(game); gameRef.current = game;
  const [undo, setUndo] = useState<{ scenes: GameState['scenes']; key: number } | null>(null);
  const snapshot = () => {
    const key = Date.now(); setUndo({ scenes: gameRef.current.scenes, key });
    window.setTimeout(() => setUndo((u) => (u?.key === key ? null : u)), 7000);
  };
  const doUndo = () => { if (!undo) return; dispatch({ type: 'RESTORE_SCENES', scenes: undo.scenes }); setUndo(null); sfx('whoosh'); };
  // Tidy up: put away the toys and food that were taken out in this room
  const tidy = () => {
    const loose = sceneOf(game, sceneId).filter((e) => e.kind === 'item' && e.id.startsWith('it-') && (has(ITEMS[e.ref], 'small') || has(ITEMS[e.ref], 'food')));
    if (!loose.length) { dispatch({ type: 'TOAST', text: '✨ This room is already tidy!' }); sfx('tap'); return; }
    snapshot();
    dispatch({ type: 'REMOVE_ENTITIES', scene: sceneId, ids: loose.map((e) => e.id) });
    dispatch({ type: 'TOAST', text: `🧹 All tidy! Put away ${loose.length} thing${loose.length > 1 ? 's' : ''}.` }); sfx('sparkle');
  };
  // mouse: drag the background to pan; mouse wheel scrolls sideways
  const pan = useRef<{ x: number; left: number } | null>(null);
  const [tray, setTray] = useState<'people' | 'stuff' | null>(null);
  const [wardrobe, setWardrobe] = useState<string | null>(null);
  const [drawOn, setDrawOn] = useState<Entity | null>(null);
  const [petCloset, setPetCloset] = useState<string | null>(null);
  const [photo, setPhoto] = useState(false);
  const here = sceneOf(game, sceneId);
  const isHome = b.id === 'home';
  const phase = useDayPhase();
  // your pet follows you into every room (next to your character, if they're here)
  const followPet = game.settings.petFollow !== false ? game.pets[0] : undefined;
  useEffect(() => {
    if (!followPet) return;
    const inRoom = sceneOf(game, sceneId);
    if (inRoom.some((e) => e.kind === 'pet' && e.ref === followPet.id)) return;
    const me = inRoom.find((e) => e.kind === 'character' && e.ref === game.activeCharacterId);
    dispatch({ type: 'PLACE_ACTOR', to: sceneId, entity: { id: uid('pet'), kind: 'pet', ref: followPet.id, x: me ? Math.min(900, me.x + 110) : 430, y: me ? me.y + 6 : 662, pose: 'stand' } });
    sfx('pop');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, followPet?.id]);
  const night = phase === 'night' && isHome;
  useEffect(() => {
    if (night && sceneId === 'home-bedroom') dispatch({ type: 'TOAST', text: 'It’s nighttime! 🌙 Drag everyone onto the bed to sleep, or tap the lamp for a night light.' });
  }, [night, sceneId, dispatch]);

  const allPlaced = new Set(Object.values(game.scenes).flatMap((l) => (l ?? []).map((e) => e.ref)));
  const worn = new Set(game.characters.flatMap((c) => Object.values(c.wear ?? {})));
  const stuff = game.owned.filter((id) => ITEMS[id] && !allPlaced.has(id) && !worn.has(id));

  return (
    <div className="scene-screen relative h-full">
      <div ref={strip} className={`room-strip absolute inset-0 ${multi ? 'multi' : 'single'}`} onScroll={onScroll}
        onWheel={(ev) => { if (strip.current && Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) strip.current.scrollLeft += ev.deltaY; }}
        onPointerDown={(ev) => { if (ev.pointerType === 'mouse' && !(ev.target as Element).closest('.entity, button, input') && strip.current) pan.current = { x: ev.clientX, left: strip.current.scrollLeft }; }}
        onPointerMove={(ev) => { if (pan.current && strip.current) strip.current.scrollLeft = pan.current.left - (ev.clientX - pan.current.x); }}
        onPointerUp={() => { pan.current = null; }} onPointerLeave={() => { pan.current = null; }}>
        {b.rooms.map((r) => (
          <div key={r.sceneId} ref={(el) => { panels.current[r.sceneId] = el; }} className="room-panel" data-scene={r.sceneId}>
            <Room sceneId={r.sceneId} townNight={night} onWardrobe={setWardrobe} onCustomTap={(e) => (e.ref === 'chalkboard' || e.ref === 'easel') && setDrawOn(e)}
              onEdge={onEdge} onCross={multi ? onCross(r.sceneId) : undefined} onSnapshot={snapshot}
              onMovedTo={(to) => { if (b.rooms.some((x) => x.sceneId === to)) { centre(to, true); setCur(to); } }} />
            {multi ? <span className="room-sign">{r.icon} {SCENES[r.sceneId].label}</span> : <><Worker building={b.id} /><Visitors building={b.id} /></>}
          </div>
        ))}
      </div>

      <div className="room-tabs absolute inset-x-0 flex items-center gap-2 px-2 sm:px-3 pb-2 overflow-x-auto pointer-events-none [&>*]:pointer-events-auto">
        {b.rooms.length > 1 && b.rooms.map((r) => (
          <button key={r.sceneId} onClick={() => { sfx('tap'); centre(r.sceneId, true); setCur(r.sceneId); }}
            className={`shrink-0 rounded-2xl border-[3px] border-ink px-3 h-11 font-display font-bold text-ink shadow-chunkysm ${r.sceneId === sceneId ? 'bg-sun' : 'bg-white'}`}>
            <span className="mr-1">{r.icon}</span>{r.label}
          </button>
        ))}
        {b.rooms.length === 1 && <div className="shrink-0 rounded-2xl border-[3px] border-ink bg-white px-3 py-1 shadow-chunkysm font-display font-extrabold text-ink text-lg">{b.icon} {b.rooms[0].label}: free play</div>}
        <div className="flex-1 tabs-spacer" />
        {b.missions.map((m) => (
          <Btn key={m} tone="berry" className="shrink-0 !min-h-[44px]" onClick={() => onMission(m)}>⭐ {MISSIONS[m].title}</Btn>
        ))}
      </div>

      <div className="scene-actions absolute bottom-2 flex items-center gap-2">
        <Btn tone="sky" onClick={() => setTray(tray === 'people' ? null : 'people')}>🧑‍🤝‍🧑 People{game.pets.length ? ' & pets' : ''}</Btn>
        <Btn tone="white" onClick={() => { setTray(null); setPhoto(true); }} aria-label="Photo mode">📸</Btn>
        <Btn tone="white" onClick={tidy} aria-label="Tidy up">🧹</Btn>
        {isHome && <Btn tone="mint" onClick={() => setTray(tray === 'stuff' ? null : 'stuff')}>📦 My stuff{stuff.length ? ` (${stuff.length})` : ''}</Btn>}
        <Hint building={b.id} />
      </div>

      {tray && (
        <div className="tray-in fixed inset-x-2 bottom-20 z-[45] mx-auto max-w-2xl rounded-[24px] border-[4px] border-ink bg-white shadow-chunky p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-display font-extrabold text-ink text-lg">{tray === 'people' ? 'Tap someone to bring them here (tap a pet again to dress it)' : 'Tap to place in this room'}</div>
            {tray === 'people' && game.pets.length > 0 && (
              <button onClick={() => { sfx('tap'); dispatch({ type: 'TOGGLE_PET_FOLLOW' }); }} aria-pressed={game.settings.petFollow !== false}
                className={`shrink-0 rounded-full border-[3px] border-ink px-3 h-10 font-display font-bold text-ink text-sm ${game.settings.petFollow !== false ? 'bg-mint' : 'bg-white'}`}>
                🐾 {game.pets[0].name} follows me: {game.settings.petFollow !== false ? 'On' : 'Off'}
              </button>
            )}
            <button onClick={() => setTray(null)} className="w-10 h-10 rounded-full border-[3px] border-ink bg-berry text-white font-display" aria-label="Close tray">✕</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tray === 'people' && game.characters.map((c) => {
              const inRoom = here.some((e) => e.kind === 'character' && e.ref === c.id);
              return (
                <button key={c.id} onClick={() => { if (inRoom) { dispatch({ type: 'SET_ACTIVE', id: c.id }); sfx('tap'); } else placeActor(dispatch, sceneId, 'character', c.id); }}
                  className={`shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-20 ${inRoom ? 'bg-sun' : 'bg-white'}`}>
                  <Face c={c} size={52} /><span className="font-body text-xs text-ink truncate w-full text-center">{inRoom ? `✓ ${c.name}` : c.name}</span>
                </button>
              );
            })}
            {tray === 'people' && game.pets.map((p) => {
              const inRoom = here.some((e) => e.kind === 'pet' && e.ref === p.id);
              return (
                <button key={p.id} onClick={() => { if (inRoom) { sfx('tap'); setPetCloset(p.id); setTray(null); } else placeActor(dispatch, sceneId, 'pet', p.id); }}
                  className={`shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-20 ${inRoom ? 'bg-sun' : 'bg-white'}`}>
                  <div className="w-14 h-14"><PetPic p={p} /></div><span className="font-body text-xs text-ink">{inRoom ? `👗 ${p.name}` : p.name}</span>
                </button>
              );
            })}
            {tray === 'people' && game.pets.length === 0 && <p className="font-body text-ink/70 self-center">Finish a career mission to adopt a pet! 🐶🐱</p>}
            {tray === 'stuff' && stuff.map((id) => (
              <button key={id} onClick={() => { dispatch({ type: 'ADD_ENTITY', scene: sceneId, entity: { id: uid('it'), kind: 'item', ref: id, x: 300 + Math.random() * 400, y: 640 } }); sfx('pop'); }}
                className="shrink-0 flex flex-col items-center gap-1 rounded-2xl border-[3px] border-ink p-2 w-24 bg-white">
                <div className="w-16 h-14 grid place-items-center"><ItemIcon id={id} size={52} /></div>
                <span className="font-body text-xs text-ink truncate w-full text-center">{ITEMS[id].name}</span>
              </button>
            ))}
            {tray === 'stuff' && stuff.length === 0 && <p className="font-body text-ink/70">Everything is placed! Earn or buy more decorations. Drag things to “Put away” to store them again.</p>}
          </div>
        </div>
      )}

      {multi && <><Worker building={b.id} /><Visitors building={b.id} /></>}
      {undo && <button className="undo-btn" onClick={doUndo}>↩️ Undo</button>}
      {photo && <PhotoMode title={b.rooms.find((r) => r.sceneId === sceneId)?.label ?? b.name} onClose={() => setPhoto(false)} />}

      {wardrobe && <WardrobeSheet characterId={wardrobe} onClose={() => setWardrobe(null)} />}
      {petCloset && <Modal title="Pet closet" onClose={() => setPetCloset(null)}><PetCloset only={petCloset} /></Modal>}
      {drawOn && <Chalkboard entity={drawOn} sceneId={(Object.keys(game.scenes) as SceneId[]).find((k) => game.scenes[k]?.some((v) => v.id === drawOn.id)) ?? sceneId} onClose={() => setDrawOn(null)} />}
    </div>
  );
}

const HINTS: Partial<Record<BuildingId, string>> = {
  home: 'Try: drag an egg onto the stove, or someone onto the bed.',
  school: 'Try: seat kids at desks, then tap the chalkboard to draw.',
  hospital: 'Try: drag a thermometer onto a character.',
  courthouse: 'Try: put a judge behind the bench and tap the gavel.',
  engineering: 'Try: stack blocks into a tower 4 high.',
  'animal-hospital': 'Try: drag the pet brush or stethoscope onto Clover.',
  'tech-lab': 'Try: tap a computer to turn it on, then sit someone nearby.',
  restaurant: 'Try: drag the pizza dough onto the stove to bake a pizza.',
};
function Hint({ building }: { building: BuildingId }) {
  return <p className="hidden lg:block font-body text-ink/80 text-sm max-w-xs">{HINTS[building]}</p>;
}

function WardrobeSheet({ characterId, onClose }: { characterId: string; onClose: () => void }) {
  const { game, dispatch } = useGame();
  const c = game.characters.find((x) => x.id === characterId);
  if (!c) return null;
  return (
    <Modal title={`${c.name}’s closet`} onClose={onClose} wide>
      {c.sprite && LAYERED[c.sprite] ? <OutfitPicker c={c} /> : <div className="grid sm:grid-cols-[160px_1fr] gap-4">
        <div className="hidden sm:grid place-items-center rounded-2xl border-[3px] border-ink bg-sky/30 h-64">
          <div className="w-[70%] h-[90%]"><CharacterPreview id={characterId} /></div>
        </div>
        {c.sprite && LAYERED[c.sprite] ? <OutfitPicker c={c} /> : c.sprite ? <div className="h-full grid place-items-center text-center p-6"><div><div className="text-5xl">🎨</div><p className="font-display text-2xl font-extrabold text-ink mt-2">{c.name}’s look is hand-drawn artwork</p><p className="font-body text-ink mt-2 max-w-sm">Their outfit stays the same. Tap <b>+</b> to make a new character you can dress up any way you like.</p></div></div> : <LookEditor clothesOnly age={c.age} look={c.look} onChange={(look) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, look } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />}
      </div>}
    </Modal>
  );
}
function CharacterPreview({ id }: { id: string }) {
  const { game } = useGame();
  const c = game.characters.find((x) => x.id === id)!;
  return <Person c={c} mood="happy" />;
}

function Chalkboard({ entity, sceneId, onClose }: { entity: Entity; sceneId: SceneId; onClose: () => void }) {
  const { dispatch } = useGame();
  const ref = useRef<HTMLCanvasElement>(null);
  const paper = entity.ref === 'easel';
  const [color, setColor] = useState(paper ? '#2B2350' : '#FFFFFF');
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const COLORS = paper ? ['#2B2350', '#FF5D8F', '#3D7BFF', '#FFC93C', '#5FB894', '#FF8A3D'] : ['#FFFFFF', '#FFC93C', '#FF7FB5', '#7FD3F7', '#8BD46E'];

  useEffect(() => {
    const cv = ref.current!; const g = cv.getContext('2d')!;
    const img = entity.state?.img as string | undefined;
    if (img) { const i = new Image(); i.onload = () => g.drawImage(i, 0, 0, cv.width, cv.height); i.src = img; }
  }, [entity]);

  const pos = (ev: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) / r.width) * ref.current!.width, y: ((ev.clientY - r.top) / r.height) * ref.current!.height };
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const g = ref.current!.getContext('2d')!;
    g.globalCompositeOperation = color === 'erase' ? 'destination-out' : 'source-over';
    g.strokeStyle = color === 'erase' ? '#000' : color; g.lineWidth = color === 'erase' ? 36 : 9; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  };
  const save = () => {
    const url = ref.current!.toDataURL('image/png');
    dispatch({ type: 'PATCH_ENTITIES', scene: sceneId, patches: [{ id: entity.id, patch: { state: { ...(entity.state ?? {}), img: url } } }] });
    dispatch({ type: 'EVENT', name: 'draw' });
    sfx('success'); onClose();
  };

  return (
    <Modal title={paper ? 'Paint a picture' : 'Chalkboard'} onClose={onClose} wide>
      <canvas ref={ref} width={paper ? 600 : 808} height={paper ? 548 : 344} style={{ touchAction: 'none', ...(paper ? { background: '#fff', maxHeight: '60dvh', width: 'auto', margin: '0 auto', display: 'block' } : {}) }}
        className="w-full rounded-2xl border-[4px] border-ink bg-[#2F5D50] cursor-crosshair"
        onPointerDown={(ev) => { ev.currentTarget.setPointerCapture(ev.pointerId); drawing.current = pos(ev); line(drawing.current, drawing.current); }}
        onPointerMove={(ev) => { if (!drawing.current) return; const p = pos(ev); line(drawing.current, p); drawing.current = p; }}
        onPointerUp={() => { drawing.current = null; }} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => <button key={c} aria-label={`Chalk ${c}`} onClick={() => setColor(c)} className={`w-11 h-11 rounded-full border-[3px] border-ink ${color === c ? 'ring-4 ring-berry' : ''}`} style={{ background: c }} />)}
        <Btn tone="white" onClick={() => setColor('erase')} className={color === 'erase' ? 'ring-4 ring-berry' : ''}>🧽 Eraser</Btn>
        <Btn tone="white" onClick={() => { const cv = ref.current!; cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height); }}>Clear</Btn>
        <div className="flex-1" />
        <Btn tone="mint" onClick={save}>{paper ? 'Hang it on the easel' : 'Put it on the board'}</Btn>
      </div>
    </Modal>
  );
}

function OutfitPicker({ c }: { c: import('../engine/types').CharacterData }) {
  const { dispatch } = useGame();
  const lay = LAYERED[c.sprite!];
  return (
    <div>
      {c.paper ? (
        <div className="grid sm:grid-cols-[160px_1fr] gap-4">
          <div className="hidden sm:grid place-items-center rounded-2xl border-[3px] border-ink bg-sky/30 h-64 p-2"><div className="h-full" style={{ aspectRatio: `${LAYERED[c.sprite!].W} / ${LAYERED[c.sprite!].H}` }}><Person c={c} mood="happy" /></div></div>
          <PaperEditor p={c.paper} lockBase={!!c.sprite && c.sprite !== 'paper-kid' && c.sprite !== 'paper-preschool'}
            onChange={(paper) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, paper, sprite: c.sprite === 'paper-kid' || c.sprite === 'paper-preschool' ? `paper-${paper.base}` : c.sprite } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />
        </div>
      ) : c.doll && <DollEditor d={c.doll} onChange={(doll) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, doll } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />}
      {!c.paper && <ClothesPicker c={c} onChange={(colors) => { dispatch({ type: 'SAVE_CHARACTER', character: { ...c, colors } }); dispatch({ type: 'EVENT', name: 'dress' }); }} />}
      <PetCloset />
    </div>
  );
}
