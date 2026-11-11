import type { PaperLook } from '../engine/types';
import { PAPER_HAIR_COLOURS, PAPER_SKIN_TONES } from '../data/paperArt';

/**
 * Original CareerTown 2D dollhouse rig.
 * Unlike the earlier face-only update, the head, hair, body, clothes,
 * accessories and shoes are ALL drawn as editable SVG layers from PaperLook.
 * Changing a wardrobe item changes the actual character, not just a preview.
 * Keep PaperLook IDs stable so existing saves are compatible.
 */
const INK = '#382B45';
const stroke = { stroke: INK, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
function fillFor(id: string | null, fallback: string): string {
  if (!id) return fallback;
  if (/black|navy|dark|judge|suit/.test(id)) return '#4F536C';
  if (/red|rose/.test(id)) return '#CF7277';
  if (/pink|bunny|heart|fairy|bow/.test(id)) return '#E7A6B7';
  if (/purple|lavender|plaid/.test(id)) return '#A89CCF';
  if (/green|dino|safety|olive/.test(id)) return '#8DAE90';
  if (/yellow|cream|khaki|beige/.test(id)) return '#E3C993';
  if (/blue|denim|jeans|doctor|lab|chef/.test(id)) return '#96B5CF';
  if (/orange|ginger/.test(id)) return '#DF9A70';
  if (/gray|grey|cargo|track/.test(id)) return '#A6ADB5';
  return fallback;
}

function Hair({ style, color }: { style: string | null; color: string }) {
  if (!style) return null;
  const base = { ...stroke, fill: color };
  const curls = /waves|wavy|curly|momwaves|messy|locs/.test(style);
  const bangs = /bob|bang|boyshort|dadshort|sleek|messy/.test(style);
  const long = /long|wavy|waves|braids|locs|ponytail|momwaves/.test(style);
  const pigtails = /braids|spacebuns/.test(style);
  const bun = /bun|topknot|spacebun/.test(style);
  const side = /sideswept|boyshort|dadshort|messy/.test(style);
  return <g>
    {long && <path d="M116 134 Q102 205 108 292 Q126 312 144 291 L215 291 Q234 311 251 290 Q254 195 244 135Z" {...base}/>}
    {pigtails && <g fill={color} {...stroke}><ellipse cx="104" cy="165" rx="22" ry="37"/><ellipse cx="256" cy="165" rx="22" ry="37"/></g>}
    {bun && <g fill={color} {...stroke}><circle cx={180} cy={62} r={32}/>{/spacebun/.test(style) && <><circle cx="115" cy="100" r="27"/><circle cx="245" cy="100" r="27"/></>}</g>}
    <path d={curls
      ? "M105 146 Q91 116 106 101 Q96 70 129 74 Q144 47 165 63 Q185 42 203 65 Q230 47 241 80 Q267 81 260 116 Q270 142 254 158 L244 169 Q233 147 224 151 Q209 137 194 151 Q178 135 164 153 Q145 135 133 157 Q118 148 105 165Z"
      : side
        ? "M106 162 Q94 96 138 79 Q184 45 227 78 Q264 102 254 166 Q249 143 231 129 Q202 138 185 120 Q166 150 106 162Z"
        : bangs
          ? "M103 164 Q94 80 158 71 Q219 58 254 109 L257 177 Q239 169 236 153 Q216 167 198 150 Q179 165 159 151 Q135 171 103 164Z"
          : "M105 170 Q94 94 143 75 Q192 54 239 84 Q266 107 252 170 Q244 143 228 129 Q202 138 181 117 Q154 150 105 170Z"
    } {...base}/>
    {bangs && <path d="M118 124 Q134 143 150 127 M165 118 Q181 145 196 127 M212 117 Q226 139 244 129" stroke="#fff" strokeWidth="3" opacity=".19" fill="none"/>}
    {curls && [113,139,164,190,217,240].map((x,i)=><circle key={i} cx={x} cy={91+(i%2)*7} r={15} fill={color} stroke={INK} strokeWidth="3"/>)}
    {/ponytail/.test(style) && <g><path d="M243 98 Q307 130 266 236 Q250 245 252 216 Q272 153 231 131Z" {...base}/><circle cx="246" cy="116" r="11" fill="#DFA1C7" stroke={INK} strokeWidth="3"/></g>}
    {/scrunchie|bow/.test(style) && <path d="M237 113l-23 -15v26z M240 113l24 -15v26z" fill="#E6A0B8" {...stroke}/>}
  </g>;
}

function Face({ face }: { face: string }) {
  const close = (x: number) => <path key={x} d={`M${x-12} 179 Q${x} 164 ${x+12} 179`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round"/>;
  const open = (x: number) => <g key={x}><ellipse cx={x} cy={177} rx="9" ry="12.5" fill={INK}/><circle cx={x-3} cy={172} r="3.5" fill="#fff"/></g>;
  const expression = face === 'laughing' || face === 'giggle' ? 'laugh'
    : face === 'surprised' || face === 'shocked' ? 'wow' : face;
  return <g>
    <ellipse cx="125" cy="202" rx="17" ry="9" fill="#E89EA0" opacity=".55"/>
    <ellipse cx="235" cy="202" rx="17" ry="9" fill="#E89EA0" opacity=".55"/>
    {expression==='laugh' || expression==='crying' ? <>{close(148)}{close(212)}</>
      : expression==='wink' || expression==='silly' ? <>{open(148)}{close(212)}</>
        : <>{open(148)}{open(212)}</>}
    <path d="M176 200q4 4 8 0" stroke="#97695F" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {expression==='wow' ? <ellipse cx="180" cy="221" rx="10" ry="13" fill="#713B4F"/> :
      expression==='sad'||expression==='crying'||expression==='grumpy' ? <path d="M165 225Q180 212 195 225" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round"/> :
      <path d="M162 214Q180 237 198 214" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round"/>}
  </g>;
}

function Outfit({ p, skin }: { p: PaperLook; skin: string }) {
  const top = p.top ?? '';
  const bottom = p.bottom ?? '';
  const dress = /dress|uniform|overall/.test(top);
  const shirt = fillFor(top, '#D5B7A2');
  const pants = fillFor(bottom, '#94AABE');
  const shoes = fillFor(p.shoes, '#D9BBA8');
  const coat = /coat|judge|suit|blazer|cardigan/.test(top);
  const stripes = /stripe|jersey|rainbow/.test(top);
  return <g>
    {/* Legs: distinct from rounded dollhouse torso; adult legs are longer. */}
    <path d="M146 405 L173 405 L169 523 Q150 538 137 520Z M187 405 L214 405 L222 520 Q207 538 188 523Z" fill={bottom ? pants : skin} {...stroke}/>
    {/short|skirt/.test(bottom) && <path d="M139 396L218 396L230 444L130 444Z" fill={pants} {...stroke}/>}
    {/skirt/.test(bottom) && <path d="M143 395L216 395L241 469Q180 484 119 469Z" fill={pants} {...stroke}/>}
    <path d="M137 514Q147 503 166 517L170 542Q142 554 127 540Z M191 517Q215 503 223 515L234 540Q213 553 189 542Z" fill={shoes} {...stroke}/>
    <path d="M127 536Q145 544 170 535 M190 536Q212 544 234 536" stroke="#F8F3EF" strokeWidth="6" fill="none"/>
    {/* Arms and hands */}
    <path d="M142 264Q117 275 111 326L105 378Q111 394 127 385L145 333Z M218 264Q241 277 248 329L254 378Q248 394 233 384L215 334Z" fill={coat?shirt:skin} {...stroke}/>
    <ellipse cx="115" cy="385" rx="15" ry="18" fill={skin} {...stroke}/>
    <ellipse cx="245" cy="385" rx="15" ry="18" fill={skin} {...stroke}/>
    {/* Main shirt/dress */}
    <path d="M147 260Q180 275 213 260Q229 278 231 317L223 409Q181 422 136 409L129 317Q131 277 147 260Z" fill={shirt} {...stroke}/>
    {stripes && [302,327,352].map(y=><path key={y} d={`M140 ${y}h81`} stroke="#F5F2EE" strokeWidth="9" opacity=".75"/>)}
    {coat && <path d="M165 270L180 327L195 270M180 327V409" fill="none" stroke="#F6EFEA" strokeWidth="8"/>}
    {/hoodie/.test(top) && <path d="M155 263Q180 296 205 263 M159 282l-3 31 M201 282l3 31" stroke="#F4E7E2" strokeWidth="5" fill="none"/>}
    {dress && <path d="M143 351Q180 368 216 351L252 494Q184 516 108 494Z" fill={shirt} {...stroke}/>}
    {/overall/.test(top) && <path d="M152 349L152 269M209 349L209 269" stroke="#F7E5E8" strokeWidth="13"/>}
    {/bunny/.test(top) && <g><ellipse cx="180" cy="332" rx="18" ry="14" fill="#FFF7EF"/><ellipse cx="170" cy="313" rx="6" ry="17" fill="#FFF7EF"/><ellipse cx="190" cy="313" rx="6" ry="17" fill="#FFF7EF"/><circle cx="174" cy="330" r="2.3" fill={INK}/><circle cx="186" cy="330" r="2.3" fill={INK}/></g>}
    {/doctor|lab|chef/.test(top) && <rect x="153" y="288" width="55" height="9" rx="4" fill="#F3EDEA" opacity=".9"/>}
    {/safety/.test(top) && <path d="M144 322h76M144 369h76" stroke="#FAE3A0" strokeWidth="11" opacity=".85"/>}
    <path d="M149 258Q180 279 211 258" fill="none" stroke="#FFF7F0" strokeWidth="9" strokeLinecap="round"/>
  </g>;
}

function Extra({ p }: { p: PaperLook }) {
  const a = Object.values(p.acc ?? {}).join(' ').toLowerCase();
  return <g>
    {/glasses|sunglasses/.test(a) && <g fill="none" stroke={INK} strokeWidth="5"><circle cx="149" cy="178" r="21"/><circle cx="211" cy="178" r="21"/><path d="M170 174q10 -6 20 0"/></g>}
    {/headphones/.test(a) && <g fill="none" stroke={INK} strokeWidth="9"><path d="M111 170Q95 91 180 85Q266 91 249 170"/><path d="M107 171v38M253 171v38"/></g>}
    {/bow|clip|flower|star/.test(a) && <path d="M233 110L214 98L216 120Z M235 110L253 98L254 120Z" fill="#EEA2BD" {...stroke}/>}
    {/cap|hat|beret|helmet/.test(a) && <g><path d="M110 139Q112 63 180 61Q250 63 250 139Z" fill="#D9B2D2" {...stroke}/><path d="M154 132Q244 124 276 149Q239 162 155 152Z" fill="#D9B2D2" {...stroke}/></g>}
    {/bag|purse/.test(a) && <g><path d="M225 335L254 428" stroke="#8B667F" strokeWidth="11"/><rect x="214" y="404" width="57" height="64" rx="13" fill="#C99CA5" {...stroke}/></g>}
  </g>;
}

/** Fits the existing rectangular paper character slot without changing layout. */
export function TownDoll({ p, face = 'happy', portrait = false }: { p: PaperLook; face?: string; portrait?: boolean }) {
  const skin = PAPER_SKIN_TONES[Math.max(0,Math.min(3,p.tone|0))] ?? PAPER_SKIN_TONES[0];
  const hairColor = PAPER_HAIR_COLOURS[p.hairColor] ?? '#41323A';
  return <svg viewBox={portrait ? "95 52 170 219" : "55 22 250 542"} width="100%" height="100%" preserveAspectRatio="xMidYMid meet"
    role="img" aria-label="Customizable CareerTown character" style={{ overflow: 'visible' }}>
    <Outfit p={p} skin={skin}/>
    {/* Round head, small features; no baked-in raster hair or clothing. */}
    <rect x="168" y="227" width="24" height="44" rx="11" fill={skin} {...stroke}/>
    <path d="M112 142Q113 94 180 89Q247 93 248 142L251 190Q247 242 181 250Q113 244 109 190Z" fill={skin} {...stroke}/>
    <ellipse cx="109" cy="187" rx="11" ry="19" fill={skin} {...stroke}/>
    <ellipse cx="251" cy="187" rx="11" ry="19" fill={skin} {...stroke}/>
    <Face face={face}/>
    <Hair style={p.hair} color={hairColor}/>
    <Extra p={p}/>
  </svg>;
}
