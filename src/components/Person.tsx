import type { CharacterData, PetData, Pose } from '../engine/types';
import { CharacterArt, type Mood } from './art/Character';
import { PetArt } from './art/Pet';
import { PET_LOOKS, ACC_BY_ID, type WearSlot } from '../data/accessories';
import { useEffect, useState } from 'react';
import { SPRITES, LAYERED, sitFrac, dollRig, type Face, type Layered } from '../data/sprites';
import { CLOTHES } from '../data/clothes';
import { DollBody, DollHead } from './Doll';
import { PaperArt, paperFace } from './Paper';
import { isExpression, type ExpressionId } from '../data/wardrobe';

/** Older (vector) characters show a chosen face through the closest mood they can draw. */
const EXPRESSION_MOOD: Record<ExpressionId, Mood> = { happy: 'normal', laughing: 'happy', wink: 'wink', surprised: 'wow', sad: 'sad', crying: 'sad', grumpy: 'grumpy', silly: 'silly' };

/** Draws a character: hand-drawn artwork if it has a sprite, otherwise the vector style. */
export function Person({ c, pose = 'stand', mood = 'normal', bandage = false }: { c: CharacterData; pose?: Pose; mood?: Mood; bandage?: boolean }) {
  const lay = c.sprite ? LAYERED[c.sprite] : undefined;
  if (lay) return <LayeredPerson c={c} lay={lay} pose={pose} mood={mood} />;
  const sp = c.sprite ? SPRITES[c.sprite] : undefined;
  if (!sp) return <CharacterArt age={c.age} look={c.look} pose={pose} mood={mood} bandage={bandage} />;
  // Sitting: show the top of the artwork so the legs tuck behind the seat.
  return (
    <div className="sprite-wrap w-full h-full overflow-hidden" style={{ position: 'relative' }}>
      <img src={sp.src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: pose === 'sit' ? `${100 / 0.8}%` : '100%', objectFit: 'contain', objectPosition: 'top' }} />
    </div>
  );
}

/** Faces that move: giggling flips wink/happy, eating flips open/closed mouth. */
function useFace(mood: Mood): Face {
  const live = mood === 'silly' || mood === 'eat';
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setT((v) => v + 1), 260);
    return () => window.clearInterval(id);
  }, [live]);
  if (mood === 'silly') return t % 2 ? 'happy' : 'wink';
  if (mood === 'eat') return t % 2 ? 'happy' : 'wow';
  return faceFor(mood);
}

