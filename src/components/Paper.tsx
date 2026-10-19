import type { CharacterData, PaperLook } from '../engine/types';
import type { Mood } from './art/Character';
import type { Face } from '../data/sprites';
import { PAPER_BASES, PAPER_FACES, PAPER_HAIR, PAPER_CLOTHES, PAPER_ACCESSORIES, type Box, type PaperBase } from '../data/paperArt';

/** Kids' clothes ('any') fit both kid bodies; grown-up clothes only the adult body. */
const fits = (c: PaperBase | 'any', b: PaperBase) => c === b || (c === 'any' && b !== 'adult');
/** Where a piece sits on this body (some clothes have one box per body). */
export function clothBox(id: string, base: PaperBase): Box | undefined {
  const c = PAPER_CLOTHES[id];
  if (!c || !fits(c.base, base)) return undefined;
  return c.atBase?.[base] ?? c.at;
}
/** Clothes this body can wear. */
export const paperClothesFor = (base: PaperBase, kind: 'top' | 'bottom' | 'shoes') =>
  Object.entries(PAPER_CLOTHES).filter(([, c]) => c.kind === kind && fits(c.base, base)).map(([id]) => id);

/** Which drawn face to show for what the character is doing. */
export function paperFace(mood: Mood | undefined, face: Face): string {
  switch (mood) {
    case 'happy': return 'laughing';
    case 'wow': return 'surprised';
    case 'sad': return 'sad';
    case 'grumpy': return 'grumpy';
    case 'wink': return 'wink';
    case 'silly': return face === 'wink' ? 'silly' : 'giggle';
    case 'eat': return face === 'wow' ? 'surprised' : 'happy';
    case 'sleep': return 'sleepy';
    case 'proud': return 'starry';
    default: return face === 'wink' ? 'wink' : face === 'wow' ? 'surprised' : face === 'sad' ? 'sad' : 'happy';
  }
}

/** One image placed on the character's canvas. */
function Piece({ src, at, cv, clip }: { src: string; at: Box; cv: Box; clip?: string }) {
  return (
    <img src={src} alt="" draggable={false} className="sprite-img"
      style={{ position: 'absolute', left: `${((at[0] - cv[0]) / cv[2]) * 100}%`, top: `${((at[1] - cv[1]) / cv[3]) * 100}%`,
        width: `${(at[2] / cv[2]) * 100}%`, height: `${(at[3] / cv[3]) * 100}%`, maxWidth: 'none', clipPath: clip }} />
  );
}

/**
 * A YunaVerse character: back hair, body, shoes, bottoms, top, bag, then the head drawn again over the
 * collar, the face, front hair and head accessories. Fills its box (aspect = the body's canvas).
 */
export function PaperArt({ p, face = 'happy' }: { p: PaperLook; face?: string }) {
  const B = PAPER_BASES[p.base] ?? PAPER_BASES.kid; const cv = B.canvas;
  const hair = p.hair ? PAPER_HAIR[p.hair] : undefined;
  const hc = (part: 'front' | 'back') => (hair?.[part] ? hair[part].src[p.hairColor] ?? Object.values(hair[part].src)[0] : undefined);
  const acc = (slot: string) => { const id = p.acc?.[slot as keyof NonNullable<PaperLook['acc']>]; return id ? PAPER_ACCESSORIES[id] : undefined; };
  const tone = Math.max(0, Math.min(B.src.length - 1, p.tone | 0));
  // grown-ups wear tops over a bare body, so wide necklines don't show the plain tee underneath
  const skin = (p.top && clothBox(p.top, p.base) && B.bare ? B.bare : B.src)[tone];
  const cloth = (id: string | null | undefined) => {
    const at = id ? clothBox(id, p.base) : undefined; if (!at) return null; const c = PAPER_CLOTHES[id!];
    return <Piece key={id!} src={c.srcTone?.[tone] ?? c.src} at={at} cv={cv} />;
  };
  const overTop = p.bottom && PAPER_CLOTHES[p.bottom]?.overTop;
  const headClip = `inset(0 0 ${Math.max(0, ((B.at[1] + B.at[3] - B.neck) / B.at[3]) * 100)}% 0)`;
  // Tops drawn with their own arms and hands (they have a version per skin tone): hide the body's own
  // shoulders and arms behind them, keeping only the neck, so nothing sticks out at the sides.
  // The cut starts at the top's collar, so the neck keeps its own outline down into the shoulders.
  const topC = p.top ? PAPER_CLOTHES[p.top] : undefined; const topAt = p.top ? clothBox(p.top, p.base) : undefined;
  const bodyClip = topC?.srcTone && topAt ? (() => {
    const [bx, by, bw, bh] = B.at; const X = (v: number) => `${((v - bx) / bw) * 100}%`; const Y = (v: number) => `${((v - by) / bh) * 100}%`;
    const y0 = Math.max(B.neck + 12, topAt[1]), y1 = topAt[1] + topAt[3] - 24, n0 = 512 - 56, n1 = 512 + 56;
    return `polygon(0 0, 100% 0, 100% ${Y(y0)}, ${X(n1)} ${Y(y0)}, ${X(n1)} ${Y(y1)}, 100% ${Y(y1)}, 100% 100%, 0 100%, 0 ${Y(y1)}, ${X(n0)} ${Y(y1)}, ${X(n0)} ${Y(y0)}, 0 ${Y(y0)})`;
  })() : undefined;
  const f = PAPER_FACES[face] ?? PAPER_FACES.happy;
  const headAcc = ['ears', 'eyes', 'hair', 'head'].map((s) => { const a = acc(s); return a ? <Piece key={s} src={a.src} at={a.at[p.base]} cv={cv} /> : null; });
  const bag = acc('bag');
  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      {hc('back') && <Piece src={hc('back')!} at={hair!.back.at[p.base]} cv={cv} />}
      <Piece src={skin} at={B.at} cv={cv} clip={bodyClip} />
      {cloth(p.shoes)}
      {!overTop && cloth(p.bottom)}
      {cloth(p.top)}
      {overTop && cloth(p.bottom)}
      {bag && <Piece src={bag.src} at={bag.at[p.base]} cv={cv} />}
      <Piece src={skin} at={B.at} cv={cv} clip={headClip} />
      <Piece src={f.src} at={f.at[p.base]} cv={cv} />
      {hc('front') && <Piece src={hc('front')!} at={hair!.front.at[p.base]} cv={cv} />}
      {headAcc}
    </div>
  );
}

/** Round face icon: the head (with hair) cropped from the character. */
export function PaperFaceIcon({ p, size }: { p: PaperLook; size: number }) {
  const B = PAPER_BASES[p.base] ?? PAPER_BASES.kid; const cv = B.canvas;
  const headH = B.neck - B.crown; const k = size / (headH * 1.15);
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', width: cv[2] * k, height: cv[3] * k, left: size / 2 - (512 - cv[0]) * k, top: -(B.crown - cv[1] - headH * 0.08) * k }}>
        <PaperArt p={p} />
      </div>
    </div>
  );
}

export const isPaper = (c: CharacterData) => !!c.paper;
