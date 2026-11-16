import { useDayPhase } from '../engine/dayPhase';
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useGame, playerLevel, levelProgress } from '../engine/store';
import { BADGES, TOPS, HATS, GLASSES, ACCESSORIES } from '../data/catalog';
import { ITEMS } from '../data/items';
import { CharacterArt, charViewBox } from '../components/art/Character';
import { garmentForUnlock } from '../data/dollLooks';
import { PaperFaceIcon } from '../components/Paper';
import { DOLL_GARMENTS } from '../data/doll';
import { SpriteFace, DollFace } from '../components/Person';
import type { CharacterData, Reward } from '../engine/types';
import { sfx } from '../engine/sfx';
import { dailyFor } from '../data/daily';

type Tone = 'sun' | 'berry' | 'mint' | 'sky' | 'lilac' | 'white';
const TONES: Record<Tone, string> = {
  sun: 'bg-sun text-ink', berry: 'bg-berry text-white', mint: 'bg-mint text-ink',
  sky: 'bg-sky text-ink', lilac: 'bg-lilac text-white', white: 'bg-white text-ink',
};

export function Btn({ tone = 'sun', className = '', children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      {...rest}
      onClick={(e) => { sfx('tap'); onClick?.(e); }}
      className={`chunky-btn ${TONES[tone]} font-display font-extrabold rounded-2xl border-[3px] border-ink shadow-chunkysm px-4 py-2 min-h-[48px] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({ children, onClose, title, wide = false }: { children: ReactNode; onClose?: () => void; title?: string; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-ink/50 modal-in" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[92dvh] overflow-auto rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 sm:p-6 pop-in`}>
        {title && <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink pr-12 mb-3">{title}</h2>}
        {onClose && (
          <button aria-label="Close" onClick={() => { sfx('tap'); onClose(); }} className="absolute top-3 right-3 w-11 h-11 rounded-full border-[3px] border-ink bg-berry text-white font-display text-xl shadow-chunkysm">✕</button>
        )}
        {children}
      </div>
    </div>
  );
}

export function Bubble({ text }: { text: string }) {
  return (
    <div className="bubble pointer-events-none absolute left-1/2 bottom-full mb-1 -translate-x-1/2 whitespace-nowrap rounded-2xl border-[3px] border-ink bg-white px-3 py-1 font-display font-bold text-ink text-[clamp(11px,1.6vw,18px)] shadow-chunkysm z-[60]">
      {text}
    </div>
  );
}

/** Crops a character to head-and-shoulders. */
export function HeadCrop({ look, age = 'child', size }: { look: CharacterData['look']; age?: 'child' | 'adult'; size: number }) {
  const k = size / 82;
  const vbH = charViewBox(age, 'stand', look.build ?? 'average').h;
  return (
    <div style={{ width: 120 * k, height: vbH * k, marginLeft: -21 * k, marginTop: -10 * k }}>
      <CharacterArt look={look} age={age} />
    </div>
  );
}

export function Face({ c, size = 56 }: { c: CharacterData; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-full overflow-hidden border-[3px] border-ink bg-sky/40 shrink-0">
      {c.paper ? <PaperFaceIcon p={c.paper} size={size - 6} /> : c.doll ? <DollFace d={c.doll} size={size - 6} /> : c.sprite ? <SpriteFace sprite={c.sprite} size={size - 6} /> : <HeadCrop look={c.look} age={c.age} size={size} />}
    </div>
  );
}

export function Coin({ className = '' }: { className?: string }) {
  return <span className={`inline-flex items-center justify-center rounded-full bg-sun border-[2.5px] border-ink w-6 h-6 text-[13px] font-display font-extrabold text-ink ${className}`}>C</span>;
}

const isStandalone = () =>
  (typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || window.matchMedia?.('(display-mode: fullscreen)').matches)) ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true ||
  // inside the iPhone/iPad app
  !!(window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();

/** Full screen: real Fullscreen API where it exists; on iPhone, explain Add to Home Screen. */
export function FullscreenButton() {
  const [help, setHelp] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  if (isStandalone()) return null;
  const canFs = !!document.fullscreenEnabled && !!document.documentElement.requestFullscreen;
  const toggle = () => {
    if (!canFs) { setHelp(true); return; }
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => setHelp(true));
  };
  return (
    <>
      <Btn tone="white" onClick={toggle} aria-label={on ? 'Exit full screen' : 'Full screen'} className="!px-3">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2B2350" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {on ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
        </svg>
      </Btn>
      {help && (
        <Modal title="Play full screen" onClose={() => setHelp(false)}>
          <p className="font-body text-ink text-lg">On iPhone, add CareerTown to your Home Screen. Then it opens full screen, like a real app.</p>
          <ol className="mt-3 space-y-2 font-body text-ink">
            <li className="rounded-2xl border-[3px] border-ink bg-sky/30 p-3"><b className="font-display">1.</b> Tap the <b>Share</b> button in Safari (the square with an arrow).</li>
            <li className="rounded-2xl border-[3px] border-ink bg-sky/30 p-3"><b className="font-display">2.</b> Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>
            <li className="rounded-2xl border-[3px] border-ink bg-sky/30 p-3"><b className="font-display">3.</b> Open CareerTown from its new icon on your Home Screen.</li>
          </ol>
          <p className="font-body text-ink/70 mt-3 text-sm">Your progress stays on this device.</p>
        </Modal>
      )}
    </>
  );
}

