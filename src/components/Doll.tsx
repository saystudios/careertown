import { useId, useMemo } from 'react';
import type { DollLook } from '../engine/types';
import type { Face } from '../data/sprites';
import { DOLL_PAD, DOLL_W, dollHeight } from '../data/doll';
import { ART_DEFS, ART_BODY, ART_HEAD, ART_TEE, ART_SHORTS, ART_HAIR, ART_GARMENTS, ART_ADULT_BODY, ART_ADULT_TEE, ART_ADULT_SHORTS, ART_ADULT_GARMENTS } from '../data/dollArt';
import { SKIN_SWATCH, HAIR_TINTS, EYE_TINTS, BASIC_TINTS } from '../data/dollLooks';
import { toonFaceSvg } from '../data/toonFaces';

/* ── colours ── */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hx = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const darker = (hex: string, f: number) => { const [r, g, b] = rgb(hex); return hx(r * f, g * f, b * f); };
const lighter = (hex: string, f: number) => { const [r, g, b] = rgb(hex); return hx(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };

function colours(d: DollLook, uid: string): Record<string, string> {
  const s = SKIN_SWATCH[Math.max(0, Math.min(3, d.tone | 0))];
  const h = HAIR_TINTS[d.hairColor]?.hex ?? HAIR_TINTS.darkbrown.hex;
  const e = EYE_TINTS[d.eyes]?.hex ?? EYE_TINTS.brown.hex;
  const t = (d.teeColor && BASIC_TINTS[d.teeColor]) || '#FFFFFF';
  const b = (d.shortsColor && BASIC_TINTS[d.shortsColor]) || '#FFFFFF';
  return {
    S: s, SD: darker(s, 0.86), SO: darker(s, 0.62),
    H: h, HD: darker(h, 0.82), HO: darker(h, 0.55), HL: lighter(h, 0.4),
    E: e, EL: lighter(e, 0.35), ED: darker(e, 0.5), EDD: darker(e, 0.7),
    T: t, TO: darker(t, 0.7), B: b, BO: darker(b, 0.7), U: uid,
  };
}
const paint = (svg: string, c: Record<string, string>) => svg.replace(/\{(\w+)\}/g, (_, k: string) => c[k] ?? '');

/** One drawing layer covering the whole doll canvas (the canvas has DOLL_PAD px of headroom above the drawing). */
function Layer({ markup, className, adult }: { markup: string; className?: string; adult?: boolean }) {
  return (
    <svg viewBox={`0 ${-DOLL_PAD} ${DOLL_W} ${dollHeight(adult)}`} preserveAspectRatio="xMidYMid meet" className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}
      dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

/** Back hair, body, and outfit (top over bottoms; overall bibs over the top). */
export function DollBody({ d }: { d: DollLook }) {
  const uid = useUid();
  const markup = useMemo(() => {
    const c = colours(d, uid);
    // Grown-ups wear the same pieces, re-drawn on the longer body.
    const g = (id: string | null) => (id && ART_GARMENTS[id] ? (d.adult ? ART_ADULT_GARMENTS[id] : ART_GARMENTS[id]) : undefined);
    const top = g(d.top), bottom = g(d.bottom), shoes = g(d.shoes);
    const hair = d.hair ? ART_HAIR[d.hair] : undefined;
    const [body, tee, shorts] = d.adult ? [ART_ADULT_BODY, ART_ADULT_TEE, ART_ADULT_SHORTS] : [ART_BODY, ART_TEE, ART_SHORTS];
    return paint(ART_DEFS + (hair?.back ?? '') + body + (bottom ? '' : shorts) + (top ? '' : tee)
      + (shoes?.svg ?? '') + (bottom?.svg ?? '') + (top?.svg ?? '') + (bottom?.over ?? ''), c);
  }, [d, uid]);
  return <Layer markup={markup} className="sprite-img" adult={d.adult} />;
}

/** The 8 drawn expressions: the 4 shared faces plus laugh, cry, grumpy and silly for dress-up characters. */
function exprFor(face: Face, mood?: string) {
  if (mood === 'silly') return face === 'wink' ? 'silly' : 'laugh';   // tickled: giggle and stick tongue out
  if (mood === 'grumpy') return 'angry';
  if (mood === 'sad') return 'cry';
  return face;
}

/** Head with the chosen face and mood, eye colour and front hair. */
export function DollHead({ d, face, mood }: { d: DollLook; face: Face; mood?: string }) {
  const uid = useUid();
  const expr = exprFor(face, mood);
  const markup = useMemo(() => {
    const c = colours(d, uid);
    const hair = d.hair ? ART_HAIR[d.hair] : undefined;
    return paint(ART_DEFS + ART_HEAD + toonFaceSvg(expr, d.face === 'girl') + (hair?.front ?? ''), c);
  }, [d, uid, expr]);
  return <Layer markup={markup} className="layered-head" adult={d.adult} />;
}

/** Tops that reach past the hips (dresses) get a taller picker tile. */
const LONG_TOPS = new Set(['bunny-dress', 'lab-coat']);

/** A single garment drawn on its own, for the character maker's picker tiles. */
export function GarmentPic({ id }: { id: string }) {
  const g = ART_GARMENTS[id];
  if (!g) return null;
  const vb = g.kind === 'top' ? (LONG_TOPS.has(id) ? '50 318 284 300' : '70 318 244 196') : g.kind === 'bottom' ? '86 340 212 330' : '104 600 176 96';
  return <svg viewBox={vb} style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: g.svg + (g.over ?? '') }} />;
}
