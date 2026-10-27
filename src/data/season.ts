/** Seasonal look for the title screen. Add `?season=halloween|winter|none` to the address to preview one. */
export type Season = 'halloween' | 'winter' | 'none';

export function season(d = new Date()): Season {
  try {
    const q = new URLSearchParams(window.location.search).get('season');
    if (q === 'halloween' || q === 'winter' || q === 'none') return q;
  } catch { /* no address bar (tests) */ }
  const m = d.getMonth(), day = d.getDate();
  if (m === 9 || (m === 10 && day <= 2)) return 'halloween'; // October through Nov 2
  if (m === 11 || (m === 0 && day <= 6)) return 'winter';    // December through Jan 6
  return 'none';
}
