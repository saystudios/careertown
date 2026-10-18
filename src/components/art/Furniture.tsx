import type { ReactNode } from 'react';
import { INK } from './Character';
import { ART2 } from './Furniture2';

const S = { stroke: 'rgba(43,35,80,0.42)', strokeWidth: 2.6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const s2 = { ...S, strokeWidth: 2 };

export interface ArtProps { w: number; h: number; on?: boolean; active?: boolean; variant?: string; label?: string; img?: string }

const legs = (xs: number[], y: number, h: number, fill = INK) => xs.map((x) => <rect key={x} x={x} y={y} width={12} height={h} rx={4} fill={fill} {...s2} />);

const ART: Record<string, (p: ArtProps) => ReactNode> = {
  fridge: ({ on }) => (
    <>
      <rect x={4} y={4} width={157} height={302} rx={24} fill={on ? '#D6F4FF' : '#EAF8FF'} {...S} />
      {on ? (
        <>
          <rect x={16} y={16} width={133} height={278} rx={14} fill="#BFEFFF" {...s2} />
          {[96, 176, 236].map((y) => <line key={y} x1={16} x2={149} y1={y} y2={y} {...s2} />)}
          {[[40, 80, '#FF5D8F'], [80, 82, '#FFC93C'], [118, 78, '#8BD46E'], [46, 160, '#fff'], [92, 158, '#FF8A3D'], [60, 222, '#A98BFF'], [110, 222, '#5FE0B7']].map(([x, y, c], i) =>
            <circle key={i} cx={x as number} cy={y as number} r={14} fill={c as string} {...s2} />)}
          <path d="M4 4 L-50 22 L-50 300 L4 306Z" fill="#F4FBFF" {...S} />
        </>
      ) : (
        <>
          <line x1={4} x2={161} y1={112} y2={112} {...S} />
          <rect x={134} y={38} width={12} height={52} rx={6} fill="#B7C6D6" {...s2} />
          <rect x={134} y={132} width={12} height={74} rx={6} fill="#B7C6D6" {...s2} />
          <circle cx={42} cy={60} r={9} fill="#FF5D8F" {...s2} /><rect x={66} y={150} width={22} height={16} rx={4} fill="#FFC93C" {...s2} transform="rotate(-10 77 158)" />
          <rect x={30} y={190} width={34} height={26} rx={3} fill="#fff" {...s2} transform="rotate(6 47 203)" />
        </>
      )}
    </>
  ),
  stove: ({ active }) => (
    <>
      <rect x={4} y={22} width={152} height={149} rx={14} fill="#FFFFFF" {...S} />
      <rect x={4} y={4} width={152} height={22} rx={8} fill="#4A4766" {...S} />
      {[44, 116].map((x) => <ellipse key={x} cx={x} cy={15} rx={24} ry={5} fill={active ? '#FF8A3D' : '#2B2350'} className={active ? 'glow' : ''} />)}
      {[34, 64, 96, 126].map((x) => <circle key={x} cx={x} cy={46} r={7} fill="#E3E8F0" {...s2} />)}
      <rect x={24} y={70} width={112} height={74} rx={12} fill={active ? '#FFB27A' : '#4A4766'} {...S} />
      <rect x={34} y={80} width={34} height={8} rx={4} fill="#fff" opacity={0.35} />
    </>
  ),
  kitchensink: () => (
    <>
      <path d="M95 20 L95 -10 Q95 -22 108 -22 L120 -22" fill="none" {...S} strokeWidth={7} stroke="#B7C6D6" />
      <path d="M95 20 L95 -10 Q95 -22 108 -22 L120 -22" fill="none" {...s2} strokeWidth={2} />
      <rect x={4} y={32} width={182} height={139} rx={12} fill="#8FD3FF" {...S} />
      <line x1={95} x2={95} y1={40} y2={164} {...s2} />
      <circle cx={80} cy={100} r={5} fill={INK} /><circle cx={110} cy={100} r={5} fill={INK} />
      <rect x={0} y={16} width={190} height={22} rx={8} fill="#fff" {...S} />
      <ellipse cx={95} cy={22} rx={44} ry={6} fill="#BFE8F5" {...s2} />
    </>
  ),
  cupboard: ({ on }) => (
    <>
      <rect x={4} y={4} width={222} height={102} rx={14} fill={on ? '#FFE3D1' : '#FFB27A'} {...S} />
      {on ? <>{[50, 90, 130, 170].map((x, i) => <circle key={x} cx={x} cy={56} r={18} fill={['#fff', '#7FD3F7', '#fff', '#FF7FB5'][i]} {...s2} />)}<line x1={10} x2={220} y1={80} y2={80} {...s2} /></>
        : <><line x1={115} x2={115} y1={8} y2={102} {...S} /><circle cx={100} cy={55} r={6} fill={INK} /><circle cx={130} cy={55} r={6} fill={INK} /></>}
    </>
  ),
  table: () => (<>{legs([22, 246], 18, 104, '#8E5B3F')}<rect x={2} y={2} width={276} height={24} rx={10} fill="#C98F63" {...S} /><path d="M20 26 L260 26 L250 50 L30 50Z" fill="#FFF" opacity={0.0} /></>),
  chair: () => (<>{legs([14, 64], 76, 70, '#C9733A')}<rect x={12} y={2} width={66} height={72} rx={16} fill="#FF8A3D" {...S} /><rect x={4} y={66} width={82} height={18} rx={7} fill="#FFB27A" {...S} /></>),
  bed: () => (
    <>
      <rect x={4} y={4} width={74} height={160} rx={22} fill="#A98BFF" {...S} />
      <rect x={20} y={128} width={306} height={36} rx={10} fill="#7F63D9" {...S} />
      <rect x={20} y={74} width={304} height={60} rx={20} fill="#fff" {...S} />
      <ellipse cx={104} cy={78} rx={42} ry={18} fill="#fff" {...S} />
      <rect x={130} y={66} width={196} height={72} rx={20} fill="#FF7FB5" {...S} />
      {[170, 220, 270, 300].map((x, i) => <circle key={x} cx={x} cy={i % 2 ? 112 : 92} r={6} fill="#fff" />)}
    </>
  ),
  closet: ({ on }) => (
    <>
      <rect x={4} y={4} width={167} height={297} rx={16} fill="#5FE0B7" {...S} />
      {on ? (
        <>
          <rect x={16} y={20} width={143} height={266} rx={10} fill="#2F7F6B" {...s2} />
          <line x1={20} x2={155} y1={44} y2={44} {...s2} stroke="#fff" />
          {[['#FF5D8F', 34], ['#FFC93C', 70], ['#7FD3F7', 106], ['#A98BFF', 140]].map(([c, x]) =>
            <path key={x as number} d={`M${x as number} 44 l-16 16 l4 70 l24 0 l4 -70Z`} fill={c as string} {...s2} />)}
          <text x={87} y={240} textAnchor="middle" fontSize={22} fill="#fff" fontFamily="Grandstander, system-ui">Pick an outfit</text>
        </>
      ) : (
        <><line x1={87} x2={87} y1={8} y2={297} {...S} /><circle cx={74} cy={150} r={7} fill="#FFC93C" {...s2} /><circle cx={100} cy={150} r={7} fill="#FFC93C" {...s2} /><path d="M40 40 h20 M115 40 h20" {...S} /></>
      )}
    </>
  ),
  toybox: ({ on }) => (
    <>
      {on && <><circle cx={52} cy={26} r={16} fill="#FFC93C" {...s2} /><rect x={80} y={8} width={30} height={30} rx={6} fill="#7FD3F7" {...s2} /></>}
      <rect x={4} y={34} width={152} height={77} rx={14} fill="#FF5D8F" {...S} />
      <rect x={on ? -10 : 0} y={on ? -20 : 18} width={160} height={24} rx={10} fill="#FF7FB5" {...S} transform={on ? 'rotate(-18 0 18)' : undefined} />
      <path d="M80 54 l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2Z" fill="#FFF36B" {...s2} />
    </>
  ),
  lamp: ({ on }) => (
    <>
      {on && <circle cx={42} cy={40} r={95} fill="#FFF36B" opacity={0.35} className="glow" />}
      <ellipse cx={42} cy={186} rx={30} ry={8} fill="#7F63D9" {...S} />
      <rect x={38} y={60} width={8} height={124} fill={INK} />
      <path d="M14 66 L26 6 L58 6 L70 66Z" fill={on ? '#FFF36B' : '#FFE08A'} {...S} />
    </>
  ),
  tv: ({ on }) => (
    <>
      <rect x={10} y={124} width={190} height={58} rx={10} fill="#8E5B3F" {...S} />
      <line x1={105} x2={105} y1={130} y2={176} {...s2} />
      <rect x={6} y={4} width={198} height={116} rx={14} fill="#2B2350" {...S} />
      {on ? (
        <g className="tv-on">
          <rect x={18} y={16} width={174} height={92} rx={8} fill="#7FD3F7" />
          <circle cx={150} cy={44} r={16} fill="#FFC93C" />
          <path d="M18 108 L70 60 L110 96 L140 74 L192 108Z" fill="#8BD46E" />
          <circle cx={74} cy={84} r={10} fill="#FF5D8F" className="bounce" />
        </g>
      ) : <path d="M30 24 L60 24" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.3} />}
    </>
  ),
  window: ({ on }) => (
    <>
      <rect x={4} y={4} width={192} height={146} rx={14} fill={on ? '#2B2350' : '#9EE3FF'} {...S} />
      {on
        ? <><circle cx={140} cy={44} r={20} fill="#FFF36B" /><circle cx={150} cy={38} r={18} fill="#2B2350" />{[[40, 40], [80, 90], [60, 120], [160, 110]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={3} fill="#fff" />)}</>
        : <><circle cx={150} cy={44} r={18} fill="#FFF36B" {...s2} /><path d="M30 100 q10 -20 30 -10 q14 -18 32 0 q16 0 14 14 l-76 0Z" fill="#fff" {...s2} /></>}
      <line x1={100} x2={100} y1={6} y2={148} {...S} /><line x1={6} x2={194} y1={78} y2={78} {...S} />
      <path d="M0 0 Q30 80 10 160 L-14 160 L-14 0Z" fill="#FF7FB5" {...S} /><path d="M200 0 Q170 80 190 160 L214 160 L214 0Z" fill="#FF7FB5" {...S} />
    </>
  ),
  rug: () => (<><ellipse cx={170} cy={35} rx={166} ry={31} fill="#FFB0C8" {...S} /><ellipse cx={170} cy={35} rx={130} ry={20} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="14 12" /></>),
  starrug: () => (<><ellipse cx={150} cy={35} rx={146} ry={31} fill="#FFE08A" {...S} /><path d="M150 12 l7 14 l15 2 l-11 10 l3 15 l-14 -8 l-14 8 l3 -15 l-11 -10 l15 -2Z" fill="#FF8A3D" {...s2} /></>),
  couch: () => (
    <>
      {legs([40, 308], 150, 18)}
      <rect x={30} y={14} width={300} height={90} rx={30} fill="#3D7BFF" {...S} />
      <rect x={30} y={86} width={300} height={66} rx={20} fill="#5A92FF" {...S} />
      <line x1={180} x2={180} y1={90} y2={148} {...s2} />
      <rect x={4} y={58} width={50} height={100} rx={22} fill="#3D7BFF" {...S} />
      <rect x={306} y={58} width={50} height={100} rx={22} fill="#3D7BFF" {...S} />
      <rect x={70} y={40} width={60} height={46} rx={14} fill="#FFC93C" {...s2} transform="rotate(-8 100 63)" />
    </>
  ),
  bookshelf: () => (
    <>
      <rect x={4} y={4} width={162} height={257} rx={12} fill="#A8652F" {...S} />
      {[70, 140, 210].map((y) => <rect key={y} x={14} y={y} width={142} height={8} fill="#7A4A2B" />)}
      {[0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((i) => <rect key={`${r}${i}`} x={20 + i * 26 + (r % 2) * 6} y={20 + r * 70 + (i % 2) * 6} width={20} height={50 - (i % 2) * 6} rx={3} fill={['#FF5D8F', '#FFC93C', '#7FD3F7', '#8BD46E', '#A98BFF'][(i + r) % 5]} {...s2} strokeWidth={2.4} />))}
    </>
  ),
  shower: ({ active }) => (
    <>
      <rect x={4} y={4} width={182} height={332} rx={16} fill="#E9F9FF" {...S} />
      {[50, 100, 150, 200, 250].map((y) => <line key={y} x1={8} x2={182} y1={y} y2={y} stroke="#B9E6F5" strokeWidth={3} />)}
      {[50, 95, 140].map((x) => <line key={x} x1={x} x2={x} y1={8} y2={300} stroke="#B9E6F5" strokeWidth={3} />)}
      <path d="M60 30 L110 30 Q120 30 120 40 L120 50" fill="none" {...S} /><path d="M100 50 L140 50 L132 62 L108 62Z" fill="#B7C6D6" {...s2} />
      {active && <g className="drops">{[110, 120, 130].map((x, i) => <line key={x} x1={x} x2={x - 6} y1={74 + i * 8} y2={110 + i * 8} stroke="#3D9BFF" strokeWidth={4} strokeLinecap="round" />)}</g>}
      <rect x={0} y={306} width={190} height={30} rx={8} fill="#fff" {...S} />
      <path d="M150 8 Q170 100 160 300 L186 300 L186 8Z" fill="#FF7FB5" opacity={0.85} {...s2} />
    </>
  ),
  toilet: () => (<><rect x={10} y={4} width={70} height={60} rx={12} fill="#fff" {...S} /><ellipse cx={58} cy={74} rx={52} ry={16} fill="#fff" {...S} /><path d="M24 80 L34 150 L82 150 L92 80" fill="#fff" {...S} /><ellipse cx={58} cy={74} rx={38} ry={9} fill="#BFE8F5" /></>),
  bathsink: () => (<><rect x={50} y={60} width={36} height={122} rx={10} fill="#fff" {...S} /><path d="M6 30 L130 30 Q126 70 68 70 Q10 70 6 30Z" fill="#fff" {...S} /><ellipse cx={68} cy={32} rx={50} ry={6} fill="#BFE8F5" {...s2} /><path d="M68 28 L68 10 L84 10" fill="none" {...S} /></>),
  mirror: () => (<><ellipse cx={60} cy={75} rx={56} ry={71} fill="#FFC93C" {...S} /><ellipse cx={60} cy={75} rx={44} ry={58} fill="#CFF3FF" {...s2} /><path d="M36 60 L60 32 M40 84 L74 44" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></>),
  door: ({ label }) => (
    <>
      <rect x={4} y={4} width={122} height={262} rx={14} fill="#FF8A3D" {...S} />
      <rect x={20} y={80} width={90} height={70} rx={8} fill="#FFB27A" {...s2} /><rect x={20} y={166} width={90} height={80} rx={8} fill="#FFB27A" {...s2} />
      <circle cx={102} cy={160} r={8} fill="#FFC93C" {...s2} />
      <rect x={14} y={18} width={102} height={48} rx={12} fill="#fff" {...s2} />
      <text x={65} y={52} textAnchor="middle" fontSize={28}>{label}</text>
    </>
  ),
  sparkle: () => (<g className="twinkle">{[[20, 30, 8], [45, 18, 11], [58, 38, 6]].map(([x, y, r], i) => <path key={i} d={`M${x} ${y - r} L${x + r / 3} ${y - r / 3} L${x + r} ${y} L${x + r / 3} ${y + r / 3} L${x} ${y + r} L${x - r / 3} ${y + r / 3} L${x - r} ${y} L${x - r / 3} ${y - r / 3}Z`} fill="#FFF36B" stroke={INK} strokeWidth={1.5} />)}</g>),
  plant: () => (<>{[[-30, 60], [0, 40], [30, 60], [-15, 30], [18, 28]].map(([r, y], i) => <ellipse key={i} cx={47} cy={y} rx={14} ry={36} fill={i % 2 ? '#8BD46E' : '#5DB84A'} {...s2} transform={`rotate(${r} 47 95)`} />)}<path d="M18 92 L76 92 L68 156 L26 156Z" fill="#FF8A3D" {...S} /></>),
  beanbag: () => (<path d="M10 90 Q0 40 40 20 Q70 0 100 20 Q140 40 130 90Z" fill="#A98BFF" {...S} />),
  fishbowl: () => (<><circle cx={55} cy={58} r={48} fill="#BFEFFF" {...S} /><path d="M12 50 Q55 62 98 50 Q98 104 55 104 Q12 104 12 50Z" fill="#7FD3F7" /><g className="swim"><ellipse cx={52} cy={72} rx={14} ry={9} fill="#FF8A3D" {...s2} /><path d="M38 72 L28 64 L28 80Z" fill="#FF8A3D" {...s2} /></g><rect x={30} y={4} width={50} height={10} rx={5} fill="#fff" {...s2} /></>),
  rocketposter: () => (<><rect x={4} y={4} width={122} height={152} rx={8} fill="#2B2350" {...S} />{[[20, 20], [100, 40], [30, 120], [110, 130]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={3} fill="#fff" />)}<path d="M65 24 Q90 50 82 104 L48 104 Q40 50 65 24Z" fill="#fff" {...s2} /><circle cx={65} cy={64} r={10} fill="#7FD3F7" {...s2} /><path d="M54 106 L65 136 L76 106Z" fill="#FF8A3D" {...s2} /></>),
  petbed: () => (<><ellipse cx={75} cy={44} rx={71} ry={24} fill="#FF7FB5" {...S} /><ellipse cx={75} cy={40} rx={54} ry={14} fill="#FFE0F0" {...s2} /></>),
  block: ({ variant }) => {
    const c = variant === 'block-blue' ? '#3D7BFF' : variant === 'block-yellow' ? '#FFC93C' : '#FF5D8F';
    return <><rect x={3} y={3} width={84} height={64} rx={10} fill={c} {...S} /><circle cx={28} cy={34} r={8} fill="#fff" opacity={0.5} /><circle cx={62} cy={34} r={8} fill="#fff" opacity={0.5} /></>;
  },
  roofblock: () => (<path d="M4 56 L45 4 L86 56Z" fill="#8BD46E" {...S} />),
  chalkboard: ({ img }) => (
    <>
      <rect x={4} y={4} width={432} height={200} rx={14} fill="#A8652F" {...S} />
      <rect x={18} y={18} width={404} height={172} rx={8} fill="#2F5D50" {...s2} />
      {img ? <image href={img} x={18} y={18} width={404} height={172} preserveAspectRatio="none" />
        : <text x={220} y={112} textAnchor="middle" fill="#ffffff" opacity={0.85} fontSize={34} fontFamily="Grandstander, system-ui">Tap to draw!</text>}
      <rect x={60} y={200} width={320} height={14} rx={5} fill="#7A4A2B" {...s2} />
      <rect x={100} y={192} width={30} height={8} rx={3} fill="#fff" /><rect x={150} y={192} width={30} height={8} rx={3} fill="#FFC93C" />
    </>
  ),
  desk: () => (<>{legs([18, 140], 70, 62, '#7A4A2B')}<rect x={10} y={18} width={150} height={74} rx={10} fill="#FFC93C" {...S} /><rect x={2} y={4} width={166} height={20} rx={8} fill="#C98F63" {...S} /></>),
  teacherdesk: () => (<><rect x={4} y={18} width={262} height={118} rx={12} fill="#8E5B3F" {...S} /><rect x={24} y={36} width={90} height={36} rx={6} fill="#A8652F" {...s2} /><rect x={24} y={84} width={90} height={36} rx={6} fill="#A8652F" {...s2} /><rect x={0} y={4} width={270} height={22} rx={8} fill="#C98F63" {...S} /></>),
  wallclock: () => (<><circle cx={50} cy={50} r={44} fill="#fff" {...S} /><g className="hands"><line x1={50} y1={50} x2={50} y2={22} {...S} /><line x1={50} y1={50} x2={70} y2={58} {...S} /></g><circle cx={50} cy={50} r={5} fill="#FF5D8F" /></>),
  exambed: () => (<>{legs([30, 278], 100, 56, '#B7C6D6')}<rect x={10} y={70} width={300} height={40} rx={14} fill="#5FE0B7" {...S} /><rect x={6} y={30} width={80} height={50} rx={16} fill="#5FE0B7" {...S} transform="rotate(-12 46 55)" /><rect x={110} y={62} width={190} height={18} rx={6} fill="#fff" {...s2} /></>),
  medcabinet: ({ on }) => (
    <>
      <rect x={4} y={4} width={157} height={222} rx={14} fill="#fff" {...S} />
      {on ? <>{[40, 100].map((y) => <line key={y} x1={14} x2={151} y1={y + 40} y2={y + 40} {...s2} />)}{[[40, 60, '#FF5D8F'], [90, 60, '#7FD3F7'], [60, 120, '#FFC93C'], [110, 120, '#8BD46E'], [80, 180, '#A98BFF']].map(([x, y, c], i) => <rect key={i} x={(x as number) - 14} y={(y as number) - 22} width={28} height={30} rx={6} fill={c as string} {...s2} />)}</>
        : <><path d="M70 30 h26 v24 h24 v26 h-24 v24 h-26 v-24 h-24 v-26 h24Z" fill="#FF5D8F" {...s2} /><line x1={82} x2={82} y1={130} y2={220} {...s2} /><circle cx={70} cy={175} r={5} fill={INK} /><circle cx={94} cy={175} r={5} fill={INK} /></>}
    </>
  ),
  heartposter: () => (<><rect x={4} y={4} width={132} height={162} rx={10} fill="#FFF" {...S} /><path d="M70 130 C20 96 24 50 50 48 C62 47 68 56 70 62 C72 56 78 47 90 48 C116 50 120 96 70 130Z" fill="#FF5D8F" {...S} className="pulse-art" /><path d="M30 150 h80" stroke="#7FD3F7" strokeWidth={6} strokeLinecap="round" /></>),
  judgebench: () => (<><rect x={4} y={30} width={392} height={146} rx={14} fill="#8E5B3F" {...S} />{[30, 140, 250].map((x) => <rect key={x} x={x} y={60} width={100} height={92} rx={10} fill="#A8652F" {...s2} />)}<rect x={0} y={14} width={400} height={26} rx={10} fill="#C98F63" {...S} /><rect x={150} y={78} width={100} height={36} rx={8} fill="#FFC93C" {...s2} /><text x={200} y={104} textAnchor="middle" fontSize={22} fontFamily="Grandstander, system-ui" fill={INK}>Judge</text></>),
  witnessstand: () => (<><rect x={4} y={26} width={167} height={120} rx={12} fill="#A8652F" {...S} /><rect x={0} y={12} width={175} height={22} rx={8} fill="#C98F63" {...S} /><rect x={30} y={60} width={115} height={50} rx={8} fill="#8E5B3F" {...s2} /><text x={87} y={92} textAnchor="middle" fontSize={20} fontFamily="Grandstander, system-ui" fill="#fff">Witness</text></>),
  jurybox: () => (<><rect x={4} y={26} width={292} height={105} rx={12} fill="#A8652F" {...S} /><rect x={0} y={12} width={300} height={22} rx={8} fill="#C98F63" {...S} />{[20, 115, 210].map((x) => <rect key={x} x={x} y={50} width={70} height={64} rx={8} fill="#8E5B3F" {...s2} />)}</>),
  lawtable: () => (<>{legs([20, 218], 18, 98, '#5A3520')}<rect x={2} y={2} width={246} height={24} rx={10} fill="#8E5B3F" {...S} /><rect x={30} y={24} width={190} height={50} rx={6} fill="#A8652F" {...s2} /></>),
  scales: () => (<><circle cx={65} cy={65} r={60} fill="#FFE08A" {...S} /><line x1={65} y1={26} x2={65} y2={100} {...S} /><g className="tilt-art"><line x1={30} y1={40} x2={100} y2={40} {...S} /><path d="M18 70 L30 42 L42 70Z" fill="#fff" {...s2} /><path d="M88 70 L100 42 L112 70Z" fill="#fff" {...s2} /></g><rect x={44} y={98} width={42} height={10} rx={4} fill={INK} /></>),
  workbench: () => (<>{legs([20, 278], 30, 110, '#7A8699')}<rect x={10} y={86} width={290} height={14} rx={4} fill="#B7C6D6" {...s2} /><rect x={2} y={4} width={306} height={30} rx={10} fill="#C98F63" {...S} /></>),
  blueprint: () => (<><rect x={4} y={4} width={242} height={162} rx={10} fill="#3D7BFF" {...S} />{[40, 80, 120].map((y) => <line key={y} x1={8} x2={242} y1={y} y2={y} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} />)}{[50, 100, 150, 200].map((x) => <line key={x} x1={x} x2={x} y1={8} y2={162} stroke="#fff" strokeOpacity={0.25} strokeWidth={2} />)}<path d="M30 120 Q125 40 220 120 M30 120 L220 120 M70 120 L70 92 M125 120 L125 80 M180 120 L180 92" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></>),
  robot: () => (
    <g className="robot-bob">
      <line x1={60} y1={22} x2={60} y2={4} {...S} /><circle cx={60} cy={6} r={6} fill="#FF5D8F" {...s2} />
      <rect x={20} y={20} width={80} height={56} rx={16} fill="#B7C6D6" {...S} />
      <rect x={30} y={30} width={60} height={36} rx={10} fill="#2B2350" />
      <circle cx={46} cy={47} r={6} fill="#5FE0B7" /><circle cx={74} cy={47} r={6} fill="#5FE0B7" /><path d="M50 58 Q60 64 70 58" stroke="#5FE0B7" strokeWidth={3} fill="none" strokeLinecap="round" />
      <rect x={26} y={80} width={68} height={58} rx={14} fill="#7FD3F7" {...S} />
      <circle cx={60} cy={108} r={10} fill="#FFC93C" {...s2} />
      <rect x={4} y={86} width={20} height={40} rx={8} fill="#B7C6D6" {...s2} /><rect x={96} y={86} width={20} height={40} rx={8} fill="#B7C6D6" {...s2} />
      <rect x={34} y={138} width={18} height={24} rx={6} fill={INK} /><rect x={68} y={138} width={18} height={24} rx={6} fill={INK} />
    </g>
  ),
  computer: ({ on }) => (<>{legs([20, 198], 120, 66, '#7A8699')}<rect x={2} y={110} width={226} height={18} rx={8} fill="#C98F63" {...S} /><rect x={104} y={88} width={22} height={24} fill="#B7C6D6" {...s2} /><rect x={40} y={4} width={150} height={88} rx={10} fill={INK} {...S} />{on ? <g className="tv-on">{[18, 32, 46, 60, 74].map((y, i) => <rect key={y} x={54 + (i % 3) * 10} y={y} width={60 + ((i * 23) % 50)} height={7} rx={3.5} fill={['#5FE0B7', '#FFC93C', '#FF7FB5', '#7FD3F7', '#A98BFF'][i]} />)}</g> : <rect x={52} y={14} width={30} height={6} rx={3} fill="#fff" opacity={0.25} />}<rect x={70} y={114} width={70} height={10} rx={3} fill="#E3E8F0" {...s2} strokeWidth={2} /></>),
  serverrack: () => (<><rect x={4} y={4} width={132} height={262} rx={12} fill="#34355E" {...S} />{[20, 70, 120, 170, 220].map((y, i) => <g key={y}><rect x={16} y={y} width={108} height={38} rx={6} fill="#4A4766" {...s2} />{[30, 44, 58].map((x, k) => <circle key={x} cx={x} cy={y + 19} r={4.5} fill={['#5FE0B7', '#FFC93C', '#FF5D8F'][(i + k) % 3]} className={(i + k) % 2 ? 'glow' : ''} />)}<rect x={74} y={y + 15} width={40} height={8} rx={3} fill="#7A8699" /></g>)}</>),
  codeposter: () => (<><rect x={4} y={4} width={222} height={152} rx={12} fill="#fff" {...S} />{[['#FFC93C', 'M0 10 L10 0 L20 10 M10 0 L10 22'], ['#5FE0B7', 'M2 4 Q18 4 18 18 M12 12 L18 18 L24 12'], ['#FF7FB5', 'M4 14 A9 9 0 1 1 13 21 M4 6 L4 14 L12 14']].map(([c, d], i) => <g key={i} transform={`translate(${24 + i * 68} 40)`}><rect x={-6} y={-8} width={54} height={54} rx={12} fill={c} {...s2} /><path d={d} transform="translate(11 9)" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></g>)}<path d="M74 66 L86 66 M142 66 L154 66" stroke={INK} strokeWidth={4} strokeLinecap="round" /><text x={115} y={128} textAnchor="middle" fontSize={24} fontFamily="Grandstander, system-ui" fill={INK}>Step by step</text></>),
  pawposter: () => (<><rect x={4} y={4} width={132} height={162} rx={10} fill="#fff" {...S} /><g fill="#5FE0B7" {...s2}><ellipse cx={70} cy={98} rx={26} ry={22} />{[[42, 66], [58, 54], [82, 54], [98, 66]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx={10} ry={12} />)}</g><path d="M30 146 h80" stroke="#FFB0C8" strokeWidth={6} strokeLinecap="round" /></>),
  blockbin: () => (<><rect x={20} y={0} width={44} height={36} rx={6} fill="#FF5D8F" {...s2} transform="rotate(-10 42 18)" /><rect x={70} y={4} width={44} height={36} rx={6} fill="#3D7BFF" {...s2} /><path d="M118 36 L140 8 L162 36Z" fill="#8BD46E" {...s2} /><rect x={4} y={30} width={162} height={76} rx={14} fill="#FFC93C" {...S} /><text x={85} y={78} textAnchor="middle" fontSize={22} fontFamily="Grandstander, system-ui" fill={INK}>Blocks</text></>),
};

export function FurnitureArt({ art, ...p }: ArtProps & { art: string }) {
  const draw = ART[art] ?? ART2[art];
  return (
    <svg viewBox={`0 0 ${p.w} ${p.h}`} width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }} aria-hidden>
      {draw ? draw(p) : <rect x={4} y={4} width={p.w - 8} height={p.h - 8} rx={12} fill="#eee" {...S} />}
    </svg>
  );
}
