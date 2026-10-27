import { useState } from 'react';
import { useGame } from '../engine/store';
import { todayKey } from '../data/daily';
import { season, type Season } from '../data/season';
import { SPRITES } from '../data/sprites';
import { LOGO_ASCENT, LOGO_GLYPHS } from '../data/logoGlyphs';
import { useDayPhase } from '../engine/dayPhase';
import { Person, PetPic } from '../components/Person';
import { Btn, Modal, FullscreenButton } from '../ui/kit';
import { sfx } from '../engine/sfx';
import type { CharacterData } from '../engine/types';
import townArt from '../assets/town/town-map.webp';
import balloonArt from '../assets/town/balloon.webp';

/**
 * The screen kids see every time CareerTown opens: their own painted town behind a big
 * "Welcome to CareerTown" street sign, the family waiting on the sidewalk, and a mailbox
 * that holds a gift once a day. Buttons use the game's own chunky style.
 */
export function TitleScreen({ onPlay, onShop, onCreator }: { onPlay: () => void; onShop: () => void; onCreator: () => void }) {
  const { game, dispatch } = useGame();
  const [settings, setSettings] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const s = season();
  const phase = useDayPhase();
  const mail = game.lastPlayed !== todayKey();

  const active = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const buddy = game.characters.find((c) => c.id !== active?.id);
  const pet = game.pets[0];

  const play = () => {
    if (leaving) return;
    sfx('success');
    setLeaving(true);
    window.setTimeout(onPlay, 420);
  };
  const openMail = () => {
    if (!mail) { sfx('pop'); dispatch({ type: 'TOAST', text: 'No mail yet. Come back tomorrow!' }); return; }
    sfx('sparkle');
    dispatch({ type: 'NEW_DAY', date: todayKey() });
  };

  return (
    <div className={`title-screen ts-${s} ts-${phase} ${leaving ? 'ts-leave' : ''}`} role="dialog" aria-label="CareerTown">
      {/* the real town, drifting slowly like the camera is flying over it */}
      <div className="ts-town" style={{ backgroundImage: `url(${townArt})` }} aria-hidden />
      <div className="ts-tint" aria-hidden />
      <img className="ts-balloon" src={balloonArt} alt="" draggable={false} aria-hidden />
      {s === 'halloween' && <Bats />}
      {s === 'winter' && <Snow />}

      <div className="ts-top">
        <Btn tone="sky" onClick={onCreator} aria-label="Characters" className="ts-top-btn">🧑‍🎨<span className="ts-top-label">Characters</span></Btn>
        <Btn tone="white" onClick={() => setSettings(true)} aria-label="Settings" className="ts-top-btn">⚙️</Btn>
      </div>

      <div className="ts-sign-wrap">
        <WelcomeSign s={s} />
      </div>

      <div className="ts-street">
        <div className="ts-sidewalk" aria-hidden />
        {active && <Kid c={active} className="ts-kid-a" />}
        {pet && <div className="ts-pet" aria-hidden><PetPic p={pet} /></div>}
        {buddy && <Kid c={buddy} className="ts-kid-b" delay={0.3} />}

        <div className="ts-actions">
          <Btn tone="lilac" onClick={onShop} className="ts-shop">🛍️<span>Shop</span></Btn>
          <Btn tone="berry" onClick={play} className="ts-go">Let’s go!</Btn>
          <button className={`ts-mailbox ${mail ? 'has-mail' : ''}`} onClick={openMail} aria-label={mail ? 'Mailbox: you have a gift!' : 'Mailbox: empty'}>
            <Mailbox full={mail} />
            {mail && <span className="ts-mail-note">You’ve got mail!</span>}
          </button>
        </div>
      </div>

      {settings && (
        <Modal title="Settings" onClose={() => setSettings(false)}>
          <div className="grid grid-cols-2 gap-3">
            <Btn tone={game.settings.sound ? 'mint' : 'white'} onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} aria-pressed={game.settings.sound}>
              {game.settings.sound ? '🔊 Sound on' : '🔇 Sound off'}
            </Btn>
            <Btn tone={game.settings.music !== false ? 'mint' : 'white'} onClick={() => dispatch({ type: 'TOGGLE_MUSIC' })} aria-pressed={game.settings.music !== false}>
              {game.settings.music !== false ? '🎵 Music on' : '🎵 Music off'}
            </Btn>
          </div>
          <div className="mt-3 flex items-center gap-3 font-body text-ink"><FullscreenButton /><span>Full screen</span></div>
          <p className="font-body text-ink/70 mt-3 text-sm">Grown-ups: play limits and Playdates are in the Career Passport’s Grown-ups corner.</p>
        </Modal>
      )}
    </div>
  );
}

