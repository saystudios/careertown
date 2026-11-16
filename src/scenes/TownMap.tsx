import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { BUILDINGS, type BuildingDef } from '../data/buildings';
import { useGame } from '../engine/store';
import nightArt from '../assets/town/night-map.webp';
import dayArt from '../assets/town/day-map.webp';
import { Person, PetPic } from '../components/Person';
import { sfx } from '../engine/sfx';
import type { BuildingId } from '../engine/types';
import { TOWNFOLK } from '../data/townfolk';
import { PhaseButton } from '../components/TownLife';
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
/**
 * The town is two painted pictures with the same layout (1672 × 941): the day map (morning, day, sunset)
 * and the night map. Each place's tap area there, [x, y, w, h],
 * covers the building and its painted name sign, so no extra signs are drawn.
 */
export const NIGHT_W = 1672, NIGHT_H = 941;
export const NIGHT_SPOTS: Record<string, [number, number, number, number]> = {
  home: [150, 170, 215, 180],
  school: [470, 120, 270, 230],
  hospital: [770, 140, 300, 215],
  courthouse: [1090, 180, 220, 180],
  bank: [1345, 185, 200, 185],
  engineering: [100, 370, 265, 190],
  park: [410, 360, 340, 195],
  'tech-lab': [790, 360, 225, 200],
  kpop: [1045, 370, 240, 195],
  'animal-hospital': [1325, 400, 215, 165],
  beach: [0, 540, 300, 190],
  shopping: [405, 560, 330, 190],
  restaurant: [785, 580, 245, 170],
  cafe: [1105, 590, 215, 165],
  fishing: [370, 770, 230, 135],
  playground: [925, 745, 300, 150],
  'nature-trail': [1400, 690, 240, 130],
};
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
  const night = phase === 'night';
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
      <div className={`town town-full town-art calm-town town-night relative overflow-hidden select-none`} onClick={movePlayer} aria-label="Town map: tap a clear space to move your character">
        <img src={night ? nightArt : dayArt} alt={night ? 'CareerTown at night with 17 lit-up places' : 'CareerTown in the daytime with 17 places to visit'} draggable={false} className="absolute inset-0 w-full h-full pointer-events-none" style={{ objectFit: 'fill', filter: phase === 'sunset' ? 'saturate(1.15)' : 'none' }} />
        {(phase === 'sunset' || phase === 'morning') && <div className={`town-glow ${phase}`} aria-hidden />}

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
          const sp = NIGHT_SPOTS[b.id]; if (!sp) return null;   // the day and night pictures share one layout
          const [x, y, w, h] = sp;
          const [W, H] = [NIGHT_W, NIGHT_H];
          return (
            <button key={b.id} onClick={() => tap(b)} aria-label={b.playable || TOWNFOLK[b.id] ? `Enter ${b.name}` : `${b.name}, coming soon`}
              className={`building art-building absolute ${b.playable || TOWNFOLK[b.id] ? '' : 'soon'} ${bump === b.id ? 'bump' : ''}`}
              style={{ left: px(x, W), top: px(y, H), width: px(w, W), height: px(h, H) }}>
              {!b.playable && !TOWNFOLK[b.id] && <span className="absolute rounded-full border-ink bg-lilac text-white font-display font-bold rotate-6" style={{ top: '6%', right: '4%', fontSize: '1.2cqw', padding: '0 0.8cqw', borderWidth: '0.22cqw', borderStyle: 'solid' }}>Soon</span>}
            </button>
          );
        })}

      </div>
    </div>
    </>
  );
}
