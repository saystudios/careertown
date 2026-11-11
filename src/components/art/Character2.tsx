import { useId } from 'react';
import type { Look, Pose } from '../../engine/types';

/*
 * CareerTown character style ("Sprout" style)
 * ───────────────────────────────────────────
 * • Colored line art: every shape is outlined in a deeper shade of its own fill
 *   (not one black ink), which gives a soft, hand-inked feel.
 * • Proportions: kawaii. Big round heads on tiny bodies. Grown-ups ≈ 2.6 heads tall, kids ≈ 2.1. Three builds: slim, average, round.
 * • Face: eyes sit LOW on the face (below the midline) as tall ovals with a
 *   sweeping upper lid that flicks out at the corner; a tiny hooked nose in a
 *   darker skin tone; a small soft mouth; oval blush with a highlight dot.
 * • Feet: chunky rounded sneakers with a white sole on every outfit.
 */

export const INK = '#2B2350';
export type Mood = 'normal' | 'eat' | 'sleep' | 'brush' | 'happy' | 'wow' | 'sad' | 'proud' | 'wink' | 'silly' | 'grumpy';
export type Build = 'slim' | 'average' | 'round';

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  if (amt < 0) { const f = 1 + amt / 100; return `#${((c((n >> 16) * f) << 16) | (c(((n >> 8) & 255) * f) << 8) | c((n & 255) * f)).toString(16).padStart(6, '0')}`; }
  const f = amt / 100; const m = (v: number) => c(v + (255 - v) * f);
  return `#${((m(n >> 16) << 16) | (m((n >> 8) & 255) << 8) | m(n & 255)).toString(16).padStart(6, '0')}`;
}
/** Line color for a fill: same hue, much deeper. */
const line = (fill: string) => (fill.toLowerCase() === '#ffffff' ? '#B4B8D2' : shade(fill, -30));
const sw = 1.7;
const P = (fill: string, w = sw) => ({ fill, stroke: line(fill), strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

interface Geo { adult: boolean; tw: number; aw: number; lw: number; waist: number; foot: number; vbH: number; sit: boolean; pose: Pose }

function geo(adult: boolean, build: Build, sit: boolean, pose: Pose = 'stand'): Geo {
  const tw = { slim: 16, average: 19.5, round: 26 }[build] + (adult ? 1 : 0);
  const aw = { slim: 9, average: 10.5, round: 12.5 }[build];
  const lw = { slim: 12, average: 14, round: 16.5 }[build];
  const waist = adult ? 96 : 88;
  const legLen = adult ? 40 : 26;
  const foot = sit ? waist + 14 : waist + legLen;
  return { adult, tw, aw, lw, waist, foot, vbH: foot + 14, sit, pose };
}

// ── Head ──────────────────────────────────────────
const CY = 34; // head centre

function headPath(face: Look['face']) {
  switch (face) {
    case 'oval': return 'M60 8 C76 8 82 22 81.5 36 C81 50 72 61 60 61 C48 61 39 50 38.5 36 C38 22 44 8 60 8Z';
    case 'square': return 'M60 10 C78 10 82 16 82 34 C82 52 76 59 60 59 C44 59 38 52 38 34 C38 16 42 10 60 10Z';
    default: return 'M60 10 C76 10 83 21 82.5 35 C82 49 73 59 60 59 C47 59 38 49 37.5 35 C37 21 44 10 60 10Z'; // bean
  }
}

function HairBack({ l }: { l: Look }) {
  const f = P(l.hairColor);
  const hl = shade(l.hairColor, 22);
  switch (l.hair) {
    case 'long': return <path d="M35 32 C32 4 88 4 85 32 L87 78 C80 84 70 82 66 76 L54 76 C50 82 40 84 33 78Z" {...f} />;
    case 'wavy': return <path d="M35 30 C33 4 87 4 85 30 C90 44 82 52 88 64 C84 74 74 70 70 64 L50 64 C46 70 36 74 32 64 C38 52 30 44 35 30Z" {...f} />;
    case 'bob': return <path d="M35 30 C33 6 87 6 85 30 L87 54 C81 60 72 58 70 54 L50 54 C48 58 39 60 33 54Z" {...f} />;
    case 'curly': return <g {...f}>{[[60, 22, 27], [37, 30, 12], [83, 30, 12], [40, 13, 12], [80, 13, 12], [60, 2, 12], [35, 46, 9], [85, 46, 9]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
    case 'afropuff': return <g><circle cx={60} cy={2} r={15} {...f} />{[[54, -4], [64, 4], [58, 8]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q3 -3 6 0`} fill="none" stroke={hl} strokeWidth={1.6} strokeLinecap="round" />)}</g>;
    case 'topknot': return <circle cx={60} cy={3} r={9} {...f} />;
    case 'ponytail': return <path d="M80 14 C100 20 99 52 90 66 C88 50 86 34 79 24Z" {...f} />;
    case 'buns': return <g {...f}><circle cx={41} cy={10} r={9.5} /><circle cx={79} cy={10} r={9.5} /></g>;
    case 'locs': return <g {...f}>{[36, 43, 50, 70, 77, 84].map((x, i) => <rect key={x} x={x - 3.5} y={24} width={7} height={i % 2 ? 40 : 46} rx={3.5} />)}</g>;
    case 'braids': return <g {...f}>{[34, 86].map((x) => <g key={x}>{[40, 48, 56, 64].map((y) => <ellipse key={y} cx={x} cy={y} rx={5} ry={5.5} />)}<circle cx={x} cy={72} r={3.5} fill="#FFC93C" stroke={line('#FFC93C')} strokeWidth={1.6} /></g>)}</g>;
    case 'headscarf': return <path d="M33 36 C31 4 89 4 87 36 C88 54 85 66 74 72 L46 72 C35 66 32 54 33 36Z" {...f} />;
    default: return null;
  }
}

function HairFront({ l }: { l: Look }) {
  const f = P(l.hairColor);
  const hl = shade(l.hairColor, 28);
  const shine = (d: string) => <path d={d} fill="none" stroke={hl} strokeWidth={2} strokeLinecap="round" />;
  switch (l.hair) {
    case 'short': return <g><path d="M38 34 C36 15 48 7 61 7 C75 7 85 15 83 32 C79 23 71 18 61 19 C51 19 43 25 38 34Z" {...f} />{shine('M48 13 Q56 9 64 10')}</g>;
    case 'spiky': return <path d="M38 34 L35 18 L45 20 L45 6 L54 15 L60 3 L66 15 L75 6 L75 20 L85 18 L82 34 C76 24 44 24 38 34Z" {...f} />;
    case 'buzz': return <path d="M39 30 C40 15 50 10 60 10 C70 10 80 15 81 30 C74 22 46 22 39 30Z" {...f} opacity={0.95} />;
    case 'curly': return <g {...f}>{[40, 50, 60, 70, 80].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 15 : 20} r={8.5} />)}</g>;
    case 'afropuff': case 'topknot': case 'buns': case 'ponytail':
      return <g><path d="M38 32 C37 14 48 8 60 8 C72 8 83 14 82 32 C76 22 68 17 60 17 C52 17 44 22 38 32Z" {...f} /><path d="M46 13 C52 11 54 12 58 9" fill="none" stroke={line(l.hairColor)} strokeWidth={1.4} />{l.hair === 'afropuff' && <rect x={48} y={9} width={24} height={5} rx={2.5} fill="#FF5D8F" stroke={line('#FF5D8F')} strokeWidth={1.6} />}</g>;
    case 'locs': return <g><path d="M38 33 C37 14 48 8 60 8 C72 8 83 14 82 33 C76 24 44 24 38 33Z" {...f} />{[46, 54, 62, 70].map((x) => <rect key={x} x={x - 3} y={14} width={6} height={14} rx={3} {...f} />)}</g>;
    case 'braids': return <g><path d="M38 33 C37 14 48 8 60 8 C72 8 83 14 82 33 C76 24 66 18 60 18 C54 18 44 24 38 33Z" {...f} /><path d="M60 8 L60 18" stroke={line(l.hairColor)} strokeWidth={1.6} /></g>;
    case 'headscarf': return <g><path d="M38 28 C44 10 76 10 82 28 C74 20 46 20 38 28Z" fill={shade(l.hairColor, 15)} stroke={line(l.hairColor)} strokeWidth={sw} />{[[48, 14], [60, 11], [72, 14]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={1.8} fill="#fff" opacity={0.8} />)}</g>;
    case 'wavy': case 'long': case 'bob':
    default: return <g><path d="M37 38 C35 13 49 6 62 6 C77 7 85 16 83 36 C79 26 74 20 67 17 C61 27 49 31 37 38Z" {...f} />{shine('M66 11 Q74 13 78 19')}</g>;
  }
}

function Eyes({ l, mood }: { l: Look; mood: Mood }) {
  const spots = [49, 71], y = CY + 8;
  const ink = '#34283B';
  const arch = (x: number) => <path key={x} d={`M${x-5} ${y+1}Q${x} ${y-5} ${x+5} ${y+1}`} stroke={ink} strokeWidth={2.6} fill="none" strokeLinecap="round"/>;
  const open = (x: number, i: number) => (
    <g key={i}>
      <ellipse cx={x} cy={y} rx={l.eyes === 'dot' ? 3.1 : 4.4} ry={l.eyes === 'sleepy' ? 3.8 : 5.5} fill={ink}/>
      <ellipse cx={x-1.4} cy={y-2.4} rx={1.1} ry={1.4} fill="#FFF9F8"/>
      {l.eyes === 'lashes' && <path d={`M${x-4} ${y-3}l-2 -2`} stroke={ink} strokeWidth={1.8} strokeLinecap="round"/>}
    </g>);
  if (mood === 'sleep' || mood === 'happy' || mood === 'proud') return <g>{spots.map(arch)}</g>;
  if (mood === 'wink' || mood === 'silly') return <g>{open(spots[0],0)}{arch(spots[1])}</g>;
  return <g>{spots.map(open)}</g>;
}

function Brows({ l, mood }: { l: Look; mood: Mood }) {
  if (!['sad', 'wow', 'proud', 'silly'].includes(mood)) return null;
  const c = l.hair === 'headscarf' ? shade(l.skin, -55) : shade(l.hairColor, -10);
  const y = CY - 4;
  const tilt = mood === 'sad' ? [2.5, -2.5] : mood === 'wow' ? [-3, -3] : mood === 'proud' ? [-1.5, -1.5] : [0, 0];
  return <g stroke={c} strokeWidth={1.8} strokeLinecap="round" opacity={0.8}>{[[49, tilt[0]], [71, tilt[1]]].map(([x, t], i) => <path key={i} d={`M${x - 3} ${y + (i === 0 ? t : -t) * 0.5 + (mood === 'wow' ? -2 : 0)} L${x + 3} ${y - (i === 0 ? t : -t) * 0.5 + (mood === 'wow' ? -2 : 0)}`} />)}</g>;
}

function Mouth({ l, mood }: { l: Look; mood: Mood }) {
  const y = CY + 17, ink = '#673947';
  switch(mood) {
    case 'eat': case 'wow': return <ellipse cx={60} cy={y} rx={3.2} ry={4.2} fill={ink}/>;
    case 'sad': case 'grumpy': return <path d={`M55 ${y+2}Q60 ${y-2} 65 ${y+2}`} fill="none" stroke={ink} strokeWidth={2.4} strokeLinecap="round"/>;
    case 'sleep': return <path d={`M57 ${y}Q60 ${y+2} 63 ${y}`} fill="none" stroke={ink} strokeWidth={2.1} strokeLinecap="round"/>;
    case 'silly': return <g><path d={`M55 ${y-1}Q60 ${y+5} 65 ${y-1}`} fill="none" stroke={ink} strokeWidth={2.3}/><ellipse cx={61} cy={y+4} rx={2.5} ry={3} fill="#E88AA5"/></g>;
    default: return <path d={`M54 ${y-2}Q60 ${y+9} 66 ${y-2}Z`} stroke={ink} strokeWidth={1.8} fill={mood === 'normal' || mood === 'wink' ? 'none' : ink}/>;
  }
}

function Glasses({ l }: { l: Look }) {
  const y = CY + 5;
  if (l.glasses === 'none') return null;
  if (l.glasses === 'star') {
    const star = (cx: number) => `M${cx} ${y - 8} L${cx + 2.6} ${y - 2.6} L${cx + 8.5} ${y - 2} L${cx + 4} ${y + 2} L${cx + 5.2} ${y + 8} L${cx} ${y + 5} L${cx - 5.2} ${y + 8} L${cx - 4} ${y + 2} L${cx - 8.5} ${y - 2} L${cx - 2.6} ${y - 2.6}Z`;
    return <g><path d={star(51)} {...P('#FF5D8F', 1.8)} /><path d={star(69)} {...P('#FF5D8F', 1.8)} /><path d={`M58 ${y - 2} L62 ${y - 2}`} stroke={line('#FF5D8F')} strokeWidth={1.8} /></g>;
  }
  const fr = '#3D3A63';
  return (
    <g fill="#ffffff" fillOpacity={0.18} stroke={fr} strokeWidth={1.9}>
      {l.glasses === 'round' ? <><circle cx={51} cy={y} r={7.6} /><circle cx={69} cy={y} r={7.6} /></> : <><rect x={43} y={y - 6} width={16} height={12} rx={4} /><rect x={61} y={y - 6} width={16} height={12} rx={4} /></>}
      <path d={`M58.5 ${y - 1} Q60 ${y - 3} 61.5 ${y - 1}`} fill="none" />
    </g>
  );
}

function Hat({ l }: { l: Look }) {
  switch (l.hat) {
    case 'cap': { const c = shade(l.topColor, -8); return <g><path d="M37 26 C37 4 83 4 83 26Z" {...P(c)} /><path d="M58 24 Q86 20 98 28 Q82 32 58 30Z" {...P(shade(c, -22))} /><circle cx={60} cy={6} r={2.4} fill={line(c)} /></g>; }
    case 'beanie': return <g><path d="M36 28 C34 0 86 0 84 28Z" {...P('#FF8A3D')} /><rect x={34} y={22} width={52} height={10} rx={5} {...P('#FFC93C')} />{[42, 50, 58, 66, 74].map((x) => <line key={x} x1={x} x2={x} y1={24} y2={30} stroke={line('#FFC93C')} strokeWidth={1.2} />)}<circle cx={60} cy={-1} r={6} {...P('#ffffff')} /></g>;
    case 'crown': return <path d="M42 22 L43 4 L52 13 L60 0 L68 13 L77 4 L78 22Z" {...P('#FFC93C')} />;
    case 'hardhat': return <g><path d="M37 28 C37 2 83 2 83 28Z" {...P('#FFC93C')} /><rect x={30} y={25} width={60} height={7} rx={3.5} {...P('#FFB000')} /><path d="M60 6 L60 25" stroke={line('#FFC93C')} strokeWidth={2} /></g>;
    default: return null;
  }
}

function Accessory({ l, g }: { l: Look; g: Geo }) {
  switch (l.accessory) {
    case 'bow': return <g><path d="M78 15 L70 9 L70 21Z" {...P('#FF5D8F', 1.8)} /><path d="M78 15 L86 9 L86 21Z" {...P('#FF5D8F', 1.8)} /><circle cx={78} cy={15} r={2.6} {...P('#FF5D8F', 1.6)} /></g>;
    case 'headphones': return <g><path d="M36 38 C36 2 84 2 84 38" fill="none" stroke="#3D3A63" strokeWidth={4} strokeLinecap="round" /><rect x={31} y={32} width={10} height={16} rx={5} {...P('#3D7BFF')} /><rect x={79} y={32} width={10} height={16} rx={5} {...P('#3D7BFF')} /></g>;
    case 'scarf': return <g><rect x={60 - g.tw + 4} y={56} width={(g.tw - 4) * 2} height={10} rx={5} {...P('#FF5D8F')} /><path d={`M${60 + g.tw - 12} 62 l2 22 l7 -1 l-1 -21Z`} {...P('#FF5D8F')} />{[0, 1, 2].map((i) => <line key={i} x1={60 - g.tw + 10 + i * 9} x2={60 - g.tw + 10 + i * 9} y1={58} y2={64} stroke="#fff" strokeWidth={1.6} opacity={0.7} />)}</g>;
    case 'crossbody': return <g><path d={`M${60 + g.tw - 5} 59 L${60 - g.tw - 1} ${g.waist + 2}`} stroke="#E07A2E" strokeWidth={2.6} strokeLinecap="round" fill="none" /><rect x={60 - g.tw - 11} y={g.waist - 2} width={17} height={14} rx={5} {...P('#FFC93C')} /><path d={`M${60 - g.tw - 11} ${g.waist + 3} Q${60 - g.tw - 2.5} ${g.waist + 9} ${60 - g.tw + 6} ${g.waist + 3}`} fill="none" stroke={line('#FFC93C')} strokeWidth={1.6} /><path d={`M${60 - g.tw - 2.5} ${g.waist + 5.5} l1.6 -1.6 a1.1 1.1 0 0 1 1.6 1.6 l-3.2 3.2 l-3.2 -3.2 a1.1 1.1 0 0 1 1.6 -1.6Z`} fill="#FF5D8F" /></g>;
    case 'necklace': return <g><path d={`M${60 - 9} 61 Q60 74 ${60 + 9} 61`} fill="none" stroke="#FFC93C" strokeWidth={2} /><path d="M60 70 l3 3.5 l-3 3.5 l-3 -3.5Z" {...P('#5FE0B7', 1.4)} /></g>;
    default: return null;
  }
}

// ── Body ──────────────────────────────────────────
function topFill(l: Look) {
  if (l.bottom === 'dress') return l.bottomColor;
  return l.top === 'labcoat' ? '#FFFFFF' : l.top === 'suit' ? '#3F4275' : l.top === 'vest' ? '#FF8A3D' : l.topColor;
}

function Arms({ l, g }: { l: Look; g: Geo }) {
  const c = topFill(l);
  const sweat = l.top === 'sweatshirt' && l.bottom !== 'dress';
  const long = ['hoodie', 'sweater', 'labcoat', 'suit', 'sweatshirt'].includes(l.top) && l.bottom !== 'dress';
  const aw = g.aw + (sweat ? 2.5 : 0);
  const len = g.waist - 62 + 6;
  const tw = g.tw + (sweat ? 3 : 0);
  return (
    <g>
      {[-1, 1].map((s) => {
        const x = s < 0 ? 60 - tw - aw + 2.5 : 60 + tw - 2.5;
        let rot = -s * (g.adult ? 7 : 10);
        if (g.pose === 'wave' && s > 0) rot = -152;
        if (g.pose === 'walk') rot = s < 0 ? 16 : 14;
        const handR = aw * 0.55;
        return (
          <g key={s} transform={`rotate(${rot} ${x + aw / 2} 64)`}>
            {long ? <rect x={x} y={60} width={aw} height={len} rx={aw / 2} {...P(c)} />
              : <><rect x={x + 0.5} y={66} width={aw - 1} height={len - 6} rx={(aw - 1) / 2} {...P(l.skin)} /><path d={`M${x - 1} 72 L${x - 1} 64 Q${x - 1} 59 ${x + aw / 2} 59 Q${x + aw + 1} 59 ${x + aw + 1} 64 L${x + aw + 1} 72Z`} {...P(l.top === 'vest' ? l.topColor : c)} /></>}
            {long && (l.top === 'sweater' || sweat) && <rect x={x - 0.5} y={60 + len - 7} width={aw + 1} height={7} rx={3.5} {...P(shade(c, -12), 1.6)} />}
            {g.pose === 'wave' && s > 0
              ? <g><circle cx={x + aw / 2} cy={60 + len + 3} r={handR + 0.6} {...P(l.skin)} />{[-1, 0, 1].map((k) => <rect key={k} x={x + aw / 2 + k * 2.6 - 1.1} y={60 + len + 3} width={2.2} height={5.5} rx={1.1} {...P(l.skin, 1.2)} />)}</g>
              : <circle cx={x + aw / 2} cy={60 + len + 2} r={handR} {...P(l.skin)} />}
          </g>
        );
      })}
    </g>
  );
}

function Torso({ l, g }: { l: Look; g: Geo }) {
  const c = topFill(l);
  const sweat = l.top === 'sweatshirt' && l.bottom !== 'dress';
  const L = 60 - g.tw - (sweat ? 3 : 0), R = 60 + g.tw + (sweat ? 3 : 0), W = g.waist + (sweat ? 8 : 0);
  const belly = g.tw > 22 ? 6 : 0;
  const d = `M${L} 66 Q${L} 58 ${L + 8} 58 L${R - 8} 58 Q${R} 58 ${R} 66 Q${R + belly} ${(66 + W) / 2} ${R - 1} ${W} L${L + 1} ${W} Q${L - belly} ${(66 + W) / 2} ${L} 66Z`;
  const top = l.bottom === 'dress' ? 'dress' : l.top;
  const coatLen = l.top === 'labcoat' && l.bottom !== 'dress' ? (g.sit ? W + 14 : W + (g.foot - W) * 0.42) : W;
  return (
    <g>
      {top === 'hoodie' && <path d={`M${60 - 14} 60 Q60 48 ${60 + 14} 60 Q60 66 ${60 - 14} 60Z`} {...P(shade(c, -18))} />}
      {top === 'labcoat' && <path d={`M${L} 66 Q${L} 58 ${L + 8} 58 L${R - 8} 58 Q${R} 58 ${R} 66 L${R + 3} ${coatLen} L${L - 3} ${coatLen}Z`} {...P(c)} />}
      <path d={d} {...P(c)} />
      <path d={`M${R - 1.5} 64 Q${R + (g.tw > 22 ? 5 : 0) - 1} ${(66 + W) / 2} ${R - 2.5} ${W - 1} L${R - 9} ${W - 1} Q${R - 6} ${(66 + W) / 2} ${R - 7} 62Z`} fill={shade(c, -14)} opacity={0.55} />
      <ellipse cx={60} cy={60} rx={15} ry={4.5} fill={shade(c, -22)} opacity={0.5} />
      <path d={`M${L + 4} 68 Q${L + 3} ${(66 + W) / 2} ${L + 5} ${W - 6}`} fill="none" stroke="#fff" strokeWidth={2.2} opacity={0.3} strokeLinecap="round" />
      {top === 'tee' && <path d="M53 58 Q60 64 67 58" fill="none" stroke={shade(c, 45)} strokeWidth={3} strokeLinecap="round" />}
      {top === 'stripes' && <g>{[0, 1, 2, 3].map((i) => { const y = 66 + i * ((W - 66) / 4); return <rect key={i} x={L + 1.5} y={y} width={R - L - 3} height={(W - 66) / 8} fill={shade(c, 55)} />; })}</g>}
      {top === 'star' && <g><rect x={62} y={70} width={13} height={12} rx={3} {...P(shade(c, 30), 1.6)} /><path d="M68.5 72 l1.4 2.9 l3.1 0.4 l-2.3 2.1 l0.6 3.1 l-2.8 -1.6 l-2.8 1.6 l0.6 -3.1 l-2.3 -2.1 l3.1 -0.4Z" fill="#fff" /></g>}
      {top === 'hoodie' && <g><path d={`M50 ${W - 18} L70 ${W - 18} L73 ${W - 4} L47 ${W - 4}Z`} {...P(shade(c, -12), 1.8)} /><path d="M56 61 L55 74 M64 61 L65 74" stroke={line(c)} strokeWidth={1.6} strokeLinecap="round" /></g>}
      {top === 'sweater' && <g><path d={`M${L + 2} 78 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5 l${R - L - 47} -5`} fill="none" stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" opacity={0.85} /><path d="M52 58 Q60 64 68 58" fill="none" stroke={shade(c, -16)} strokeWidth={3.4} /></g>}
      {top === 'polo' && <g><path d="M52 57 L60 66 L68 57 L64 56 L60 61 L56 56Z" {...P('#ffffff', 1.6)} /><line x1={60} y1={66} x2={60} y2={78} stroke={line(c)} strokeWidth={1.4} /><circle cx={60} cy={70} r={1.3} fill={line(c)} /><circle cx={60} cy={75} r={1.3} fill={line(c)} /></g>}
      {top === 'labcoat' && <g><path d="M53 58 L60 80 L67 58Z" {...P(l.topColor, 1.6)} /><line x1={60} y1={80} x2={60} y2={coatLen} stroke={line(c)} strokeWidth={1.6} /><rect x={64} y={82} width={10} height={9} rx={2} {...P('#ffffff', 1.4)} /><line x1={67} y1={79} x2={67} y2={86} stroke="#3D7BFF" strokeWidth={1.8} /></g>}
      {top === 'suit' && <g><path d="M52 58 L60 84 L68 58Z" {...P('#ffffff', 1.6)} /><path d="M60 62 L57 66 L60 80 L63 66Z" {...P(l.topColor, 1.4)} /><circle cx={60} cy={92} r={1.6} fill="#fff" /><path d={`M${L + 1} 66 L56 78 M${R - 1} 66 L64 78`} stroke={line(c)} strokeWidth={1.6} /></g>}
      {top === 'vest' && <g><rect x={L + 1} y={80} width={R - L - 2} height={5} fill="#FFF36B" /><rect x={L + 1} y={W - 14} width={R - L - 2} height={5} fill="#FFF36B" /><path d="M55 58 L60 68 L65 58" {...P(l.topColor, 1.6)} /></g>}
      {top === 'sweatshirt' && <g><rect x={L - 0.5} y={W - 7} width={R - L + 1} height={8} rx={4} {...P(shade(c, -12), 1.8)} />{Array.from({ length: Math.floor((R - L) / 4) }, (_, i) => <line key={i} x1={L + 3 + i * 4} x2={L + 3 + i * 4} y1={W - 5.5} y2={W - 0.5} stroke={line(c)} strokeWidth={0.9} opacity={0.6} />)}<path d="M52 58 Q60 65 68 58" fill="none" stroke={shade(c, -14)} strokeWidth={3.2} strokeLinecap="round" />{[['#FF7FB5', 9], ['#FFC93C', 6.5], ['#5FE0B7', 4]].map(([col, r]) => <path key={col as string} d={`M${60 - (r as number)} 84 A${r} ${r} 0 0 1 ${60 + (r as number)} 84`} fill="none" stroke={col as string} strokeWidth={2.4} strokeLinecap="round" />)}<circle cx={51} cy={84} r={2.4} fill="#fff" /><circle cx={69} cy={84} r={2.4} fill="#fff" /></g>}
      {top === 'dress' && <path d={`M${L + 3} 78 Q60 84 ${R - 3} 78`} fill="none" stroke={shade(c, 40)} strokeWidth={2.4} strokeDasharray="3 4" strokeLinecap="round" />}
    </g>
  );
}

function Legs({ l, g, bandage }: { l: Look; g: Geo; bandage?: boolean }) {
  const W = g.waist, F = g.foot;
  const knee = g.sit ? W + 14 : (W + F) / 2;
  const xs = [60 - g.lw - 1, 60 + 1];
  const wide = l.bottom === 'widejeans';
  const pants = l.bottom === 'pants' || l.bottom === 'jeans' || wide;
  const legFill = pants ? l.bottomColor : l.skin;
  const legT = (i: number) => {
    if (g.pose !== 'walk') return undefined;
    const hx = xs[i] + g.lw / 2;
    return i === 0 ? `rotate(9 ${hx} ${W})` : `rotate(-7 ${hx} ${W}) translate(0 -4)`;
  };
  const shoeFor = (x: number, i: number) => (
    <g>
      <path d={`M${x - (i === 0 ? 6 : 1)} ${F + 6} Q${x - (i === 0 ? 6 : 1)} ${F - 7} ${x + g.lw / 2} ${F - 7} Q${x + g.lw + (i === 0 ? 1 : 6)} ${F - 7} ${x + g.lw + (i === 0 ? 1 : 6)} ${F + 6}Z`} {...P(l.shoes)} />
      {l.shoeAccent && <path d={`M${x - (i === 0 ? 5 : 0)} ${F + 1} Q${x + g.lw / 2} ${F - 4} ${x + g.lw + (i === 0 ? 0 : 5)} ${F + 1}`} fill="none" stroke={l.shoeAccent} strokeWidth={3} strokeLinecap="round" />}
      {l.shoeAccent && <circle cx={x + g.lw / 2 + (i === 0 ? -2 : 2)} cy={F - 3} r={1.6} fill="#fff" />}
      <rect x={x - (i === 0 ? 7 : 2)} y={F + 3} width={g.lw + 9} height={5} rx={2.5} {...P('#ffffff', 1.6)} />
    </g>
  );
  return (
    <g>
      {xs.map((x, i) => (
        <g key={x} transform={legT(i)}>
          {wide
            ? <><path d={`M${x} ${W - 2} L${x + g.lw} ${W - 2} L${x + g.lw + 6} ${F - 3} L${x - 6} ${F - 3}Z`} {...P(legFill)} />
                <path d={`M${x - 6} ${F - 9} L${x + g.lw + 6} ${F - 9} L${x + g.lw + 6.5} ${F - 2} L${x - 6.5} ${F - 2}Z`} {...P(shade(l.bottomColor, 35), 1.6)} />
                <line x1={x + g.lw / 2} x2={x + g.lw / 2 + (i === 0 ? -3 : 3)} y1={W + 8} y2={F - 11} stroke={shade(l.bottomColor, 30)} strokeWidth={1.4} strokeDasharray="2 3" /></>
            : pants && l.bottom === 'pants'
              ? <path d={`M${x} ${W - 2} L${x + g.lw} ${W - 2} L${x + g.lw + 2} ${F - 2} L${x - 2} ${F - 2}Z`} {...P(legFill)} />
              : <rect x={x} y={W - 2} width={g.lw} height={F - W} rx={g.lw / 2.4} {...P(legFill)} />}
          <rect x={x + (i === 0 ? g.lw - 4 : 1)} y={W} width={3} height={Math.max(4, F - W - 8)} rx={1.5} fill={shade(legFill, -18)} opacity={0.45} />
          {l.bottom === 'jeans' && !g.sit && <rect x={x - 1} y={F - 12} width={g.lw + 2} height={7} rx={3} {...P(shade(l.bottomColor, 45), 1.6)} />}
          {bandage && i === 0 && <rect x={x - 1} y={knee - 4} width={g.lw + 2} height={7} rx={3} {...P('#FFD6A5', 1.6)} />}
          {shoeFor(x, i)}
        </g>
      ))}
      {pants && <rect x={60 - g.tw + 1} y={W - 4} width={(g.tw - 1) * 2} height={12} rx={5} {...P(l.bottomColor)} />}
      {(l.bottom === 'jeans' || wide) && <line x1={60} y1={W + 2} x2={60} y2={W + 9} stroke={line(l.bottomColor)} strokeWidth={1.4} />}
      {l.bottom === 'shorts' && <path d={`M${60 - g.tw + 1} ${W - 4} L${60 + g.tw - 1} ${W - 4} Q${60 + g.tw + 3} ${knee - 6} ${60 + g.tw - 2} ${knee - 4} L61 ${knee - 4} L60 ${W + 8} L59 ${knee - 4} L${60 - g.tw + 2} ${knee - 4} Q${60 - g.tw - 3} ${knee - 6} ${60 - g.tw + 1} ${W - 4}Z`} {...P(l.bottomColor)} />}
      {l.bottom === 'skirt' && <path d={`M${60 - g.tw + 2} ${W - 6} L${60 + g.tw - 2} ${W - 6} L${60 + g.tw + 8} ${knee - 2} ${Array.from({ length: 6 }, (_, i) => { const x0 = 60 + g.tw + 8 - (i * (2 * g.tw + 16)) / 6; const x1 = x0 - (2 * g.tw + 16) / 6; return `Q${(x0 + x1) / 2} ${knee + 5} ${x1} ${knee - 2}`; }).join(' ')}Z`} {...P(l.bottomColor)} />}
      {l.bottom === 'skirt' && [0, 1, 2].map((i) => <circle key={i} cx={60 - g.tw / 2 + i * g.tw / 2} cy={(W + knee) / 2 + (i % 2) * 4} r={1.8} fill="#fff" opacity={0.8} />)}
      {l.bottom === 'dress' && <g><path d={`M${60 - g.tw} ${W - 30} L${60 + g.tw} ${W - 30} L${60 + g.tw + 10} ${knee + 4} L${60 - g.tw - 10} ${knee + 4}Z`} {...P(l.bottomColor)} /><path d={`M${60 - g.tw - 5} ${(W + knee) / 2 + 2} L${60 + g.tw + 5} ${(W + knee) / 2 + 2}`} stroke={line(l.bottomColor)} strokeWidth={1.6} /><path d={`M${60 - g.tw - 9} ${knee + 4} Q60 ${knee + 9} ${60 + g.tw + 9} ${knee + 4}`} fill="none" stroke={shade(l.bottomColor, 45)} strokeWidth={2.4} /></g>}
    </g>
  );
}

function FaceShade({ l }: { l: Look }) {
  const id = useId().replace(/:/g, '');
  const sh = shade(l.skin, -13);
  return (
    <g>
      <clipPath id={`hc${id}`}><path d={headPath(l.face)} /></clipPath>
      <g clipPath={`url(#hc${id})`}>
        <ellipse cx={60} cy={8} rx={34} ry={l.hair === 'buzz' || l.hair === 'spiky' ? 16 : 22} fill={sh} opacity={0.55} />
        <path d="M82 20 Q86 40 76 58 L90 58 L90 20Z" fill={sh} opacity={0.35} />
        <ellipse cx={52} cy={24} rx={9} ry={4} fill="#fff" opacity={0.18} />
      </g>
    </g>
  );
}

export function CharacterArt({ look, pose = 'stand', mood = 'normal', bandage = false, age = 'child', build }: {
  look: Look; pose?: Pose; mood?: Mood; bandage?: boolean; age?: 'child' | 'adult'; build?: Build;
}) {
  const l = look;
  const b: Build = build ?? (l as Look & { build?: Build }).build ?? 'average';
  const g = geo(age === 'adult', b, pose === 'sit', pose);
  const m: Mood = pose === 'sleep' ? 'sleep' : mood;
  const headScale = age === 'adult' ? 1.15 : 1.22;
  const scarf = l.hair === 'headscarf';
  return (
    <svg viewBox={`0 -26 120 ${g.vbH + 26}`} width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }} aria-hidden>
      <g transform={`translate(${60 - 60 * headScale} ${CY - CY * headScale}) scale(${headScale})`}><HairBack l={l} /></g>
      <Legs l={l} g={g} bandage={bandage} />
      <Torso l={l} g={g} />
      <Arms l={l} g={g} />
      <rect x={55.5} y={52} width={9} height={10} rx={3} {...P(l.skin)} />
      <Accessory l={{ ...l, accessory: l.accessory === 'scarf' || l.accessory === 'necklace' || l.accessory === 'crossbody' ? l.accessory : 'none' }} g={g} />
      <g transform={`translate(${60 - 60 * headScale} ${CY - CY * headScale}) scale(${headScale})`}>
        {!scarf && <><ellipse cx={37.5} cy={CY + 5} rx={4} ry={5} {...P(l.skin)} /><ellipse cx={82.5} cy={CY + 5} rx={4} ry={5} {...P(l.skin)} /></>}
        <path d={headPath(l.face)} {...P(l.skin)} />
        <FaceShade l={l} />
        <ellipse cx={43.5} cy={CY + 15} rx={5.4} ry={3.2} fill="#FF8FAE" opacity={0.55} />
        <ellipse cx={76.5} cy={CY + 15} rx={5.4} ry={3.2} fill="#FF8FAE" opacity={0.55} />
        <circle cx={45.2} cy={CY + 14} r={1} fill="#fff" opacity={0.85} /><circle cx={78.2} cy={CY + 14} r={1} fill="#fff" opacity={0.85} />
        <Brows l={l} mood={m} />
        <Eyes l={l} mood={m} />
        <ellipse cx={60} cy={CY + 12.5} rx={1.5} ry={1.1} fill={shade(l.skin, -28)} />
        <Mouth l={l} mood={m} />
        {m === 'sad' && <ellipse cx={44} cy={CY + 12} rx={1.4} ry={2} fill="#7FD3F7" />}
        <HairFront l={l} />
        <Accessory l={{ ...l, accessory: l.accessory === 'bow' || l.accessory === 'headphones' ? l.accessory : 'none' }} g={g} />
        <Glasses l={l} />
        <Hat l={l} />
      </g>
    </svg>
  );
}

/** Viewbox height used for layout (crop maths for face thumbnails). */
export const charViewBox = (age: 'child' | 'adult', pose: Pose = 'stand', build: Build = 'average') => {
  const g = geo(age === 'adult', build, pose === 'sit');
  return { y: -26, h: g.vbH + 26 };
};