/* ── The welcome sign ─────────────────────────────────── */

const LETTER_COLORS = ['#3D7BFF', '#FF5D8F', '#FF8A3D', '#2FBF8F', '#A98BFF'];
const GAP = 24;

/** "CareerTown" as outlines from the game font, laid out once. */
function logoLayout() {
  let x = 0;
  const items = [...'CareerTown'].map((ch, i) => { const g = LOGO_GLYPHS[ch]; const it = { i, x, g }; x += g.w + GAP; return it; });
  return { items, w: x - GAP };
}
const LOGO = logoLayout();

function WelcomeSign({ s }: { s: Season }) {
  // sign board in viewBox units; the logo is scaled to fit inside it
  const BW = 1000, BH = 430, k = 820 / LOGO.w;
  const lx = (BW - LOGO.w * k) / 2, ly = 175;
  return (
    <svg className="ts-sign" viewBox="-40 -60 1080 640" role="img" aria-label="Welcome to CareerTown">
      {/* posts */}
      <rect x="150" y="300" width="44" height="270" rx="10" fill="#B98258" stroke="#2B2350" strokeWidth="10" />
      <rect x="806" y="300" width="44" height="270" rx="10" fill="#B98258" stroke="#2B2350" strokeWidth="10" />
      {/* board: a painted street sign like the ones in town */}
      <rect x="6" y="14" width={BW - 12} height={BH} rx="70" fill="#2B2350" transform="translate(0 16)" />
      <rect x="6" y="14" width={BW - 12} height={BH} rx="70" fill="#FFF6E2" stroke="#2B2350" strokeWidth="12" />
      <rect x="34" y="42" width={BW - 68} height={BH - 56} rx="50" fill="none" stroke="#FFC93C" strokeWidth="8" strokeDasharray="2 22" strokeLinecap="round" />
      {/* "Welcome to" banner */}
      <path d="M300 -18h400l-26 46 26 46H300l26-46z" fill="#5FE0B7" stroke="#2B2350" strokeWidth="10" strokeLinejoin="round" />
      <text x="500" y="45" textAnchor="middle" fontFamily="Grandstander, ui-rounded, system-ui, sans-serif" fontWeight="800" fontSize="54" fill="#2B2350">Welcome to</text>
      {/* the name, in the game font, outlined */}
      <g transform={`translate(${lx} ${ly}) scale(${k})`}>
        {(['ink', 'fill'] as const).map((layer) => (
          <g key={layer}>
            {LOGO.items.map((it) => {
              const t = `translate(${it.x} ${layer === 'ink' ? 40 : 0}) rotate(${((it.i % 3) - 1) * 2.5} ${it.g.w / 2} 900)`;
              return layer === 'ink'
                ? <path key={it.i} d={it.g.d} transform={t} fill="#2B2350" stroke="#2B2350" strokeWidth={90} strokeLinejoin="round" />
                : <path key={it.i} d={it.g.d} transform={t} fill={LETTER_COLORS[it.i % LETTER_COLORS.length]} />;
            })}
          </g>
        ))}
      </g>
      <text x="500" y={ly + LOGO_ASCENT * k + 72} textAnchor="middle" fontFamily="Lexend, ui-rounded, system-ui, sans-serif" fontWeight="600" fontSize="40" fill="#2B2350" opacity=".8">Try a job · Make a home · Explore</text>
      {/* season trimmings */}
      {s === 'halloween' && <>
        <Bunting colors={['#FF8A3D', '#6B3FA0', '#2B2350']} />
        <svg x="70" y="470" width="130" height="130" viewBox="0 0 100 100"><PumpkinArt /></svg>
        <svg x="820" y="490" width="110" height="110" viewBox="0 0 100 100"><PumpkinArt /></svg>
      </>}
      {s === 'winter' && <>
        <path d="M40 30Q60 -6 140 0H860Q940 -6 960 30Q930 40 900 34Q860 52 820 36Q760 50 700 34Q640 52 580 36Q520 50 460 34Q400 52 340 36Q280 50 220 34Q160 52 100 36Q70 44 40 30Z" fill="#fff" stroke="#2B2350" strokeWidth="8" strokeLinejoin="round" />
        <svg x="60" y="480" width="120" height="120" viewBox="0 0 100 100"><SnowballArt /></svg>
      </>}
      {s === 'none' && <>
        <Flowers x={90} /><Flowers x={830} />
      </>}
    </svg>
  );
}

