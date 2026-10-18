import type { Entity, SceneId } from '../engine/types';
import artLiving from '../assets/rooms/home-living.webp';
import artKitchen from '../assets/rooms/home-kitchen.webp';
import artBedroom from '../assets/rooms/home-bedroom.webp';
import artBathroom from '../assets/rooms/home-bathroom.webp';
import artClassroom from '../assets/rooms/school-classroom.webp';
import artHospital from '../assets/rooms/hospital-exam.webp';
import artCourt from '../assets/rooms/courthouse-room.webp';
import artEngineering from '../assets/rooms/engineering-lab.webp';
import artKpop from '../assets/rooms/kpop-studio.webp';
import artVet from '../assets/rooms/vet-clinic.webp';

export interface SceneDef {
  id: SceneId;
  label: string;
  wall: string;
  wallPattern: 'dots' | 'stripes' | 'tiles' | 'plain' | 'panels' | 'grid';
  floor: string;
  floorPattern: 'boards' | 'tiles' | 'carpet' | 'checker';
  horizon: number; // y where wall meets floor
  /** Painted background (wide image: the room is the middle 1/1.6, the sides extend it for wide screens). */
  art?: string;
  /** Outdoor places: sky, ground and scenery drawn by RoomBackdrop. */
  outdoor?: 'beach' | 'park' | 'dock' | 'playground' | 'trail';
  /** Things painted into the art: [x, y, w, h] in room units. `hide` = don't draw our own picture of it. */
  anchors?: Partial<Record<string, { box?: [number, number, number, number]; hide?: boolean }>>;
}

/** How much wider than the room the painted images are (centre = the room). */
export const ART_WIDE = 1.6;

export const SCENES: Record<SceneId, SceneDef> = {
  'home-kitchen': { id: 'home-kitchen', label: 'Kitchen', wall: '#FFF1B8', wallPattern: 'tiles', floor: '#F7B98B', floorPattern: 'checker', horizon: 470, art: artKitchen, anchors: { window: { box: [310, 80, 510, 290], hide: true } } },
  'home-bedroom': { id: 'home-bedroom', label: 'Bedroom', wall: '#D9CCFF', wallPattern: 'dots', floor: '#C98F63', floorPattern: 'boards', horizon: 490, art: artBedroom, anchors: { window: { box: [400, 120, 320, 240], hide: true } } },
  'home-living': { id: 'home-living', label: 'Living room', wall: '#BFEBDD', wallPattern: 'stripes', floor: '#B98258', floorPattern: 'boards', horizon: 480, art: artLiving, anchors: { window: { box: [400, 110, 420, 260], hide: true } } },
  'home-bathroom': { id: 'home-bathroom', label: 'Bathroom', wall: '#CDEFFF', wallPattern: 'tiles', floor: '#9FD8E8', floorPattern: 'tiles', horizon: 500, art: artBathroom, anchors: { window: { box: [330, 80, 460, 310], hide: true } } },
  'school-classroom': { id: 'school-classroom', label: 'Classroom', wall: '#FFE0C2', wallPattern: 'panels', floor: '#D7A46F', floorPattern: 'boards', horizon: 490, art: artClassroom, anchors: { window: { box: [0, 40, 90, 340], hide: true } } },
  'hospital-exam': { id: 'hospital-exam', label: 'Exam room', wall: '#E3F6F1', wallPattern: 'plain', floor: '#BFE3EA', floorPattern: 'tiles', horizon: 500, art: artHospital, anchors: { window: { box: [220, 140, 360, 250], hide: true } } },
  'courthouse-room': { id: 'courthouse-room', label: 'Courtroom', wall: '#E6DDF8', wallPattern: 'panels', floor: '#8E5B3F', floorPattern: 'boards', horizon: 450, art: artCourt, anchors: { window: { box: [10, 40, 140, 320], hide: true }, scales: { hide: true } } },
  'vet-clinic': { id: 'vet-clinic', label: 'Pet clinic', wall: '#D4F7E8', wallPattern: 'dots', floor: '#FFE3B3', floorPattern: 'checker', horizon: 450, art: artVet, anchors: { window: { box: [250, 130, 370, 250], hide: true }, pawposter: { hide: true } } },
  'restaurant-kitchen': { id: 'restaurant-kitchen', label: 'Café kitchen', wall: '#FFE3D1', wallPattern: 'tiles', floor: '#E9B98F', floorPattern: 'checker', horizon: 460 },
  'tech-lab': { id: 'tech-lab', label: 'Coding lab', wall: '#DCE6FF', wallPattern: 'grid', floor: '#B7C6D6', floorPattern: 'tiles', horizon: 440 },
  'beach-shore': { id: 'beach-shore', label: 'Beach', wall: '#8FD8FF', wallPattern: 'plain', floor: '#FFE3A3', floorPattern: 'carpet', horizon: 430, outdoor: 'beach' },
  'park-lawn': { id: 'park-lawn', label: 'Park', wall: '#A8E3FF', wallPattern: 'plain', floor: '#8FD46B', floorPattern: 'carpet', horizon: 440, outdoor: 'park' },
  'fishing-dock': { id: 'fishing-dock', label: 'Fishing dock', wall: '#9EDCFF', wallPattern: 'plain', floor: '#B98258', floorPattern: 'boards', horizon: 450, outdoor: 'dock' },
  'playground-yard': { id: 'playground-yard', label: 'Playground', wall: '#A8E3FF', wallPattern: 'plain', floor: '#F2C48D', floorPattern: 'carpet', horizon: 440, outdoor: 'playground' },
  'trail-woods': { id: 'trail-woods', label: 'Nature trail', wall: '#B6E6FF', wallPattern: 'plain', floor: '#7DBF6A', floorPattern: 'carpet', horizon: 450, outdoor: 'trail' },
  'cafe-room': { id: 'cafe-room', label: 'Cafe', wall: '#FFE3D1', wallPattern: 'stripes', floor: '#C98F63', floorPattern: 'boards', horizon: 450 },
  'shop-floor': { id: 'shop-floor', label: 'Clothes shop', wall: '#FFE0F0', wallPattern: 'dots', floor: '#F6E8F0', floorPattern: 'tiles', horizon: 450 },
  'bank-hall': { id: 'bank-hall', label: 'Bank', wall: '#EEF0F6', wallPattern: 'panels', floor: '#D9D2C3', floorPattern: 'checker', horizon: 450 },
  'kpop-studio': { id: 'kpop-studio', label: 'Dance studio', wall: '#F3DDFF', wallPattern: 'plain', floor: '#E8B47E', floorPattern: 'boards', horizon: 470, art: artKpop },
  'engineering-lab': { id: 'engineering-lab', label: 'Workshop', wall: '#D8EEFF', wallPattern: 'grid', floor: '#9AA6B8', floorPattern: 'checker', horizon: 450, art: artEngineering, anchors: { window: { box: [300, 130, 300, 240], hide: true } } },
};


