import type { ReactNode } from 'react';
import type { ArtProps } from './Furniture';

/** More furniture (Oct 2026), drawn in the same chunky outlined style. Each drawing fills its item's w × h. */
const INK = '#2B2350';
const S = { stroke: 'rgba(43,35,80,0.42)', strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const s2 = { ...S, strokeWidth: 2 };
const leg = (x: number, y: number, h: number, fill = '#8E5B3F', w = 12) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={4} fill={fill} {...s2} />;

export const ART2: Record<string, (p: ArtProps) => ReactNode> = {
  // 230 × 280
  bunkbed: () => (
    <>
      <rect x={6} y={4} width={18} height={272} rx={8} fill="#5FB894" {...S} /><rect x={206} y={4} width={18} height={272} rx={8} fill="#5FB894" {...S} />
      {[[24, 70], [24, 200]].map(([x, y]) => (
        <g key={y}>
          <rect x={x} y={y} width={182} height={34} rx={10} fill="#FFFFFF" {...S} />
          <rect x={x + 60} y={y - 4} width={122} height={30} rx={10} fill="#7FD3F7" {...s2} />
          <ellipse cx={x + 30} cy={y + 2} rx={24} ry={14} fill="#FFF6E6" {...s2} />
          <rect x={x} y={y + 30} width={182} height={18} rx={6} fill="#8BD46E" {...s2} />
        </g>
      ))}
      <rect x={24} y={52} width={182} height={12} rx={5} fill="#5FB894" {...s2} />
      {[110, 140, 170].map((y) => <rect key={y} x={150} y={y} width={50} height={8} rx={4} fill="#3FA07E" {...s2} />)}
      <rect x={150} y={100} width={8} height={100} rx={4} fill="#3FA07E" {...s2} /><rect x={192} y={100} width={8} height={100} rx={4} fill="#3FA07E" {...s2} />
      <path d="M40 30 l6 -12 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9z" fill="#FFC93C" {...s2} />
    </>
  ),
  // 300 × 150
  sofa: () => (
    <>
      <rect x={20} y={10} width={260} height={80} rx={30} fill="#7FD3F7" {...S} />
      <rect x={4} y={56} width={292} height={64} rx={24} fill="#5BB8E8" {...S} />
      <rect x={4} y={40} width={48} height={90} rx={22} fill="#7FD3F7" {...S} /><rect x={248} y={40} width={48} height={90} rx={22} fill="#7FD3F7" {...S} />
      <line x1={150} y1={64} x2={150} y2={112} {...s2} />
      <rect x={64} y={30} width={56} height={44} rx={14} fill="#FFC93C" {...s2} transform="rotate(-8 92 52)" />
      {leg(30, 126, 20, INK, 14)}{leg(256, 126, 20, INK, 14)}
    </>
  ),
  // 220 × 170
  piano: ({ on }) => (
    <>
      <rect x={10} y={6} width={200} height={100} rx={14} fill="#3A2E5C" {...S} />
      <rect x={26} y={18} width={60} height={40} rx={6} fill="#FFF6E6" {...s2} />
      <path d="M40 30 v18 M40 30 l14 -4 v18" stroke={INK} strokeWidth={3} fill="none" /><circle cx={37} cy={48} r={4} fill={INK} /><circle cx={51} cy={44} r={4} fill={INK} />
      <rect x={4} y={92} width={212} height={34} rx={6} fill="#fff" {...S} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={20 + i * 15} y1={92} x2={20 + i * 15} y2={126} stroke="rgba(43,35,80,.35)" strokeWidth={2} />)}
      {[0, 1, 3, 4, 5, 7, 8, 10, 11].map((i) => <rect key={i} x={15 + i * 15} y={92} width={9} height={20} rx={2} fill={INK} />)}
      <rect x={10} y={124} width={200} height={14} rx={5} fill="#3A2E5C" {...s2} />
      {leg(20, 136, 32, '#3A2E5C')}{leg(188, 136, 32, '#3A2E5C')}
      {on && <g className="flicker">{[[150, 30], [175, 12], [196, 40]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize={22} fill="#FF5D8F">♪</text>)}</g>}
    </>
  ),
  // 220 × 200
  fireplace: ({ on }) => (
    <>
      <rect x={4} y={20} width={212} height={176} rx={10} fill="#E9A07A" {...S} />
      {[50, 90, 130, 170].map((y) => <line key={y} x1={4} x2={216} y1={y} y2={y} stroke="rgba(43,35,80,.18)" strokeWidth={2} />)}
      <rect x={0} y={6} width={220} height={24} rx={8} fill="#F6E8D6" {...S} />
      <path d="M50 196 V110 Q110 60 170 110 V196Z" fill="#3A2E5C" {...S} />
      <rect x={66} y={172} width={88} height={14} rx={6} fill="#8E5B3F" {...s2} />
      {on ? (
        <g className="flicker">
          <path d="M80 174 Q70 140 96 120 Q94 140 108 146 Q104 120 122 104 Q124 132 142 140 Q148 160 138 174Z" fill="#FF8A3D" {...s2} />
          <path d="M96 174 Q92 154 106 144 Q108 158 118 160 Q120 148 128 140 Q134 160 126 174Z" fill="#FFC93C" />
        </g>
      ) : <path d="M88 172 Q110 150 132 172" fill="none" stroke="#8E8E9A" strokeWidth={4} strokeLinecap="round" />}
      <rect x={24} y={-14} width={30} height={22} rx={4} fill="#FF7FB5" {...s2} /><circle cx={180} cy={-2} r={12} fill="#8BD46E" {...s2} />
    </>
  ),
  // 200 × 150
  aquarium: () => (
    <>
      <rect x={4} y={4} width={192} height={112} rx={12} fill="#BFEFFF" {...S} />
      <rect x={10} y={22} width={180} height={88} rx={8} fill="#7FD3F7" />
      <path d="M10 104 Q50 92 100 104 T190 100 V110 H10Z" fill="#FFE3A3" />
      <path d="M40 104 Q34 80 44 64 M44 104 Q50 84 42 72" stroke="#5FB894" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M160 104 Q154 84 166 70" stroke="#5FB894" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g className="swim"><ellipse cx={90} cy={56} rx={16} ry={10} fill="#FF8A3D" {...s2} /><path d="M74 56 L62 47 L62 65Z" fill="#FF8A3D" {...s2} /><circle cx={98} cy={53} r={2.5} fill={INK} /></g>
      <g className="swim" style={{ animationDelay: '-1.4s' }}><ellipse cx={136} cy={82} rx={12} ry={8} fill="#FFC93C" {...s2} /><path d="M148 82 L158 75 L158 89Z" fill="#FFC93C" {...s2} /><circle cx={130} cy={80} r={2.2} fill={INK} /></g>
      {[[120, 40], [126, 30], [116, 22]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 + i} fill="#fff" opacity={0.8} />)}
      <rect x={20} y={116} width={160} height={30} rx={6} fill="#8E5B3F" {...S} />
    </>
  ),
  // 110 × 190
  jukebox: ({ on }) => (
    <>
      <path d="M6 186 V60 Q6 6 55 6 Q104 6 104 60 V186Z" fill="#FF5D8F" {...S} />
      <path d="M18 100 V64 Q18 20 55 20 Q92 20 92 64 V100Z" fill={on ? '#FFE08A' : '#FFD1E2'} {...s2} />
      {[30, 44, 58, 72, 86].map((y) => <line key={y} x1={24} x2={86} y1={y + 12} y2={y + 12} stroke="rgba(43,35,80,.25)" strokeWidth={2} />)}
      <rect x={20} y={110} width={70} height={30} rx={6} fill="#fff" {...s2} />
      {[30, 46, 62, 78].map((x) => <circle key={x} cx={x} cy={125} r={5} fill={on ? '#5FE0B7' : '#B7C6D6'} />)}
      <rect x={20} y={150} width={70} height={26} rx={6} fill="#3A2E5C" {...s2} />
      {on && <g className="flicker">{[[-6, 30], [96, 18], [100, 60]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize={24} fill="#A98BFF">♫</text>)}</g>}
    </>
  ),
  // 120 × 210
  arcade: ({ on }) => (
    <>
      <path d="M10 206 V20 Q10 6 24 6 H96 Q110 6 110 20 V206Z" fill="#6C5CE7" {...S} />
      <rect x={18} y={14} width={84} height={22} rx={6} fill="#FFC93C" {...s2} />
      <text x={60} y={31} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK} fontFamily="Grandstander, ui-rounded, sans-serif">PLAY</text>
      <rect x={18} y={44} width={84} height={64} rx={8} fill={on ? '#1E1C50' : '#34355E'} {...s2} />
      {on && <g>
        <circle cx={44} cy={78} r={10} fill="#FFC93C" /><path d="M44 78 L56 70 L56 86Z" fill="#1E1C50" className="flicker" />
        {[66, 78, 90].map((x) => <circle key={x} cx={x} cy={78} r={3} fill="#fff" />)}
        <rect x={74} y={54} width={14} height={12} rx={4} fill="#FF5D8F" />
      </g>}
      <path d="M10 116 H110 L104 140 H16Z" fill="#8A7CF0" {...s2} />
      <line x1={40} y1={124} x2={40} y2={110} stroke={INK} strokeWidth={4} strokeLinecap="round" /><circle cx={40} cy={108} r={6} fill="#FF5D8F" {...s2} />
      <circle cx={70} cy={126} r={6} fill="#5FE0B7" {...s2} /><circle cx={86} cy={124} r={6} fill="#FFC93C" {...s2} />
      <rect x={42} y={160} width={36} height={24} rx={4} fill="#34355E" {...s2} /><rect x={56} y={166} width={8} height={12} rx={2} fill="#FFC93C" />
    </>
  ),
  // 90 × 170
  gumball: () => (
    <>
      <circle cx={45} cy={48} r={42} fill="#E9F8FF" {...S} />
      {[[30, 40, '#FF5D8F'], [48, 30, '#FFC93C'], [60, 50, '#5FE0B7'], [36, 62, '#7FD3F7'], [54, 68, '#A98BFF'], [24, 56, '#FF8A3D'], [64, 34, '#8BD46E'], [44, 50, '#FF7FB5']].map(([x, y, c], i) =>
        <circle key={i} cx={x as number} cy={y as number} r={9} fill={c as string} {...s2} />)}
      <ellipse cx={30} cy={26} rx={10} ry={6} fill="#fff" opacity={0.8} />
      <rect x={14} y={86} width={62} height={46} rx={10} fill="#FF5D8F" {...S} />
      <circle cx={45} cy={104} r={10} fill="#E3E8F0" {...s2} /><rect x={36} y={120} width={18} height={8} rx={2} fill="#3A2E5C" />
      <rect x={38} y={130} width={14} height={30} fill="#FF5D8F" {...s2} /><rect x={20} y={156} width={50} height={12} rx={5} fill="#FF5D8F" {...s2} />
    </>
  ),
  // 120 × 190
  easel: ({ img }) => (
    <>
      <path d="M60 10 L14 186 M60 10 L106 186 M60 10 L60 180" stroke="#C98F63" strokeWidth={10} strokeLinecap="round" />
      <rect x={10} y={22} width={100} height={92} rx={4} fill="#fff" {...S} />
      {img ? <image href={img} x={14} y={26} width={92} height={84} preserveAspectRatio="xMidYMid slice" /> : <>
        <circle cx={40} cy={50} r={14} fill="#FFC93C" /><path d="M14 104 Q40 72 62 96 Q80 80 106 104Z" fill="#8BD46E" /><path d="M70 40 q10 -10 20 0" stroke="#7FD3F7" strokeWidth={4} fill="none" />
      </>}
      <rect x={8} y={112} width={104} height={10} rx={4} fill="#A8652F" {...s2} />
    </>
  ),
  // 160 × 200
  vanity: () => (
    <>
      <ellipse cx={80} cy={50} rx={52} ry={46} fill="#FFE0F0" {...S} /><ellipse cx={80} cy={50} rx={40} ry={34} fill="#DDF4FF" {...s2} />
      <path d="M58 30 L74 22" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <rect x={4} y={92} width={152} height={70} rx={12} fill="#FF7FB5" {...S} />
      <line x1={80} y1={92} x2={80} y2={162} {...s2} />
      <circle cx={66} cy={128} r={5} fill="#FFC93C" {...s2} /><circle cx={94} cy={128} r={5} fill="#FFC93C" {...s2} />
      <rect x={16} y={80} width={18} height={14} rx={3} fill="#A98BFF" {...s2} /><circle cx={128} cy={84} r={8} fill="#FF5D8F" {...s2} />
      {leg(14, 160, 36, '#C2477A')}{leg(134, 160, 36, '#C2477A')}
    </>
  ),
  // 100 × 230
  starlamp: ({ on }) => (
    <>
      {on && <circle cx={50} cy={40} r={52} fill="#FFE08A" opacity={0.45} className="flicker" />}
      <path d="M50 8 l11 22 l24 4 l-17 17 l4 24 l-22 -12 l-22 12 l4 -24 l-17 -17 l24 -4z" fill={on ? '#FFE08A' : '#FFF6D6'} {...S} />
      <rect x={45} y={74} width={10} height={130} rx={4} fill="#A98BFF" {...s2} />
      <ellipse cx={50} cy={214} rx={38} ry={12} fill="#7F63D9" {...S} />
    </>
  ),
  // 130 × 230
  swingchair: () => (
    <>
      <path d="M65 4 V40" stroke="#8E5B3F" strokeWidth={6} strokeLinecap="round" />
      <path d="M20 120 Q20 40 65 40 Q110 40 110 120 Q110 196 65 196 Q20 196 20 120Z" fill="none" stroke="#C98F63" strokeWidth={8} />
      <path d="M30 150 Q65 210 100 150 Q100 180 65 190 Q30 180 30 150Z" fill="#C98F63" {...s2} />
      <ellipse cx={65} cy={152} rx={36} ry={14} fill="#FFE0F0" {...s2} />
      <path d="M44 80 Q65 60 86 80" stroke="#C98F63" strokeWidth={4} fill="none" />
      <rect x={52} y={196} width={26} height={30} rx={6} fill="#8E5B3F" {...s2} />
    </>
  ),
  // 160 × 130
  cafetable: () => (
    <>
      <ellipse cx={80} cy={16} rx={76} ry={14} fill="#FFF6E6" {...S} />
      <rect x={72} y={26} width={16} height={86} rx={5} fill="#3A2E5C" {...s2} />
      <ellipse cx={80} cy={118} rx={44} ry={10} fill="#3A2E5C" {...s2} />
    </>
  ),
  // 70 × 120
  stool: () => (
    <>
      <ellipse cx={35} cy={14} rx={32} ry={12} fill="#FF5D8F" {...S} />
      {leg(10, 20, 96, '#3A2E5C', 8)}{leg(52, 20, 96, '#3A2E5C', 8)}
      <rect x={10} y={76} width={50} height={7} rx={3} fill="#3A2E5C" />
    </>
  ),
  // 200 × 90
  plantshelf: () => (
    <>
      <rect x={4} y={60} width={192} height={16} rx={6} fill="#C98F63" {...S} />
      <path d="M30 76 L24 86 M170 76 L176 86" stroke="#8E5B3F" strokeWidth={5} strokeLinecap="round" />
      <rect x={20} y={36} width={32} height={26} rx={5} fill="#FF8A3D" {...s2} /><path d="M36 36 Q20 10 30 4 M36 36 Q40 8 50 6 M36 36 Q54 20 58 18" stroke="#5FB894" strokeWidth={5} fill="none" strokeLinecap="round" />
      {[[80, 22, '#3D7BFF'], [96, 18, '#FFC93C'], [112, 26, '#FF5D8F']].map(([x, h, c]) => <rect key={x as number} x={x as number} y={62 - (h as number) - 18} width={14} height={(h as number) + 18} rx={3} fill={c as string} {...s2} />)}
      <rect x={146} y={40} width={30} height={22} rx={5} fill="#A98BFF" {...s2} /><circle cx={161} cy={30} r={12} fill="#8BD46E" {...s2} />
    </>
  ),
  // 150 × 170
  giantteddy: () => (
    <>
      <circle cx={34} cy={30} r={22} fill="#C98F63" {...S} /><circle cx={116} cy={30} r={22} fill="#C98F63" {...S} />
      <circle cx={34} cy={30} r={11} fill="#FFD7B3" /><circle cx={116} cy={30} r={11} fill="#FFD7B3" />
      <ellipse cx={75} cy={124} rx={56} ry={44} fill="#C98F63" {...S} />
      <ellipse cx={75} cy={130} rx={30} ry={26} fill="#FFD7B3" />
      <circle cx={75} cy={58} r={46} fill="#C98F63" {...S} />
      <ellipse cx={75} cy={72} rx={20} ry={15} fill="#FFD7B3" /><ellipse cx={75} cy={66} rx={7} ry={5} fill={INK} />
      <circle cx={58} cy={50} r={5} fill={INK} /><circle cx={92} cy={50} r={5} fill={INK} />
      <path d="M68 78 Q75 84 82 78" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M58 100 l17 10 l17 -10 l-4 14 l-13 -4 l-13 4z" fill="#FF5D8F" {...s2} />
      <ellipse cx={30} cy={160} rx={22} ry={12} fill="#C98F63" {...s2} /><ellipse cx={120} cy={160} rx={22} ry={12} fill="#C98F63" {...s2} />
    </>
  ),
  // 180 × 190
  dollhouse: () => (
    <>
      <path d="M90 4 L176 70 H4Z" fill="#FF5D8F" {...S} />
      <rect x={14} y={68} width={152} height={118} rx={6} fill="#FFF1B8" {...S} />
      <line x1={90} y1={68} x2={90} y2={186} {...s2} /><line x1={14} y1={126} x2={166} y2={126} {...s2} />
      <rect x={28} y={80} width={46} height={36} rx={4} fill="#DDF4FF" {...s2} /><rect x={106} y={80} width={46} height={36} rx={4} fill="#DDF4FF" {...s2} />
      <rect x={30} y={140} width={24} height={46} rx={4} fill="#C98F63" {...s2} /><rect x={106} y={138} width={46} height={30} rx={4} fill="#FFC6E0" {...s2} />
      <circle cx={90} cy={44} r={12} fill="#DDF4FF" {...s2} />
    </>
  ),
  // 120 × 190
  telescope: () => (
    <>
      <g transform="rotate(-28 60 70)">
        <rect x={10} y={52} width={100} height={30} rx={10} fill="#3D7BFF" {...S} />
        <rect x={0} y={48} width={20} height={38} rx={6} fill="#FFC93C" {...s2} /><rect x={100} y={56} width={16} height={22} rx={4} fill="#2B2350" {...s2} />
      </g>
      <path d="M60 86 L22 186 M60 86 L98 186 M60 86 L60 180" stroke="#8E5B3F" strokeWidth={7} strokeLinecap="round" />
      <circle cx={60} cy={88} r={8} fill="#B7C6D6" {...s2} />
    </>
  ),
  // 240 × 110
  ballpit: () => (
    <>
      <path d="M4 40 Q4 106 120 106 Q236 106 236 40Z" fill="#7FD3F7" {...S} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = 22 + ((i * 37) % 196); const y = 28 + ((i * 13) % 26) - (i % 3) * 6;
        return <circle key={i} cx={x} cy={y} r={13} fill={['#FF5D8F', '#FFC93C', '#5FE0B7', '#A98BFF', '#FF8A3D'][i % 5]} {...s2} />;
      })}
      <ellipse cx={120} cy={40} rx={116} ry={14} fill="none" stroke="#5BB8E8" strokeWidth={10} />
    </>
  ),
};
