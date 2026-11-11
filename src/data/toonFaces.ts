/**
 * CareerTown's original, consistent dollhouse faces.
 * The same facial language is shared by vector dolls, family members and
 * NPCs wearing layered paper artwork. Nothing here stores a character look:
 * existing hairstyles, outfits, body templates, and saved choices are retained.
 *
 * Coordinates are relative to a 384-wide doll face with eyes at (138,236)
 * and (246,236). For the painted body rig, translate/scale to the eye anchors.
 */
export function toonFaceSvg(expression: string, lashes = false): string {
  const ink = '#34283B';
  const blush = '#EFA19F';
  const pink = '#E982A4';
  const mouthInk = '#673947';
  const s = expression === 'laughing' || expression === 'giggle' ? 'laugh'
    : expression === 'surprised' || expression === 'shocked' ? 'wow'
    : expression === 'crying' ? 'cry'
    : expression === 'grumpy' || expression === 'angry' ? 'angry'
    : expression === 'sleepy' ? 'sleep'
    : expression === 'starry' || expression === 'love' ? 'happy'
    : expression === 'nervous' || expression === 'puppy_eyes' ? 'sad'
    : expression === 'wink' ? 'wink'
    : expression === 'silly' ? 'silly'
    : expression === 'sad' ? 'sad' : 'happy';

  const path = (d: string, w = 4) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const openEye = (cx: number, focus = false) => (
    `<ellipse cx="${cx}" cy="239" rx="${focus ? 14 : 12}" ry="${focus ? 20 : 18}" fill="${ink}"/>` +
    `<ellipse cx="${cx-4}" cy="229" rx="3.6" ry="4.6" fill="#FFFDF9"/>` +
    (lashes ? path(`M${cx-13} 229l-7 -5`, 3.5) : '')
  );
  const smileEye = (cx: number) => path(`M${cx-14} 241 Q${cx} 224 ${cx+14} 241`, 5);
  const closedEye = (cx: number) => path(`M${cx-14} 238 Q${cx} 249 ${cx+14} 238`, 5);
  const eyes = (
    s === 'laugh' || s === 'sleep' ? smileEye(138) + smileEye(246) :
    s === 'wink' || s === 'silly' ? openEye(138) + smileEye(246) :
    s === 'cry' ? closedEye(138) + closedEye(246) :
    openEye(138, s === 'wow' || s === 'sad') + openEye(246, s === 'wow' || s === 'sad')
  );
  const brows = s === 'angry'
    ? path('M115 206l42 12 M226 218l42 -12', 5)
    : s === 'sad' || s === 'cry'
      ? path('M115 209q21 -12 40 -2 M228 207q19 -10 40 2', 4)
      : s === 'wow'
        ? path('M117 202q21 -12 40 -1 M226 201q20 -11 40 1', 4)
        : '';
  const mouth = s === 'wow'
    ? `<ellipse cx="192" cy="291" rx="13" ry="16" fill="${mouthInk}"/><ellipse cx="191" cy="298" rx="6" ry="4" fill="${pink}"/>`
    : s === 'sad' || s === 'angry' || s === 'cry'
      ? path('M177 297 Q192 284 207 297', 5)
      : s === 'sleep'
        ? path('M182 289 Q192 294 202 289', 4)
        : s === 'laugh' || s === 'silly'
          ? `<path d="M167 281 Q192 294 217 281 Q213 314 192 314 Q171 313 167 281Z" fill="${mouthInk}" stroke="${mouthInk}" stroke-width="3"/><path d="M178 306Q192 294 206 306Q192 314 178 306Z" fill="${pink}"/>`
          : path('M171 284 Q192 307 213 284', 5);
  const freckles = [127,135,249,257].map((x,i) => `<circle cx="${x}" cy="${268+i%2*5}" r="2.6" fill="#AD6E62" opacity=".65"/>`).join('');
  const cheeks = `<ellipse cx="108" cy="273" rx="23" ry="12" fill="${blush}" opacity=".42"/><ellipse cx="276" cy="273" rx="23" ry="12" fill="${blush}" opacity=".42"/>`;
  const nose = path('M191 265q3 3 6 0', 2.8);
  const tears = s === 'cry'
    ? '<path d="M125 250q-11 19 0 34q11 -15 0 -34 M260 250q-11 19 0 34q11 -15 0 -34" fill="#9DD7E8" opacity=".9"/>'
    : '';
  return cheeks + freckles + brows + eyes + nose + mouth + tears;
}