/** Things added to every room in Oct 2026 (also added once to saved games, see store.tsx). */
export const EXTRA_ITEMS: Partial<Record<SceneId, [string, number, number][]>> = {
  'home-kitchen': [['kettle', 230, 690], ['strawberry', 420, 700], ['grapes', 610, 700], ['spoon', 980, 700]],
  'home-bedroom': [['guitar', 200, 700], ['dino', 385, 705], ['piggybank', 555, 700], ['unicorn', 960, 700]],
  'home-living': [['photo', 590, 300], ['books', 340, 705], ['gamepad', 560, 705], ['puzzle', 880, 700]],
  'home-bathroom': [['shampoo', 700, 670], ['sponge', 270, 690], ['bubbles', 330, 640]],
  'school-classroom': [['crayons', 70, 700], ['abacus', 760, 705], ['microscope', 960, 690], ['books', 40, 600]],
  'hospital-exam': [['xray', 760, 270], ['clipboard', 560, 690], ['icepack', 260, 690], ['lollipop', 160, 690]],
  'courthouse-room': [['camera', 480, 690], ['notebook', 120, 690], ['footprints', 600, 695], ['key', 790, 690]],
  'vet-clinic': [['hay', 200, 690], ['tennisball', 470, 700], ['mousetoy', 880, 700]],
  'restaurant-kitchen': [['orderbell', 600, 700], ['pineapple', 560, 690], ['olive', 640, 695], ['onion', 240, 690]],
  'tech-lab': [['laptop', 430, 690], ['joystick', 690, 695], ['battery', 330, 700], ['gadgetbox', 210, 705]],
  'engineering-lab': [['magnet', 300, 700], ['screwdriver', 960, 700], ['bolts', 820, 705], ['ladder', 70, 680]],
  // play boxes (also added once to saved games: 'pack:play-boxes-1')
  'beach-shore': [['beachbag', 210, 705]],
  'playground-yard': [['toybin', 210, 705]],
  'trail-woods': [['hikepack', 210, 705]],
  'cafe-room': [['treatcase', 210, 705]],
  'shop-floor': [['shoprack', 210, 705]],
  'bank-hall': [['coindrawer', 210, 705]],
  'kpop-studio': [['propbox', 210, 705]],
};
export const PLAY_BOXES = new Set(['beachbag', 'toybin', 'hikepack', 'treatcase', 'shoprack', 'coindrawer', 'propbox', 'gadgetbox']);
export const extraFor = (id: SceneId): Entity[] => (EXTRA_ITEMS[id] ?? []).map(([ref, x, y]) => ({ id: `${ref}-x${x}`, kind: 'item', ref, x, y }));

