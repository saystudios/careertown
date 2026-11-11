import { useEffect, useRef, useState } from 'react';
import type { CareerId } from '../engine/types';
import { useGame } from '../engine/store';
import { CAREERS } from '../data/careers';
import { MISSIONS } from '../data/missions';
import { BADGES } from '../data/catalog';
import { DAILY_STICKERS, SPECIAL_STICKERS } from '../data/stickers';
import { STYLE_PACK } from '../data/stylePack';
import { canBuy, restore, useOwned } from '../engine/iap';
import { Btn, Modal } from '../ui/kit';
import { sfx } from '../engine/sfx';

const BREAKS = [0, 20, 30, 45, 60];

/** Grown-ups corner: what your child has explored, and the settings, behind the grown-ups check. */
export function GrownUpsCorner({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const { game, dispatch } = useGame();
  const pack = useOwned(STYLE_PACK.productId);
  const [restoring, setRestoring] = useState(false);
  const careers = (Object.keys(CAREERS) as CareerId[]).map((id) => ({ id, xp: game.careerXp[id] ?? 0 })).filter((c) => c.xp > 0).sort((a, b) => b.xp - a.xp);
  const maxXp = Math.max(1, ...careers.map((c) => c.xp));
  const missionIds = Object.keys(MISSIONS);
  const done = missionIds.filter((m) => game.completedMissions[m]);
  const todo = missionIds.filter((m) => !game.completedMissions[m]);
  const stickers = (game.stickers ?? []).length;
  const toggle = (on: boolean, label: string, onTap: () => void, hint?: string) => (
    <div className="gu-row">
      <div><div className="font-display font-bold text-ink">{label}</div>{hint && <div className="font-body text-ink/70" style={{ fontSize: 13 }}>{hint}</div>}</div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => { sfx('tap'); onTap(); }} className={`gu-switch ${on ? 'on' : ''}`}><span /></button>
    </div>
  );
  return (
    <Modal title="Grown-ups corner" onClose={onClose} wide>
      <section>
        <h3 className="font-display font-bold text-ink text-lg">At a glance</h3>
        <div className="gu-stats mt-2">
          <div><b>{game.stats.days ?? 1}</b><span>days played</span></div>
          <div><b>{done.length}</b><span>of {missionIds.length} missions</span></div>
          <div><b>{game.badges.length}</b><span>badges</span></div>
          <div><b>{stickers}</b><span>of {DAILY_STICKERS.length + SPECIAL_STICKERS.length} stickers</span></div>
        </div>
      </section>

      <section className="mt-4">
        <h3 className="font-display font-bold text-ink text-lg">Careers your child has explored</h3>
        <p className="font-body text-ink/70" style={{ fontSize: 14 }}>Based on what they chose to play. It describes what they enjoyed, not what they should become.</p>
        {careers.length === 0 ? <p className="font-body text-ink mt-2">Nothing yet. Missions in each building count here.</p> : (
          <div className="mt-2 grid gap-1">
            {careers.map((c) => (
              <div key={c.id} className="gu-bar">
                <span className="gu-bar-name">{CAREERS[c.id].icon} {CAREERS[c.id].title}</span>
                <span className="gu-bar-track"><span style={{ width: `${(c.xp / maxXp) * 100}%`, background: CAREERS[c.id].color }} /></span>
              </div>
            ))}
          </div>
        )}
        {careers[0] && <p className="font-body text-ink mt-2">💡 {CAREERS[careers[0].id].strength} You could talk together about what a {CAREERS[careers[0].id].title.toLowerCase()} does.</p>}
      </section>

      <section className="mt-4">
        <h3 className="font-display font-bold text-ink text-lg">Missions</h3>
        {done.length > 0 && <p className="font-body text-ink mt-1"><b>Finished:</b> {done.map((m) => `${MISSIONS[m].title}${(game.completedMissions[m] ?? 0) > 1 ? ` ×${game.completedMissions[m]}` : ''}`).join(', ')}</p>}
        {todo.length > 0 && <p className="font-body text-ink/80 mt-1"><b>Still to try:</b> {todo.map((m) => MISSIONS[m].title).join(', ')}</p>}
        {game.badges.length > 0 && <p className="font-body text-ink mt-1"><b>Badges:</b> {game.badges.map((b) => BADGES[b] ? `${BADGES[b].icon} ${BADGES[b].label}` : b).join(', ')}</p>}
      </section>

      <section className="mt-4">
        <h3 className="font-display font-bold text-ink text-lg">Settings</h3>
        {toggle(game.settings.sound, 'Sound effects', () => dispatch({ type: 'TOGGLE_SOUND' }))}
        {toggle(game.settings.music !== false, 'Background music', () => dispatch({ type: 'TOGGLE_MUSIC' }))}
        {game.pets.length > 0 && toggle(game.settings.petFollow !== false, 'Pet follows into rooms', () => dispatch({ type: 'TOGGLE_PET_FOLLOW' }))}
        <div className="gu-row">
          <div><div className="font-display font-bold text-ink">Break reminder</div><div className="font-body text-ink/70" style={{ fontSize: 13 }}>A friendly “time for a break” message after this much play.</div></div>
          <div className="flex flex-wrap gap-1">
            {BREAKS.map((m) => (
              <button key={m} onClick={() => { sfx('tap'); dispatch({ type: 'SET_BREAK', mins: m }); }}
                className={`gu-chip ${(game.settings.breakMins ?? 0) === m ? 'on' : ''}`}>{m ? `${m} min` : 'Off'}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <h3 className="font-display font-bold text-ink text-lg">Purchases & privacy</h3>
        <p className="font-body text-ink mt-1">Style Pack: <b>{pack ? 'owned' : 'not bought'}</b>. {canBuy() ? 'Buying always asks this grown-ups question first.' : 'Purchases are only in the iPhone and iPad app.'}</p>
        {canBuy() && <Btn tone="white" className="mt-2" disabled={restoring} onClick={async () => { setRestoring(true); const r = await restore(); setRestoring(false); dispatch({ type: 'TOAST', text: r.owned?.length ? 'Purchases restored!' : r.error ?? 'Nothing to restore on this Apple ID.' }); }}>{restoring ? '…' : 'Restore purchases'}</Btn>}
        <p className="font-body text-ink/80 mt-2" style={{ fontSize: 14 }}>CareerTown keeps progress only on this device. There are no accounts, chats, ads or tracking. There is no player-to-player connectivity. Photos are saved only when your child taps “Take photo”.</p>
      </section>

      <section className="mt-4 rounded-2xl border-[3px] border-dashed border-ink/50 p-3">
        <h3 className="font-display font-bold text-ink">Start over</h3>
        <p className="font-body text-ink/80" style={{ fontSize: 14 }}>Clears coins, badges, characters and rooms on this device. Purchases are kept.</p>
        <Btn tone="white" className="mt-2" onClick={onReset}>Start over…</Btn>
      </section>
    </Modal>
  );
}

/** Shows a gentle break reminder after the chosen number of minutes of play (counted while the app is open). */
export function BreakReminder() {
  const { game } = useGame();
  const mins = game.settings.breakMins ?? 0;
  const [show, setShow] = useState(false);
  const played = useRef(0);
  useEffect(() => {
    played.current = 0;
    if (!mins) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      played.current += 1;
      if (played.current >= mins * 60) { played.current = 0; setShow(true); sfx('ring'); }
    }, 1000);
    return () => window.clearInterval(id);
  }, [mins]);
  if (!show) return null;
  return (
    <Modal title="Time for a break! 🌤️">
      <p className="font-body text-ink text-lg">You’ve been playing for {mins} minutes. Great job! Stretch, drink some water and rest your eyes.</p>
      <p className="font-body text-ink/80 mt-2">Your town will be right here when you come back.</p>
      <div className="mt-4"><Btn tone="mint" onClick={() => setShow(false)}>OK!</Btn></div>
    </Modal>
  );
}
