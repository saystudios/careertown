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
import { CharacterCreator, NEW_CHARACTER } from './scenes/CharacterCreator';
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
import { TitleScreen } from './scenes/TitleScreen';
import { DressUpStudio } from './scenes/DressUpStudio';

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
};

function Game() {
  const { game, dispatch } = useGame();
  const [screen, setScreen] = useState<Screen>({ name: 'map' });
  const [shop, setShop] = useState(false);
  // Style Pack (bought in the iPhone/iPad app): check with Apple at launch; the friends join each save once.
  const stylePack = useOwned(STYLE_PACK.productId);
  useEffect(() => { refreshOwned(); }, []);
  // the title screen opens every time the game starts; its free gift is the day's sticker + coins
  const [titleOpen, setTitleOpen] = useState(true);
  const leaveTitle = () => {
    setTitleOpen(false);
    if (!game.seenIntro) dispatch({ type: 'SEEN_INTRO' });
    // a gift left unopened is still given when you go into town
    dispatch({ type: 'NEW_DAY', date: todayKey() });
  };
  // special stickers when you earn them
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
    : screen.name === 'creator' || screen.name === 'studio' || screen.name === 'passport' ? 'home' : 'work';
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
    case 'scene': { const here = screen; body = <SceneScreen key={screen.sceneId} sceneId={screen.sceneId} onScene={(sceneId) => setScreen({ name: 'scene', sceneId })} onMission={(id) => setScreen({ name: 'mission', id })} onStudio={(characterId, room) => setScreen({ name: 'studio', characterId, back: { ...here, sceneId: room } })} />; break; }
    case 'mission': {
      const View = MISSION_VIEWS[screen.id];
      const bid = MISSIONS[screen.id].building;
      const back = () => setScreen(building(bid).playable ? { name: 'building', id: bid } : { name: 'visit', id: bid });
      body = <View key={screen.id} onExit={back} />; break;
    }
    case 'creator': { const back = screen.back; body = <CharacterCreator key={screen.editId ?? 'active'} editId={screen.editId} onDone={() => setScreen(back ?? { name: 'map' })} />; break; }
    case 'studio': { const here = screen; body = <DressUpStudio characterId={screen.characterId} onBack={() => setScreen(here.back ?? { name: 'map' })} onEdit={(id) => setScreen({ name: 'creator', editId: id ?? NEW_CHARACTER, back: { ...here, characterId: undefined } })} />; break; }
    case 'passport': body = <Passport />; break;
    default: body = <TownMap onEnter={enter} onVisit={(id) => setScreen({ name: 'visit', id })} />;
  }

  return (
    <div className="app relative h-[100dvh] flex flex-col overflow-hidden">
      {screen.name !== 'mission' && screen.name !== 'studio' && (
        <div className={screen.name === 'map' || screen.name === 'scene' ? 'hud-float absolute inset-x-0 top-0 z-40 pointer-events-none [&>*]:pointer-events-auto' : ''}>
        <HUD
          title={title}
          onMap={screen.name === 'map' ? undefined : () => setScreen({ name: 'map' })}
          onPassport={() => setScreen({ name: 'passport' })}
          onShop={() => setShop(true)}
          onCreator={() => setScreen({ name: 'studio', back: screen })}
        />
        </div>
      )}
      {screen.name === 'mission' && <div className="h-3" />}
      <main className="flex-1 min-h-0">{body}</main>
      {shop && <Shop onClose={() => setShop(false)} />}
      <BreakReminder />
      {titleOpen && <TitleScreen onPlay={leaveTitle} onShop={() => setShop(true)} onCreator={() => { leaveTitle(); setScreen({ name: 'studio', back: { name: 'map' } }); }} />}
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

export default function App() {
  return <GameProvider><Game /></GameProvider>;
}