let n = 0;
const it = (ref: string, x: number, y: number, state?: Record<string, unknown>): Entity =>
  ({ id: `${ref}-${++n}`, kind: 'item', ref, x, y, state });

/** Starting furniture for each room. Characters and pets are added by the player. */
export function initialScene(id: SceneId): Entity[] {
  return [...baseScene(id), ...extraFor(id)];
}
function baseScene(id: SceneId): Entity[] {
  n = 0;
  switch (id) {
    case 'home-kitchen': {
      const counter = it('counter', 330, 480);
      const table = it('table', 700, 610);
      return [
        it('window', 520, 255), it('cupboard', 800, 205), it('fridge', 115, 480), counter,
        it('stove', 515, 480), { ...it('cookiejar', 300, 312), state: { on: counter.id } }, table,
        it('chair', 540, 625), it('chair', 870, 625), it('door', 925, 470, { to: 'home-living' }),
        { ...it('apple', 670, 488), state: { on: table.id } }, { ...it('banana', 740, 488), state: { on: table.id } },
      ];
    }
    case 'home-bedroom': {
      const desk = it('studydesk', 700, 560);
      return [
        it('window', 520, 250), it('closet', 130, 520), it('rug', 470, 685), it('bed', 410, 610),
        it('secretspot', 470, 628), desk, { ...it('lamp-pink', 760, 438), state: { on: desk.id } }, it('toybox', 800, 670),
        it('backpack', 300, 680), it('clock', 640, 680), it('door-pink', 925, 500, { to: 'home-bathroom' }),
      ];
    }
    case 'home-living':
      return [
        it('window', 330, 250), it('bookshelf', 110, 500), it('rug', 470, 670), it('couch', 450, 585),
        it('tv', 790, 545), it('lamp', 640, 520), it('door', 925, 500, { to: 'home-bedroom' }),
        it('armchair', 235, 640), it('plant', 690, 690),
      ];
    case 'home-bathroom':
      return [
        it('shower', 160, 530), it('toilet', 380, 515), it('mirror', 600, 393), it('bathsink', 600, 505),
        it('towel-rack', 760, 300), it('bath-shelf', 770, 520), it('laundry-basket', 460, 520),
        it('bathmat', 430, 650), it('toothbrush', 560, 660), it('duck', 160, 660), it('step-stool', 610, 640),
        it('door-white', 925, 500, { to: 'home-kitchen' }),
      ];
    case 'school-classroom': {
      const tdesk = it('teacherdesk', 830, 520);
      return [
        it('chalkboard', 450, 280), it('schoolclock', 830, 150), it('window', 100, 250), tdesk,
        { ...it('bell', 760, 386), state: { on: tdesk.id } }, { ...it('globe', 850, 386), state: { on: tdesk.id } },
        { ...it('apple', 920, 386), state: { on: tdesk.id } },
        it('desk', 170, 665), it('desk', 400, 665), it('desk', 630, 665),
        it('book', 900, 670), it('pencil', 280, 690), it('backpack', 520, 690),
      ];
    }
    case 'hospital-exam':
      return [
        it('window', 200, 250), it('heartposter', 560, 260), it('medcabinet', 840, 470), it('exambed', 420, 600),
        it('chair', 820, 650), it('thermometer', 640, 660), it('bandage', 710, 670),
      ];
    case 'courthouse-room': {
      const bench = it('judgebench', 500, 410);
      const t1 = it('lawtable', 300, 640);
      return [
        it('scales', 500, 160), bench, { ...it('gavel', 610, 236), state: { on: bench.id } },
        it('witnessstand', 820, 470), it('jurybox', 165, 470), t1, it('lawtable', 700, 640),
        { ...it('folder', 260, 527), state: { on: t1.id } }, { ...it('magnifier', 340, 527), state: { on: t1.id } },
        it('scroll', 900, 680),
      ];
    }
    case 'vet-clinic':
      return [
        it('window', 200, 250), it('pawposter', 560, 260), it('petcabinet', 840, 470), it('exambed', 420, 600),
        it('petbed', 760, 680), it('petbrush', 640, 665), it('carrot', 700, 680),
        { id: 'visitor-bunny-ent', kind: 'pet', ref: 'visitor-bunny', x: 330, y: 660, pose: 'stand' },
        { id: 'visitor-puppy-ent', kind: 'pet', ref: 'visitor-puppy', x: 560, y: 690, pose: 'stand' },
      ];
    case 'restaurant-kitchen': {
      const counter = it('counter', 330, 470);
      const table = it('table', 700, 610);
      return [
        it('window', 520, 245), it('fridge', 110, 470), counter, it('stove', 520, 470),
        { ...it('dough', 290, 300), state: { on: counter.id } }, { ...it('tomato', 360, 300), state: { on: counter.id } },
        table, it('chair', 540, 625), it('chair', 870, 625),
        { ...it('plate', 660, 478), state: { on: table.id } }, { ...it('cup', 740, 478), state: { on: table.id } },
        it('cheese', 300, 680), it('mushroom', 400, 690), it('pepper', 480, 685),
      ];
    }
    case 'tech-lab':
      return [
        it('codeposter', 470, 250), it('serverrack', 110, 480), it('window', 800, 240),
        it('computer', 360, 600, { on: true }), it('computer', 660, 600), it('chair', 250, 650), it('chair', 770, 650),
        it('robot', 900, 660), it('keyboard', 520, 680), it('headset', 160, 680), it('floppy', 600, 690),
      ];
    case 'beach-shore':
      return [it('umbrella', 200, 520), it('sandcastle', 760, 600), it('palm', 40, 520), it('towel', 420, 640), it('shell', 560, 680), it('crab', 860, 690), it('volleyball', 320, 690), it('bucket', 640, 690), it('icecream', 120, 690)];
    case 'park-lawn':
      return [it('tree', 120, 500), it('fountain', 520, 500), it('tree', 900, 500), it('bench', 300, 600), it('picnic', 720, 640), it('flowers', 420, 690), it('frisbee', 580, 690), it('kite', 860, 600), it('bird', 640, 460), it('ball', 200, 690)];
    case 'fishing-dock':
      return [it('boat', 260, 540), it('fishrod', 520, 640), it('bucket', 620, 680), it('fish', 720, 690), it('fish', 780, 700), it('duck', 900, 640), it('bench', 120, 620), it('tacklebox', 400, 690)];
    case 'playground-yard':
      return [it('slide', 230, 560), it('carousel', 760, 560), it('tree', 960, 480), it('ball', 420, 690), it('basketball', 520, 695), it('jumprope', 620, 690), it('sandbucket', 860, 690), it('bench', 470, 600)];
    case 'trail-woods':
      return [it('pine', 100, 480), it('pine', 300, 450), it('tent', 620, 530), it('pine', 920, 470), it('rock', 420, 640), it('mushroom', 520, 690), it('butterfly', 760, 480), it('squirrel', 860, 660), it('compass', 300, 690), it('trailmap', 680, 695), it('binoculars', 200, 690)];
    case 'cafe-room': {
      const table = it('table', 660, 610);
      return [
        it('window', 300, 240), it('counter', 160, 470), it('plant', 900, 540), table, it('chair', 500, 625), it('chair', 830, 625),
        { ...it('cup', 620, 478), state: { on: table.id } }, { ...it('croissant', 700, 478), state: { on: table.id } },
        it('cake', 120, 300), it('waffle', 360, 690), it('kettle', 230, 300), it('orderbell', 420, 690),
      ];
    }
    case 'shop-floor':
      return [
        it('mirror', 520, 280), it('rug', 500, 660), it('dress', 160, 560), it('tshirt', 280, 560), it('handbag', 740, 560), it('sneaker', 860, 580),
        it('cap', 640, 680), it('shoppingbag', 380, 690), it('piggybank', 920, 690), it('plant', 60, 600),
      ];
    case 'bank-hall':
      return [
        it('window', 250, 240), it('lawtable', 520, 560), it('safe', 330, 530), it('plant', 120, 600), it('piggybank', 400, 690),
        it('coins', 600, 690), it('moneybag', 700, 690), it('chair', 760, 640), it('photo', 700, 280),
      ];
    case 'kpop-studio':
      return [it('kp-mic', 380, 690), it('kp-lightstick', 520, 690), it('kp-trophy', 660, 690), it('kp-folder', 240, 690), it('guitar', 800, 690), it('drum', 900, 690), it('kp-bottle', 120, 690)];
    case 'engineering-lab': {
      const bench = it('workbench', 300, 570);
      return [
        it('blueprint', 300, 240), it('window', 720, 240), bench, it('blockbin', 620, 500),
        { ...it('toolbox', 230, 432), state: { on: bench.id } }, { ...it('wrench', 340, 432), state: { on: bench.id } },
        it('robot', 860, 620), it('block-red', 520, 670), it('block-blue', 640, 670), it('block-yellow', 740, 680),
        it('gear', 420, 680),
      ];
    }
  }
}
