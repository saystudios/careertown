import { useState, type ReactNode } from 'react';
import { useGame } from '../engine/store';
import { todayKey } from '../data/daily';
import { season, type Season } from '../data/season';
import { SPRITES } from '../data/sprites';
import { LOGO_ASCENT, LOGO_GLYPHS } from '../data/logoGlyphs';
import { STYLE_PACK, STYLE_PACK_FRIENDS } from '../data/stylePack';
import { canBuy, useOwned } from '../engine/iap';
import { Person } from '../components/Person';
import { Btn, Modal, FullscreenButton } from '../ui/kit';
import { sfx } from '../engine/sfx';
import type { CharacterData } from '../engine/types';
import planetArt from '../assets/town/town-planet.webp';

/**
 * The screen kids see every time CareerTown opens: the whole town as a little spinning planet,
 * a big Play button, a daily free gift, the shop and a seasonal logo.
 */
export function TitleScreen({ onPlay, onShop, onCreator }: { onPlay: () => void; onShop: () => void; onCreator: () => void }) {
  const { game, dispatch } = useGame();
  const [settings, setSettings] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const s = season();
  const giftReady = game.lastPlayed !== todayKey();

  const active = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const buddy = game.characters.find((c) => c.id !== active?.id);

  const play = () => {
    if (leaving) return;
    sfx('success');
    setLeaving(true);
    window.setTimeout(onPlay, 380);
  };
  const gift = () => { sfx('sparkle'); dispatch({ type: 'NEW_DAY', date: todayKey() }); };

  return (
    <div className={`title-screen ts-${s} ${leaving ? 'ts-leave' : ''}`} role="dialog" aria-label="CareerTown">
      <div className="ts-aurora" aria-hidden><i /><i /><i /></div>
      <Sparkles />
      {s === 'halloween' && <Bats />}
      {s === 'winter' && <Snow />}

      <ShopTeaser onShop={onShop} />

      <div className="ts-corner">
        <RoundIcon label="Characters" onClick={() => { sfx('tap'); onCreator(); }} tone="#FFFFFF"><PeopleIcon /></RoundIcon>
        <RoundIcon label="Settings" onClick={() => { sfx('tap'); setSettings(true); }} tone="#FFFFFF"><GearIcon /></RoundIcon>
      </div>

      <div className="ts-stage">
        <div className="ts-glow" aria-hidden />
        <button className="ts-planet" onClick={play} aria-label="Play">
          <img src={planetArt} alt="" draggable={false} />
        </button>
        <Clouds />
        {active && <Kid c={active} side="left" />}
        {buddy && <Kid c={buddy} side="right" delay={0.25} />}

        <h1 className="ts-logo"><Logo s={s} /></h1>

        <div className="ts-buttons">
          <button className="ts-round ts-shop" onClick={() => { sfx('pop'); onShop(); }} aria-label="Shop">
            <CartIcon />
            <span className="ts-badge" aria-hidden><SparkleIcon /></span>
          </button>
          <button className="ts-round ts-play" onClick={play} aria-label="Play"><PlayIcon /></button>
          {giftReady
            ? <button className="ts-gift" onClick={gift}><span className="ts-gift-icon"><GiftIcon /></span>Free gift</button>
            : <span className="ts-gift-spacer" aria-hidden />}
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

/* ── Logo ─────────────────────────────────────────────── */

const LETTER_COLORS = ['#5FE0B7', '#7FD3F7', '#FFC93C', '#FF8A3D', '#FF5D8F', '#A98BFF'];
const GAP = 30, PAD = 170, TOP = 70;

function Logo({ s }: { s: Season }) {
  let x = 0;
  const items = [...'CareerTown'].map((ch, i) => {
    const g = LOGO_GLYPHS[ch];
    const it = { ch, i, x, g, swap: s !== 'none' && ch === 'o' };
    x += g.w + GAP;
    return it;
  });
  const W = x - GAP;
  const letter = (it: (typeof items)[number], layer: 'shadow' | 'white' | 'ink' | 'fill') => {
    const tilt = ((it.i % 3) - 1) * 3;
    const t = `translate(${it.x} ${layer === 'shadow' ? 70 : 0}) rotate(${tilt} ${it.g.w / 2} 900)`;
    if (it.swap) {
      const box = { x: it.x - 150, y: 110, w: it.g.w + 300, h: LOGO_ASCENT - 20 };
      if (layer === 'fill') return <g key={it.i} className="ts-swap"><svg x={box.x} y={box.y} width={box.w} height={box.h} viewBox="0 0 100 100" overflow="visible">{s === 'halloween' ? <PumpkinArt /> : <SnowballArt />}</svg></g>;
      if (layer === 'ink') return null;
      return <circle key={it.i} cx={box.x + box.w / 2} cy={box.y + box.h * 0.56 + (layer === 'shadow' ? 70 : 0)} r={box.w * 0.42} fill={layer === 'white' ? '#fff' : '#2B2350'} />;
    }
    if (layer === 'fill') return <path key={it.i} d={it.g.d} transform={t} fill={LETTER_COLORS[it.i % LETTER_COLORS.length]} />;
    const stroke = layer === 'ink' ? '#2B2350' : layer === 'white' ? '#fff' : '#2B2350';
    return <path key={it.i} d={it.g.d} transform={t} fill={stroke} stroke={stroke} strokeWidth={layer === 'ink' ? 110 : 250} strokeLinejoin="round" />;
  };
  return (
    <svg viewBox={`${-PAD} ${-TOP} ${W + PAD * 2} ${LOGO_ASCENT + TOP + PAD}`} role="img" aria-label="CareerTown">
      {(['shadow', 'white', 'ink', 'fill'] as const).map((layer) => <g key={layer}>{items.map((it) => letter(it, layer))}</g>)}
    </svg>
  );
}

/* ── Characters standing beside the planet ───────────── */

function Kid({ c, side, delay = 0 }: { c: CharacterData; side: 'left' | 'right'; delay?: number }) {
  const sp = c.sprite ? SPRITES[c.sprite] : undefined;
  const aspect = sp ? sp.w / sp.h : c.age === 'adult' ? 0.4 : 0.46;
  return (
    <div className={`ts-kid ts-kid-${side}`} style={{ aspectRatio: `${aspect}`, animationDelay: `${delay}s` }} aria-hidden>
      <Person c={c} mood="happy" />
    </div>
  );
}

/* ── Shop teaser in the corner ───────────────────────── */

function ShopTeaser({ onShop }: { onShop: () => void }) {
  const packOwned = useOwned(STYLE_PACK.productId);
  const showFriends = canBuy() && !packOwned;
  const friends = STYLE_PACK_FRIENDS.slice(0, 2);
  return (
    <button className="ts-teaser" onClick={() => { sfx('pop'); onShop(); }} aria-label="Open the shop">
      <span className="ts-teaser-art" aria-hidden>
        {showFriends
          ? friends.map((f) => <span key={f.id} className="ts-teaser-kid"><Person c={f} mood="happy" /></span>)
          : <span className="ts-teaser-emoji">🪴🧸</span>}
      </span>
      <span className="ts-ribbon">{showFriends ? 'New friends in the shop!' : 'Spend your coins!'}</span>
      <span className="ts-teaser-tab"><CartIcon /> Shop</span>
    </button>
  );
}

/* ── Background bits ─────────────────────────────────── */

const SPARKS: [number, number, number, number][] = [
  [8, 62, 18, 0], [16, 84, 12, 0.6], [24, 30, 10, 1.2], [70, 12, 14, 0.3], [78, 74, 20, 0.9], [88, 40, 12, 1.5],
  [92, 86, 10, 0.4], [60, 90, 12, 1.1], [34, 92, 10, 0.7], [50, 6, 10, 1.8], [96, 22, 12, 1.3], [4, 40, 10, 2],
];
function Sparkles() {
  return (
    <div className="ts-sparkles" aria-hidden>
      {SPARKS.map(([x, y, size, d], i) => (
        <span key={i} style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, animationDelay: `${d}s` }}><SparkleIcon /></span>
      ))}
    </div>
  );
}

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