function LayeredPerson({ c, lay, pose, mood }: { c: CharacterData; lay: Layered; pose: Pose; mood: Mood }) {
  // A character who isn't doing anything wears the face picked for them in the Dress-Up Studio.
  const chosen = mood === 'normal' && isExpression(c.expression) ? c.expression : undefined;
  const m: Mood = chosen && !c.paper ? EXPRESSION_MOOD[chosen] : mood;
  const face = useFace(m);
  const art = c.paper ? <PaperArt p={c.paper} face={chosen ?? paperFace(m, face)} />
    : <LayeredArt lay={lay} outfit={c.outfit ?? 0} face={face} wear={c.wear} name={c.sprite} colors={c.colors} doll={c.doll} mood={m} />;
  if (pose !== 'sit') return art;
  // Sitting: torso and the top of the thighs; the seat front (drawn over by Room) hides the rest.
  const f = sitFrac(lay);
  return (
    <div className="w-full h-full" style={{ position: 'relative', clipPath: 'inset(-50% -50% 0 -50%)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: `${(1 / f) * 100}%` }}>{art}</div>
    </div>
  );
}

export function PetPic({ p, sleeping = false, bandage = false }: { p: PetData; sleeping?: boolean; bandage?: boolean }) {
  const sp = p.sprite ? SPRITES[p.sprite] : undefined;
  if (!sp) return <PetArt species={p.species} accessory={p.accessory} sleeping={sleeping} bandage={bandage} />;
  const looks = PET_LOOKS[p.sprite!];
  const src = looks?.[p.look ?? 0]?.src ?? sp.src;
  return <img src={src} alt="" draggable={false} className="sprite-img" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', transform: sleeping ? 'rotate(-12deg) translateY(6%)' : undefined }} />;
}

/** Round face icon for a dress-up character: the head (with hair) cropped from their own art. */
export function DollFace({ d, size }: { d: NonNullable<CharacterData['doll']>; size: number }) {
  const lay = dollRig(d.adult); const k = size / 330;
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', width: lay.W * k, height: lay.H * k, left: (size - lay.W * k) / 2, top: -(lay.crown - 30) * k }}>
        <LayeredArt lay={lay} outfit={0} face="happy" doll={d} />
      </div>
    </div>
  );
}

/** Round face icon. */
export function SpriteFace({ sprite, size }: { sprite: string; size: number }) {
  const lay = LAYERED[sprite];
  if (lay) return (
    <div style={{ width: size, height: size, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <img src={lay.faces.happy} alt="" draggable={false} style={{ height: size * 1.35, width: 'auto', maxWidth: 'none', marginTop: -size * 0.06 }} />
    </div>
  );
  const sp = SPRITES[sprite];
  const imgH = (size * 0.95) / sp.head;
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      <img src={sp.src} alt="" draggable={false} style={{ height: imgH, width: 'auto', maxWidth: 'none', marginTop: size * 0.04 }} />
    </div>
  );
}

/** Which drawn face to show for what the character is doing. */
export function faceFor(mood: Mood): Face {
  if (mood === 'wink' || mood === 'silly') return 'wink';
  if (mood === 'wow') return 'wow';
  if (mood === 'sad' || mood === 'grumpy') return 'sad';
  return 'happy';
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
type Wear = CharacterData['wear'];

/** Where each worn accessory sits, fitted to this character's eyes. Returns [x, y, w, h] in rig px. */
function wearBox(lay: Layered, slot: WearSlot, aspect: number): [number, number, number, number] {
  const [[lx, ly], [rx, ry]] = lay.eyes;
  const d = rx - lx, mx = (lx + rx) / 2, ey = (ly + ry) / 2;
  const [bx, by, bw, bh] = lay.body;
  const fit = (s: 'head' | 'eyes') => lay.fit?.[s] ?? { w: 1, drop: 0 };
  if (slot === 'eyes') { const w = d * 2.05 * fit('eyes').w; const h = w / aspect; return [mx - w / 2, ey - h / 2 + d * (0.1 + fit('eyes').drop), w, h]; }
  if (slot === 'head') { const w = d * 3.05 * fit('head').w; const h = w / aspect; return [mx - w / 2, ey - d * (0.6 - fit('head').drop) - h, w, h]; }
  if (slot === 'ears') { const w = d * 3.7; const h = w / aspect; return [mx - w / 2, ey + d * 0.3 - h * 0.74, w, h]; }
  const h = d * 1.9; const w = h * aspect; // bag: hangs at the hip
  return [bx + bw * 0.27 - w / 2, by + bh * 0.33, w, h];
}

/** Headphones: one cup over each ear and a band arched over the head, cut from the flat front-view art. */
function Headphones({ lay, src }: { lay: Layered; src: string }) {
  const [[lx, ly], [rx, ry]] = lay.eyes;
  const d = rx - lx, mx = (lx + rx) / 2, ey = (ly + ry) / 2;
  const ch = d * 1.0, cw = ch * 0.79;                  // cup box
  const earY = ey + d * 0.18, earDx = d * 1.3;
  // cup crop inside the art (fractions): left cup x .02–.46, right .54–.98, both y .40–1
  const cup = (side: -1 | 1) => {
    const x = mx + side * earDx - cw / 2, y = earY - ch / 2;
    const iw = cw / 0.44, ih = ch / 0.6;
    return (
      <div key={side} className="worn" data-wear="ears" style={{ position: 'absolute', left: pct(x, lay.W), top: pct(y, lay.H), width: pct(cw, lay.W), height: pct(ch, lay.H), overflow: 'hidden' }}>
        <img src={src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', width: `${(iw / cw) * 100}%`, height: `${(ih / ch) * 100}%`, left: `${(-(side < 0 ? 0.02 : 0.54) * iw / cw) * 100}%`, top: `${(-0.4 * ih / ch) * 100}%`, maxWidth: 'none' }} />
      </div>
    );
  };
  const endY = earY - ch * 0.35, apex = lay.crown - d * 0.06, ctrl = 2 * apex - endY;
  const x0 = mx - earDx, x1 = mx + earDx, bw = d * 0.17;
  return (
    <>
      <svg viewBox={`0 0 ${lay.W} ${lay.H}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
        <path d={`M${x0} ${endY} Q${mx} ${ctrl} ${x1} ${endY}`} fill="none" stroke="#2A2A30" strokeWidth={bw} strokeLinecap="round" />
        <path d={`M${x0 + bw * 0.4} ${endY - bw * 0.6} Q${mx} ${ctrl + bw * 0.7} ${x1 - bw * 0.4} ${endY - bw * 0.6}`} fill="none" stroke="#6B6B78" strokeWidth={bw * 0.25} strokeLinecap="round" opacity={0.7} />
      </svg>
      {cup(-1)}{cup(1)}
    </>
  );
}

export function LayeredArt({ lay, outfit, face, sit = false, wear, name, colors, doll, mood }: { lay: Layered; outfit: number; face: Face; sit?: boolean; wear?: Wear; name?: string; colors?: CharacterData['colors']; doll?: CharacterData['doll']; mood?: Mood }) {
  const cl = name ? CLOTHES[name] : undefined;
  const layer = (part: 'top' | 'bottom') => {
    const src = colors?.[part] ? cl?.[part][colors[part]!] : undefined;
    return src ? <img key={part} src={src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: pct(bx, lay.W), top: pct(by, lay.H), width: pct(bw, lay.W), height: pct(bh, lay.H) }} /> : null;
  };
  const [bx, by, bw, bh] = lay.body;
  const [hx, hy, hw, hh] = lay.head;
  const body = lay.outfits[outfit] ?? lay.outfits[0];
  const piece = (slot: WearSlot) => {
    // The old painted accessories were retired (Oct 2026); YunaVerse characters use their own Extras.
    const a = undefined as (typeof ACC_BY_ID)[string] | undefined; void wear;
    if (!a) return null;
    if (slot === 'ears') return <Headphones key="ears" lay={lay} src={a.img} />;
    const [x, y, w, h] = wearBox(lay, slot, a.w / a.h);
    return <img key={slot} src={a.img} alt="" draggable={false} data-wear={slot} className="sprite-img worn" style={{ position: 'absolute', left: pct(x, lay.W), top: pct(y, lay.H), width: pct(w, lay.W), height: pct(h, lay.H) }} />;
  };
  return (
    <div className="w-full h-full" style={{ position: 'relative', overflow: 'visible' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: sit ? `${100 / 0.8}%` : '100%' }}>
          {doll ? <DollBody d={doll} /> : <>
          <img src={body.src} alt="" draggable={false} className="sprite-img" style={{ position: 'absolute', left: pct(bx, lay.W), top: pct(by, lay.H), width: pct(bw, lay.W), height: pct(bh, lay.H) }} />
          {layer('bottom')}{layer('top')}</>}
          {piece('bag')}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: sit ? `${100 / 0.8}%` : '100%' }}>
        {doll ? <DollHead d={doll} face={face} mood={mood} /> : <img src={lay.faces[face]} alt="" draggable={false} className="sprite-img layered-head" style={{ position: 'absolute', left: pct(hx, lay.W), top: pct(hy, lay.H), width: pct(hw, lay.W), height: pct(hh, lay.H) }} />}
        {piece('ears')}{piece('eyes')}{piece('head')}
      </div>
    </div>
  );
}
