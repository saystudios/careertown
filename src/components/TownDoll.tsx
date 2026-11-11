import type { PaperLook, DollLook } from '../engine/types';
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

/** The hair behind the face is a separate layer: it cannot hide eyes or cheeks. */
function HairBack({ style, color }: { style: string | null; color: string }) {
  if (!style) return null;
  const base = { ...stroke, fill: color };
  const long = /long|wavy|waves|braids|locs|ponytail|momwaves/.test(style);
  const braids = /braids/.test(style);
  const pony = /ponytail/.test(style);
  const buns = /bun|topknot/.test(style);
  return <g>
    {long && <path d="M116 136Q100 198 110 290Q127 309 145 289L216 289Q232 307 249 289Q260 198 244 136Z" {...base}/>}
    {braids && <g fill={color} {...stroke}><path d="M115 164Q92 209 113 288L131 299Q128 209 136 164Z"/><path d="M225 164Q234 208 230 298L247 288Q267 204 245 164Z"/></g>}
    {pony && <path d="M241 109Q297 123 275 218Q263 249 250 227Q263 167 231 137Z" {...base}/>}
    {buns && <g fill={color} {...stroke}>
      {/spacebun/.test(style) ? <><circle cx="121" cy="105" r="27"/><circle cx="239" cy="105" r="27"/></>
        : <circle cx="180" cy="65" r="31"/>}
    </g>}
  </g>;
}

/** Forehead-only caps, bangs and hair accessories. Nothing reaches the eyes (y=177). */
function HairFront({ style, color }: { style: string | null; color: string }) {
  if (!style) return null;
  const base = { ...stroke, fill: color };
  const curls = /waves|wavy|curly|momwaves|messy|locs/.test(style);
  const bob = /bob|bang|sleek/.test(style);
  const short = /sideswept|short|messy|dadshort|boyshort/.test(style);
  const scalp = curls
    ? 'M109 143Q93 115 112 92Q115 67 142 72Q161 49 180 67Q205 47 220 72Q249 68 254 99Q270 120 251 148Q234 137 220 144Q197 126 181 139Q159 126 141 146Q120 136 109 149Z'
    : short
      ? 'M110 146Q100 103 132 83Q178 58 218 78Q253 96 250 149Q236 136 224 136Q209 138 195 125Q172 143 146 137Q126 148 110 146Z'
      : 'M110 147Q101 95 141 76Q181 56 221 78Q261 98 250 150Q234 139 222 140Q204 130 189 134Q169 143 150 136Q126 152 110 147Z';
  return <g>
    <path d={scalp} {...base}/>
    {bob && <g fill={color} stroke={INK} strokeWidth="3">
      <path d="M110 138Q105 158 119 169Q131 164 137 151L142 139Z"/>
      <path d="M250 138Q256 158 241 169Q229 164 223 151L218 139Z"/>
    </g>}
    {curls && [118,141,166,192,217,240].map((x,i)=>
      <circle key={x} cx={x} cy={101+(i%2)*7} r={12} fill={color} stroke={INK} strokeWidth="2.6"/>)}
    {/scrunchie|bow/.test(style) && <g {...stroke} fill="#DFA6BD">
      <path d="M234 113L215 100V125Z"/><path d="M239 113L259 100V125Z"/>
      <circle cx="236" cy="113" r="5"/>
    </g>}
  </g>;
}

function Face({ face }: { face: string }) {
  const close = (x: number) => <path key={x} d={`M${x-12} 179 Q${x} 164 ${x+12} 179`} fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round"/>;
  const open = (x: number) => <g key={x}><ellipse cx={x} cy={177} rx="8" ry="11" fill={INK}/><circle cx={x-3} cy={172} r="3.5" fill="#fff"/></g>;
  const expression = face === 'laughing' || face === 'giggle' ? 'laugh'
    : face === 'surprised' || face === 'shocked' ? 'wow' : face;
  return <g>
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
    {/* Layer order matters: long hair BEHIND the head; fringe ABOVE the forehead only. */}
    <HairBack style={p.hair} color={hairColor}/>
    <rect x="168" y="227" width="24" height="44" rx="11" fill={skin} {...stroke}/>
    <path
      d={p.hair
        ? "M112 142Q113 94 180 89Q247 93 248 142L251 190Q247 242 181 250Q113 244 109 190Z"
        : "M117 141Q119 97 180 91Q241 97 243 141L246 190Q242 239 181 246Q119 240 114 190Z"}
      fill={skin} {...stroke}/>
    <ellipse cx={p.hair ? 109 : 115} cy="187" rx="10" ry="18" fill={skin} {...stroke}/>
    <ellipse cx={p.hair ? 251 : 245} cy="187" rx="10" ry="18" fill={skin} {...stroke}/>
    <Face face={face}/>
    <HairFront style={p.hair} color={hairColor}/>
    <Extra p={p}/>
  </svg>;
}

/** Compatibility for older saved SVG dolls, including NPCs.
 * Their clothes and hair remain editable through the original DollEditor,
 * while the entire character now uses the same live vector body renderer.
 */
export function dollToTownLook(d: DollLook): PaperLook {
  const names: Record<string,string> = {
    long: 'long', wavy:'wavy', wavyboy:'messy', ponytail:'ponytail',
    topbun:'lowbun', lowbun:'lowbun', buns:'spacebuns', bangs:'bobbangs',
    sidepart:'sideswept', messy:'messy', spiky:'boyshort', swoop:'sideswept',
    braids:'braids', pigtails:'braids', curly:'messy', bunnybob:'bob'
  };
  const hc = ['black','darkbrown','brown','blonde','ginger','pink'];
  const hairColor = hc.includes(d.hairColor) ? d.hairColor : 'brown';
  return {
    base: d.adult ? 'adult':'kid',
    tone: d.tone,
    hair: d.hair ? names[d.hair] ?? d.hair : null,
    hairColor,
    top: d.top,
    bottom: d.bottom,
    shoes: d.shoes,
    acc: {},
  };
}