function Bunting({ colors }: { colors: string[] }) {
  const flags = Array.from({ length: 9 }, (_, i) => 120 + i * 95);
  return (
    <g>
      <path d="M70 62Q500 112 930 62" fill="none" stroke="#2B2350" strokeWidth="6" />
      {flags.map((x, i) => {
        if (x > 290 && x < 710) return null; // leave room for the "Welcome to" banner
        const y = 62 + 25 * (1 - ((x - 500) / 430) ** 2);
        return <path key={x} d={`M${x - 22} ${y - 3}L${x + 22} ${y - 3}L${x} ${y + 36}Z`} fill={colors[i % colors.length]} stroke="#2B2350" strokeWidth="5" strokeLinejoin="round" />;
      })}
    </g>
  );
}

function Flowers({ x }: { x: number }) {
  const blooms: [number, string][] = [[18, '#FF5D8F'], [50, '#FFC93C'], [82, '#A98BFF']];
  return (
    <g transform={`translate(${x} 520)`}>
      <path d="M0 40h100l-12 50H12z" fill="#FF8A3D" stroke="#2B2350" strokeWidth="8" strokeLinejoin="round" />
      {blooms.map(([cx, c]) => (
        <g key={cx}>
          <path d={`M${cx} 40V12`} stroke="#3E9D5A" strokeWidth="6" />
          <circle cx={cx} cy="10" r="14" fill={c} stroke="#2B2350" strokeWidth="5" />
          <circle cx={cx} cy="10" r="5" fill="#FFF6E2" />
        </g>
      ))}
    </g>
  );
}

/* ── Mailbox (the daily gift) ─────────────────────────── */