const LOW: [number, number, number][] = [[18, 84, 12], [36, 88, 14], [54, 88, 14], [72, 86, 13], [86, 82, 10]];
function Clouds() {
  // overlapping puffs in one colour so they read as a single fluffy cloud bank
  const puffs: [number, number, number][] = [[8, 70, 9], [20, 58, 13], [34, 52, 15], [50, 46, 17], [66, 52, 15], [80, 58, 13], [92, 70, 9]];
  return (
    <div className="ts-clouds" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <g fill="#E4D8FF">{[...puffs, ...LOW].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y + 6} rx={r} ry={r * 2.2} />)}</g>
        <g fill="#FFFFFF">{[...puffs, ...LOW].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 2.2} />)}</g>
      </svg>
    </div>
  );
}

function RoundIcon({ label, onClick, tone, children }: { label: string; onClick: () => void; tone: string; children: ReactNode }) {
  return <button className="ts-corner-btn" style={{ background: tone }} onClick={onClick} aria-label={label}>{children}</button>;
}

/* ── Icons (all original, drawn here) ────────────────── */

const INK = '#2B2350';

function PlayIcon() {
  return <svg viewBox="0 0 40 40" aria-hidden><path d="M14 9.5c0-1.6 1.7-2.6 3.1-1.8l14.3 8.7c1.3.8 1.3 2.7 0 3.5L17.1 28.6c-1.4.8-3.1-.2-3.1-1.8z" fill="#fff" transform="translate(-1 2)" /></svg>;
}
function CartIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      <path d="M5 9h5l4 16h17l4-12H12" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="32" r="3" fill="#fff" /><circle cx="29" cy="32" r="3" fill="#fff" />
      <circle cx="19" cy="17" r="1.6" fill="#fff" /><circle cx="27" cy="17" r="1.6" fill="#fff" />
      <path d="M20 20.5q3 2.4 6 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      <rect x="7" y="16" width="26" height="18" rx="3" fill="#fff" />
      <rect x="5" y="11" width="30" height="7" rx="2.5" fill="#fff" />
      <rect x="18" y="11" width="4" height="23" fill="#FF8A3D" />
      <path d="M20 11c-3-6-10-6-9-1.5 1 3 6 2 9 1.5zM20 11c3-6 10-6 9-1.5-1 3-6 2-9 1.5z" fill="#fff" />
    </svg>
  );
}
function SparkleIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden><path d="M10 0c.9 5.4 4.6 9.1 10 10-5.4.9-9.1 4.6-10 10-.9-5.4-4.6-9.1-10-10 5.4-.9 9.1-4.6 10-10z" fill="currentColor" /></svg>;
}
function PeopleIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      <circle cx="25" cy="12" r="5.5" fill={INK} /><path d="M16 34c0-8 3.5-13 9-13s9 5 9 13z" fill={INK} />
      <circle cx="12.5" cy="18" r="4.2" fill={INK} /><path d="M5 34c0-6.5 3-10.5 7.5-10.5S20 27.5 20 34z" fill={INK} />
    </svg>
  );
}
function GearIcon() {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg viewBox="0 0 40 40" aria-hidden>
      {teeth.map((a) => <rect key={a} x="17" y="3.5" width="6" height="9" rx="2" fill={INK} transform={`rotate(${a} 20 20)`} />)}
      <circle cx="20" cy="20" r="11.5" fill={INK} /><circle cx="20" cy="20" r="4.6" fill="#fff" />
    </svg>
  );
}
function PumpkinArt() {
  return (
    <>
      <path d="M50 22c-3-9 1-15 8-17" fill="none" stroke="#3E7D3A" strokeWidth="7" strokeLinecap="round" />
      <path d="M57 14c8-4 15 0 17 6" fill="none" stroke="#5FB894" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="32" cy="58" rx="24" ry="33" fill="#FF8A3D" stroke={INK} strokeWidth="6" />
      <ellipse cx="68" cy="58" rx="24" ry="33" fill="#FF8A3D" stroke={INK} strokeWidth="6" />
      <ellipse cx="50" cy="58" rx="22" ry="35" fill="#FF9F55" stroke={INK} strokeWidth="6" />
      <path d="M28 50l9-9 9 9zM54 50l9-9 9 9z" fill="#FFC93C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 64q20 18 40 0q-6 12-20 13q-14-1-20-13z" fill="#FFC93C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="38" cy="36" rx="7" ry="4" fill="#fff" opacity=".35" transform="rotate(-25 38 36)" />
    </>
  );
}
function SnowballArt() {
  return (
    <>
      <circle cx="50" cy="56" r="38" fill="#fff" stroke={INK} strokeWidth="6" />
      <path d="M50 30v52M27.5 43l45 26M27.5 69l45-26" stroke="#7FD3F7" strokeWidth="5" strokeLinecap="round" />
      <path d="M44 33l6 5 6-5M44 79l6-5 6 5" fill="none" stroke="#7FD3F7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
