import { useEffect, useState, type ReactElement } from 'react';
import { refreshOwned, useOwned } from './engine/iap';
import { playTune, type Tune } from './engine/music';
import { useDayPhase } from './engine/dayPhase';
import { todayKey } from './data/daily';
import { SPECIAL_STICKERS } from './data/stickers';
import { BreakReminder } from './components/GrownUps';
import { STYLE_PACK, STYLE_PACK_FRIENDS } from './data/stylePack';
import type { BuildingId, Screen } from './engine/types';
import { GameProvider, useGame } from './engine/store';
import { building } from './data/buildings';
import { MISSIONS } from './data/missions';
import { HUD, RewardPopup, Toast, Btn } from './ui/kit';
import { TownMap } from './scenes/TownMap';
import { SceneScreen } from './scenes/SceneScreen';
import { BuildingScreen, Passport, Shop } from './scenes/Menus';
import { CharacterCreator } from './scenes/CharacterCreator';
import { VisitScreen } from './scenes/VisitScreen';
import { Playdate } from './scenes/Playdate';
import { LawyerMission } from './missions/LawyerMission';
import { EngineerMission } from './missions/EngineerMission';
import { DoctorMission } from './missions/DoctorMission';
import { VetMission } from './missions/VetMission';
import { RobotMission } from './missions/RobotMission';
import { ChefMission } from './missions/ChefMission';
import { KpopMission } from './missions/KpopMission';
import { BeachMission } from './missions/BeachMission';
import { BankMission } from './missions/BankMission';
import { ShopMission } from './missions/ShopMission';
import { ParkMission } from './missions/ParkMission';
import { CafeMission } from './missions/CafeMission';
import { FishingMission } from './missions/FishingMission';
import { PlaygroundMission } from './missions/PlaygroundMission';
import { TrailMission } from './missions/TrailMission';
import { UpstanderMission } from './missions/UpstanderMission';
import { TeacherMission } from './missions/TeacherMission';
import { Person } from './components/Person';
import { SPRITES } from './data/sprites';
import { sfx } from './engine/sfx';

// Mission registry: add a new career mission by adding one line here + data in data/missions.ts
const MISSION_VIEWS: Record<string, (p: { onExit: () => void }) => ReactElement> = {
  'lawyer-trophy': LawyerMission,
  'engineer-bridge': EngineerMission,
  'doctor-checkup': DoctorMission,
  'vet-checkup': VetMission,
  'software-robot': RobotMission,
  'chef-pizza': ChefMission,
  'kpop-star': KpopMission,
  'lifeguard-duty': BeachMission,
  'bank-saver': BankMission,
  'shop-owner': ShopMission,
  'park-garden': ParkMission,
  'cafe-barista': CafeMission,
  'fishing-release': FishingMission,
  'playground-coach': PlaygroundMission,
  'trail-ranger': TrailMission,
  'playground-upstander': UpstanderMission,
  'teacher-day': TeacherMission,
};