export function HUD({ onPassport, onMap, onShop, onCreator, title }: { onPassport: () => void; onMap?: () => void; onShop: () => void; onCreator: () => void; title?: string }) {
  const { game, dispatch } = useGame();
  const lvl = playerLevel(game.xp);
  const daily = dailyFor(game.daily.date);
  const [showDaily, setShowDaily] = useState(false);
  const phase = useDayPhase();
  return (
    <header className="hud relative z-40 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2">
      {onMap
        ? <Btn tone="white" onClick={onMap} aria-label="Back to town" className="!px-3">🗺️<span className="hidden sm:inline ml-1">Town</span></Btn>
        : <div className="hidden sm:block font-display font-extrabold text-2xl sm:text-3xl text-ink logo-type px-1"
            // the night town picture has its own CareerTown logo in this corner
            style={phase === 'night' ? { visibility: 'hidden' } : undefined}>CareerTown</div>}
      {title && <div className="hidden sm:block font-display font-extrabold text-lg sm:text-2xl text-ink truncate">{title}</div>}
      <div className="flex-1" />
      <button onClick={() => setShowDaily(true)} className="hidden md:flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-white px-3 py-1 shadow-chunkysm max-w-[300px]">
        <span className="text-xl">{game.daily.done ? '✅' : daily.icon}</span>
        <span className="font-body text-sm text-ink truncate">{daily.text}</span>
      </button>
      <button onClick={() => setShowDaily(true)} className="md:hidden rounded-2xl border-[3px] border-ink bg-white w-12 h-12 text-xl shadow-chunkysm" aria-label="Daily challenge">{game.daily.done ? '✅' : '📅'}</button>
      <div className="flex items-center gap-1 rounded-2xl border-[3px] border-ink bg-white pl-1 pr-3 h-12 shadow-chunkysm">
        <Coin /><span className="font-display font-extrabold text-ink text-lg tabular-nums">{game.coins}</span>
      </div>
      <button onClick={onPassport} className="flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-lilac pl-1 pr-2 h-12 shadow-chunkysm" aria-label="Career passport">
        <span className="w-9 h-9 rounded-xl bg-white border-[2.5px] border-ink grid place-items-center font-display font-extrabold text-ink">{lvl}</span>
        <span className="hidden sm:block w-16 h-3 rounded-full bg-white border-2 border-ink overflow-hidden"><span className="block h-full bg-mint" style={{ width: `${levelProgress(game.xp) * 100}%` }} /></span>
        <span className="text-xl">🛂</span>
      </button>
      <Btn tone="sky" onClick={onCreator} aria-label="Characters" className="!px-2.5 sm:!px-3">🧑‍🎨</Btn>
      <Btn tone="berry" onClick={onShop} aria-label="Shop" className="!px-2.5 sm:!px-3">🛍️</Btn>
      <Btn tone="white" onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} aria-label="Sound" className="!px-3 hidden sm:block">{game.settings.sound ? '🔊' : '🔇'}</Btn>
      <Btn tone="white" onClick={() => dispatch({ type: 'TOGGLE_MUSIC' })} aria-label="Music" aria-pressed={game.settings.music !== false} className="!px-3 hidden sm:block" style={{ opacity: game.settings.music === false ? 0.45 : 1 }}>🎵</Btn>
      <FullscreenButton />
      {showDaily && (
        <Modal title="Today’s challenge" onClose={() => setShowDaily(false)}>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{daily.icon}</div>
            <div>
              <p className="font-display text-xl text-ink">{daily.text}</p>
              <p className="font-body text-ink/70 mt-1">Reward: {daily.coins} coins</p>
            </div>
          </div>
          <div className="mt-4 h-5 rounded-full border-[3px] border-ink bg-white overflow-hidden">
            <div className="h-full bg-mint" style={{ width: `${Math.min(1, game.daily.progress / daily.target) * 100}%` }} />
          </div>
          <p className="font-body text-ink mt-2">{game.daily.done ? 'Done! Come back tomorrow for a new one.' : `${game.daily.progress} of ${daily.target}`}</p>
        </Modal>
      )}
    </header>
  );
}