function Mailbox({ full }: { full: boolean }) {
  return (
    <svg viewBox="0 0 120 130" aria-hidden className="ts-mailbox-art">
      <rect x="52" y="70" width="16" height="58" rx="4" fill="#B98258" stroke="#2B2350" strokeWidth="5" />
      <path d="M14 76V44a32 32 0 0 1 64 0v32z" fill="#3D7BFF" />
      <path d="M22 70V46a24 24 0 0 1 24-24" fill="none" stroke="#7FB0FF" strokeWidth="6" strokeLinecap="round" />
      <path d="M14 76V44a32 32 0 0 1 64 0v32z" fill="none" stroke="#2B2350" strokeWidth="6" strokeLinejoin="round" />
      <rect x="26" y="50" width="26" height="22" rx="5" fill="#2B2350" />
      {full && (
        <g className="ts-letter-peek" transform="rotate(-14 39 50)">
          <rect x="24" y="38" width="34" height="22" rx="3" fill="#fff" stroke="#2B2350" strokeWidth="4" />
          <path d="M32 44l9 6 9-8" fill="none" stroke="#FF5D8F" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
      {/* flag: up when there's mail */}
      <g transform={full ? 'rotate(0 84 62)' : 'rotate(90 84 62)'}>
        <rect x="80" y="22" width="8" height="42" rx="3" fill="#2B2350" />
        <path d="M84 22h26v18H84z" fill="#FF5D5D" stroke="#2B2350" strokeWidth="5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ── Family on the sidewalk ───────────────────────────── */

function Kid({ c, className, delay = 0 }: { c: CharacterData; className: string; delay?: number }) {
  const sp = c.sprite ? SPRITES[c.sprite] : undefined;
  const aspect = sp ? sp.w / sp.h : c.age === 'adult' ? 0.4 : 0.46;
  return (
    <div className={`ts-kid ${className}`} style={{ aspectRatio: `${aspect}`, animationDelay: `${delay}s` }} aria-hidden>
      <Person c={c} mood="happy" />
    </div>
  );
}

/* ── Season extras ────────────────────────────────────── */

function Bats() {
  return (
    <div className="ts-bats" aria-hidden>
      {[0, 1, 2].map((i) => <span key={i} className={`ts-bat ts-bat-${i}`}><BatIcon /></span>)}
    </div>
  );
}

function Snow() {
  return (
    <div className="ts-snow" aria-hidden>
      {Array.from({ length: 26 }, (_, i) => (
        <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * 0.9}s`, animationDuration: `${7 + (i % 5)}s`, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3 }} />
      ))}
    </div>
  );
}

/* ── Art (all original, drawn here) ───────────────────── */

const INK = '#2B2350';

function PumpkinArt() {
  return (
    <>
      <path d="M50 22c-3-9 1-15 8-17" fill="none" stroke="#3E7D3A" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="32" cy="58" rx="24" ry="33" fill="#FF8A3D" stroke={INK} strokeWidth="6" />
      <ellipse cx="68" cy="58" rx="24" ry="33" fill="#FF8A3D" stroke={INK} strokeWidth="6" />
      <ellipse cx="50" cy="58" rx="22" ry="35" fill="#FF9F55" stroke={INK} strokeWidth="6" />
      <circle cx="40" cy="52" r="4.5" fill={INK} /><circle cx="60" cy="52" r="4.5" fill={INK} />
      <path d="M40 66q10 8 20 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="62" r="4" fill="#FF5D8F" opacity=".5" /><circle cx="68" cy="62" r="4" fill="#FF5D8F" opacity=".5" />
    </>
  );
}
function SnowballArt() {
  return (
    <>
      <circle cx="50" cy="56" r="38" fill="#fff" stroke={INK} strokeWidth="6" />
      <path d="M50 30v52M27.5 43l45 26M27.5 69l45-26" stroke="#7FD3F7" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="36" cy="38" rx="8" ry="4.5" fill="#BDEBFF" transform="rotate(-30 36 38)" />
    </>
  );
}
function BatIcon() {
  return (
    <svg viewBox="0 0 60 30" aria-hidden>
      <path d="M30 10c-3 0-5 2-5 5 0 4 3 7 5 7s5-3 5-7c0-3-2-5-5-5zM25 14C19 6 9 5 2 9c5 1 6 5 5 8 3-2 7-1 8 2 2-3 6-3 10-1zM35 14c6-8 16-9 23-5-5 1-6 5-5 8-3-2-7-1-8 2-2-3-6-3-10-1z" fill="#3B2160" />
      <path d="M27 9l1-4 2 4zM33 9l-1-4-2 4z" fill="#3B2160" />
      <circle cx="28.2" cy="15" r="1.2" fill="#FFC93C" /><circle cx="31.8" cy="15" r="1.2" fill="#FFC93C" />
    </svg>
  );
}