function Game() {
  const { game, dispatch } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'map' });
  const [shop, setShop] = useState(false);
  // Style Pack (bought in the iPhone/iPad app): check with Apple at launch; the friends join each save once.
  const stylePack = useOwned(STYLE_PACK.productId);
  useEffect(() => { refreshOwned(); }, []);
  // a sticker for each day you play, and special stickers when you earn them
  useEffect(() => { if (game.seenIntro) dispatch({ type: 'NEW_DAY', date: todayKey() }); }, [game.seenIntro, dispatch]);
  useEffect(() => {
    const have = game.stickers ?? [];
    const s = SPECIAL_STICKERS.find((x) => !have.includes(x.id) && x.got(game));
    if (s) dispatch({ type: 'STICKER', id: s.id });
  }, [game, dispatch]);
  // background music for each area
  const phase = useDayPhase();
  const homeScene = screen.name === 'scene' && screen.sceneId.startsWith('home-');
  const tune: Tune = screen.name === 'map' ? (phase === 'night' ? 'night' : 'town')
    : homeScene ? (phase === 'night' ? 'night' : 'home')
    : screen.name === 'creator' || screen.name === 'passport' ? 'home' : 'work';
  useEffect(() => { playTune(tune); }, [tune]);
  useEffect(() => { if (stylePack) dispatch({ type: 'ADD_CHARACTERS', characters: STYLE_PACK_FRIENDS, mark: 'pack:style-friends' }); }, [stylePack, dispatch]);

  const enter = (id: BuildingId) => {
    const b = building(id);
    if (b.missions.length === 0) setScreen({ name: 'scene', sceneId: b.rooms[0].sceneId });
    else setScreen({ name: 'building', id });
  };

  const title =
    screen.name === 'building' ? building(screen.id).name :
    screen.name === 'visit' ? building(screen.id).name :
    screen.name === 'playdate' ? 'Playdate' :
    screen.name === 'scene' ? undefined :
    screen.name === 'creator' ? 'Characters' :
    screen.name === 'passport' ? 'Passport' : undefined;

  let body: ReactElement;
  switch (screen.name) {
    case 'map': body = <TownMap onEnter={enter} onVisit={(id) => setScreen({ name: 'visit', id })} onPlaydate={() => setScreen({ name: 'playdate' })} />; break;
    case 'playdate': body = <Playdate onBack={() => setScreen({ name: 'map' })} />; break;
    case 'visit': body = <VisitScreen key={screen.id} id={screen.id} onBack={() => setScreen({ name: 'map' })} onMission={(m) => setScreen({ name: 'mission', id: m })} onPlay={(sceneId) => setScreen({ name: 'scene', sceneId })} />; break;
    case 'building': body = <BuildingScreen id={screen.id} onScene={(sceneId) => setScreen({ name: 'scene', sceneId })} onMission={(id) => setScreen({ name: 'mission', id })} />; break;
    case 'scene': body = <SceneScreen key={screen.sceneId} sceneId={screen.sceneId} onScene={(sceneId) => setScreen({ name: 'scene', sceneId })} onMission={(id) => setScreen({ name: 'mission', id })} />; break;
    case 'mission': {
      const View = MISSION_VIEWS[screen.id];
      const bid = MISSIONS[screen.id].building;
      const back = () => setScreen(building(bid).playable ? { name: 'building', id: bid } : { name: 'visit', id: bid });
      body = <View key={screen.id} onExit={back} />; break;
    }
    case 'creator': body = <CharacterCreator editId={screen.editId} onDone={() => setScreen({ name: 'map' })} />; break;
    case 'passport': body = <Passport />; break;
    default: body = <TownMap onEnter={enter} onVisit={(id) => setScreen({ name: 'visit', id })} />;
  }

  return (
    <div className="app relative h-[100dvh] flex flex-col overflow-hidden">
      {screen.name !== 'mission' && (
        <div className={screen.name === 'map' || screen.name === 'scene' ? 'hud-float absolute inset-x-0 top-0 z-40 pointer-events-none [&>*]:pointer-events-auto' : ''}>
        <HUD
          title={title}
          onMap={screen.name === 'map' ? undefined : () => setScreen({ name: 'map' })}
          onPassport={() => setScreen({ name: 'passport' })}
          onShop={() => setShop(true)}
          onCreator={() => setScreen({ name: 'creator' })}
        />
        </div>
      )}
      {screen.name === 'mission' && <div className="h-3" />}
      <main className="flex-1 min-h-0">{body}</main>
      {shop && <Shop onClose={() => setShop(false)} />}
      <BreakReminder />
      {!game.seenIntro && <Intro onPlay={() => { sfx('success'); dispatch({ type: 'SEEN_INTRO' }); }} />}
      <RotateHint />
      <RewardPopup />
      <Toast />
    </div>
  );
}

function RotateHint() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="rotate-hint fixed inset-0 z-[85] bg-sky flex-col items-center justify-center p-6 text-center">
      <div className="text-7xl rotate-phone">📱</div>
      <p className="font-display text-3xl font-extrabold text-ink mt-4">Turn your phone sideways</p>
      <p className="font-body text-ink mt-2">CareerTown has more room to play that way.</p>
      <Btn tone="white" className="mt-5" onClick={() => setHidden(true)}>Play like this</Btn>
    </div>
  );
}

function Intro({ onPlay }: { onPlay: () => void }) {
  const { game } = useGame();
  return (
    <div className="fixed inset-0 z-[90] intro grid place-items-center p-4 overflow-y-auto">
      <div className="intro-card text-center relative">
        <div className="flex justify-center items-end gap-2 h-40 sm:h-56 mb-2">
          {game.characters.slice(0, 2).map((c, i) => {
            // Characters with artwork keep their real shape and relative height (tallest = full height).
            const sp = c.sprite ? SPRITES[c.sprite] : undefined;
            return sp
              ? <div key={c.id} className="intro-wave" style={{ animationDelay: `${i * 0.2}s`, height: `${Math.min(100, (sp.h / 262) * 100)}%`, aspectRatio: `${sp.w} / ${sp.h}` }}><Person c={c} mood="happy" /></div>
              : <div key={c.id} className={`${c.age === 'adult' ? 'w-24 sm:w-32 h-full' : 'w-20 sm:w-28 h-[80%]'} intro-wave`} style={{ animationDelay: `${i * 0.2}s` }}><Person c={c} mood="happy" /></div>;
          })}
        </div>
        <h1 className="logo-big font-display font-extrabold text-ink leading-none">CareerTown</h1>
        <p className="font-body text-ink text-lg sm:text-2xl mt-3 max-w-md mx-auto">Build a family, explore the town and try out real jobs.</p>
        <Btn tone="berry" className="mt-6 text-2xl sm:text-3xl px-10 py-4" onClick={onPlay}>Let’s play!</Btn>
      </div>
    </div>
  );
}

export default function App() {
  return <GameProvider><Game /></GameProvider>;
}