function rewardLines(r: Reward) {
  const lines: { icon: ReactNode; text: string }[] = [];
  if (r.coins) lines.push({ icon: <Coin />, text: `+${r.coins} coins` });
  if (r.xp) lines.push({ icon: '⭐', text: `+${r.xp} XP` });
  if (r.career && r.careerXp) lines.push({ icon: '🛂', text: `+${r.careerXp} career points` });
  if (r.badge) lines.push({ icon: BADGES[r.badge]?.icon, text: `Badge: ${BADGES[r.badge]?.label}` });
  for (const u of r.unlocks ?? []) {
    if (u === 'pet:puppy') lines.push({ icon: '🐶', text: 'A puppy moved into your living room!' });
    else if (u === 'pet:bunny') lines.push({ icon: '🐰', text: 'A bunny moved into your living room!' });
    else if (u === 'pet:kitten') lines.push({ icon: '🐱', text: 'A kitten moved into your living room!' });
    else if (u.startsWith('pet:')) lines.push({ icon: '🎀', text: 'New pet accessory' });
    else if (garmentForUnlock(u)) lines.push({ icon: '👕', text: `New in the closet: ${DOLL_GARMENTS[garmentForUnlock(u)!]?.label}` });
    else if (u.startsWith('wear:')) { const [, slot, id] = u.split(':'); const list = { top: TOPS, hat: HATS, glasses: GLASSES, accessory: ACCESSORIES }[slot] ?? []; lines.push({ icon: slot === 'hat' ? '🎩' : '👕', text: `New in the closet: ${list.find((o) => o.id === id)?.label ?? id}` }); }
    else lines.push({ icon: '🎁', text: `New item: ${ITEMS[u]?.name ?? u}` });
  }
  return lines;
}

export function RewardPopup() {
  const { queue, dispatch } = useGame();
  const p = queue[0];
  if (!p) return null;
  return (
    <div className="reward-wrap fixed inset-0 z-[70] grid place-items-center bg-ink/55 p-4 modal-in overflow-y-auto">
      <Confetti />
      <div key={p.id} className="relative w-full max-w-sm rounded-[32px] border-[4px] border-ink bg-sun shadow-chunky p-6 text-center reward-in">
        <div className="text-6xl -mt-14 mb-1 star-spin">🌟</div>
        <h2 className="font-display text-3xl font-extrabold text-ink">{p.title}</h2>
        <ul className="mt-4 space-y-2 text-left">
          {rewardLines(p.reward).map((l, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-white border-[3px] border-ink px-3 py-2 font-body text-ink">
              <span className="text-2xl w-8 grid place-items-center">{l.icon}</span>{l.text}
            </li>
          ))}
        </ul>
        <Btn tone="berry" className="mt-5 w-full text-xl" onClick={() => { sfx('coin'); dispatch({ type: 'DISMISS_POPUP' }); }}>Yay!</Btn>
      </div>
    </div>
  );
}

function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  const colors = ['#FF5D8F', '#FFC93C', '#5FE0B7', '#7FD3F7', '#A98BFF'];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {bits.map((i) => (
        <span key={i} className="confetti" style={{ left: `${(i * 37) % 100}%`, background: colors[i % 5], animationDelay: `${(i % 7) * 0.12}s`, width: 10 + (i % 3) * 4 }} />
      ))}
    </div>
  );
}

export function Toast() {
  const { toast } = useGame();
  const [shown, setShown] = useState<typeof toast>();
  useEffect(() => {
    if (!toast) return;
    setShown(toast);
    const t = window.setTimeout(() => setShown(undefined), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);
  if (!shown) return null;
  return <div key={shown.id} className="fixed z-[80] left-1/2 top-20 -translate-x-1/2 rounded-2xl border-[3px] border-ink bg-white px-4 py-2 font-display font-bold text-ink shadow-chunkysm toast-in">{shown.text}</div>;
}
