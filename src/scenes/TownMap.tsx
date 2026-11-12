import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { BUILDINGS, type BuildingDef } from '../data/buildings';
import { useGame } from '../engine/store';
import townArt from '../assets/town/calm-map.svg';
import { Person, PetPic } from '../components/Person';
import { sfx } from '../engine/sfx';
import type { BuildingId } from '../engine/types';
import { TOWNFOLK } from '../data/townfolk';
import { DayNight, PhaseButton } from '../components/TownLife';
import { useDayPhase } from '../engine/dayPhase';

/** Where each building sits in the painted town picture (px in a 1536 × 1024 image): [x, y, w, h]. */
export const IMG_W = 1536, IMG_H = 1024;
export const SPOTS: Record<string, [number, number, number, number]> = {
  home: [50, 120, 260, 230],
  school: [395, 95, 290, 250],
  hospital: [690, 95, 330, 260],
  courthouse: [1045, 135, 215, 220],
  bank: [1300, 130, 200, 220],
  engineering: [55, 360, 290, 215],
  park: [370, 395, 310, 190],
  'tech-lab': [810, 380, 190, 220],
  kpop: [1005, 385, 245, 225],
  'animal-hospital': [1255, 380, 195, 220],
  beach: [10, 570, 290, 180],
  shopping: [390, 585, 370, 240],
  restaurant: [790, 600, 265, 230],
  cafe: [1160, 625, 250, 200],
  fishing: [440, 830, 240, 140],
  playground: [855, 832, 240, 145],
  'nature-trail': [1180, 820, 330, 180],
};
/** The town picture has every place's name painted on it, so we don't draw our own signs. */
const PAINTED_LABELS = false;
const px = (v: number, of: number) => `${(v / of) * 100}%`;

export function TownMap({ onEnter, onVisit, }: { onEnter: (id: BuildingId) => void; onVisit: (id: BuildingId) => void; }) {
  const { game, dispatch } = useGame();
  const [bump, setBump] = useState<string | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 46, y: 30 });
  const [facingLeft, setFacingLeft] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) * 0.15);
  }, []);
  const walker = game.characters.find((c) => c.id === game.activeCharacterId) ?? game.characters[0];
  const pet = game.pets[0];
  const phase = useDayPhase();
  useEffect(() => { if (phase === 'night' && !game.owned.includes('did:night')) dispatch({ type: 'OWN', id: 'did:night' }); }, [phase, game.owned, dispatch]);

  const movePlayer = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget && (event.target as Element).closest('button')) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(94, Math.max(5, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(89, Math.max(15, ((event.clientY - rect.top) / rect.height) * 100));
    setFacingLeft(x < playerPos.x);
    setPlayerPos({ x, y });
  };

  const tap = (b: BuildingDef) => {
    setBump(b.id);
    window.setTimeout(() => setBump(null), 400);
    if (!b.playable && TOWNFOLK[b.id]) { sfx('pop'); window.setTimeout(() => onVisit(b.id), 260); return; }
    if (!b.playable) { sfx('fail'); dispatch({ type: 'TOAST', text: `${b.name} is coming soon!` }); return; }
    sfx('pop');
    window.setTimeout(() => onEnter(b.id), 260);
  };

  return (
    <>
    <PhaseButton phase={phase} />
    <div ref={scroller} className="map-scroll h-full w-full overflow-auto">
      <div className="town town-full town-art calm-town relative overflow-hidden select-none" onClick={movePlayer} aria-label="Town map: tap a clear space to move your character">
        <img src={townArt} alt="Simplified CareerTown map with 17 easy-to-find locations" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none" style={{ objectFit: 'fill', filter: 'none' }} />

        {/* walker + pet on the top sidewalk */}
        {walker && (
          <div className="map-player absolute pointer-events-none" style={{
            zIndex: 12, left: `${playerPos.x}%`, top: `${playerPos.y}%`, width: '4.5%',
            height: '10.5%', transform: 'translate(-50%, -60%)', transition: 'left .8s ease-in-out, top .8s ease-in-out'
          }}>
            <div className="w-full h-full" style={{ transform: facingLeft ? 'scaleX(-1)' : undefined }}>
              <Person c={walker} mood="happy" />
            </div>
            {pet && <div className="absolute -right-[70%] bottom-0 w-[65%] h-[34%]"><PetPic p={pet} /></div>}
          </div>
        )}

        {BUILDINGS.map((b) => {
          const sp = SPOTS[b.id]; if (!sp) return null;
          const [x, y, w, h] = sp;
          return (
            <button key={b.id} onClick={() => tap(b)} aria-label={b.playable || TOWNFOLK[b.id] ? `Enter ${b.name}` : `${b.name}, coming soon`}
              className={`building art-building absolute ${b.playable || TOWNFOLK[b.id] ? '' : 'soon'} ${bump === b.id ? 'bump' : ''}`}
              style={{ left: px(x, IMG_W), top: px(y, IMG_H), width: px(w, IMG_W), height: px(h, IMG_H) }}>
              {!PAINTED_LABELS && <span className="sign absolute left-1/2 -translate-x-1/2 w-max leading-tight text-center rounded-2xl border-ink bg-white font-display font-bold text-ink shadow-chunkysm"
                style={{ bottom: '-6%', fontSize: '1.25cqw', padding: '0.23cqw 0.7cqw', borderWidth: '0.16cqw', borderStyle: 'solid', borderRadius: '1cqw', background: '#fffaf3', whiteSpace: 'nowrap' }}>
                {b.icon} {b.name}
              </span>}
              {!b.playable && !TOWNFOLK[b.id] && <span className="absolute rounded-full border-ink bg-lilac text-white font-display font-bold rotate-6" style={{ top: '6%', right: '4%', fontSize: '1.2cqw', padding: '0 0.8cqw', borderWidth: '0.22cqw', borderStyle: 'solid' }}>Soon</span>}
            </button>
          );
        })}
        <DayNight phase={phase} />
      </div>
    </div>
    </>
  );
}
