import type { BuildingId, CareerId, SceneId } from '../engine/types';

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;
  career?: CareerId;
  playable: boolean;
  /** Map placement, room units (1000 x 700). x/y is the building's bottom-centre. */
  x: number; y: number; w: number;
  wall: string; roof: string; shape: 'house' | 'civic' | 'tower' | 'lab' | 'shop';
  rooms: { sceneId: SceneId; label: string; icon: string }[];
  missions: string[];
}

export const BUILDINGS: BuildingDef[] = [
  { id: 'home', name: 'My House', icon: '🏠', playable: true, x: 115, y: 280, w: 175, wall: '#FFE08A', roof: '#FF5D8F', shape: 'house',
    rooms: [
      { sceneId: 'home-kitchen', label: 'Kitchen', icon: '🍳' },
      { sceneId: 'home-bedroom', label: 'Bedroom', icon: '🛏️' },
      { sceneId: 'home-living', label: 'Living room', icon: '🛋️' },
      { sceneId: 'home-bathroom', label: 'Bathroom', icon: '🛁' },
    ], missions: [] },
  { id: 'school', name: 'School', icon: '🏫', career: 'teacher', playable: true, x: 325, y: 280, w: 200, wall: '#FFB27A', roof: '#C9473A', shape: 'civic',
    rooms: [{ sceneId: 'school-classroom', label: 'Classroom', icon: '🍎' }], missions: ['teacher-day'] },
  { id: 'hospital', name: 'Hospital', icon: '🏥', career: 'doctor', playable: true, x: 540, y: 280, w: 185, wall: '#FFFFFF', roof: '#FF5D8F', shape: 'tower',
    rooms: [{ sceneId: 'hospital-exam', label: 'Exam room', icon: '🩺' }], missions: ['doctor-checkup'] },
  { id: 'courthouse', name: 'Courthouse', icon: '⚖️', career: 'lawyer', playable: true, x: 750, y: 280, w: 190, wall: '#E8E4FF', roof: '#A98BFF', shape: 'civic',
    rooms: [{ sceneId: 'courthouse-room', label: 'Courtroom', icon: '⚖️' }], missions: ['lawyer-trophy'] },
  { id: 'engineering', name: 'Engineering Lab', icon: '🔧', career: 'engineer', playable: true, x: 150, y: 610, w: 215, wall: '#BFF0FF', roof: '#FF8A3D', shape: 'lab',
    rooms: [{ sceneId: 'engineering-lab', label: 'Workshop', icon: '🧱' }], missions: ['engineer-bridge'] },
  { id: 'animal-hospital', name: 'Animal Hospital', icon: '🐾', career: 'vet', playable: true, x: 375, y: 610, w: 165, wall: '#D4F7E8', roof: '#5FE0B7', shape: 'house',
    rooms: [{ sceneId: 'vet-clinic', label: 'Pet clinic', icon: '🐾' }], missions: ['vet-checkup'] },
  { id: 'tech-lab', name: 'Technology Lab', icon: '💻', career: 'software', playable: true, x: 550, y: 610, w: 150, wall: '#DCE6FF', roof: '#3D7BFF', shape: 'lab',
    rooms: [{ sceneId: 'tech-lab', label: 'Coding lab', icon: '💻' }], missions: ['software-robot'] },
  { id: 'restaurant', name: 'Restaurant', icon: '🍕', career: 'chef', playable: true, x: 715, y: 610, w: 150, wall: '#FFE3D1', roof: '#FF8A3D', shape: 'shop',
    rooms: [{ sceneId: 'restaurant-kitchen', label: 'Café kitchen', icon: '🍕' }], missions: ['chef-pizza'] },
  { id: 'shopping', name: 'Shopping Center', icon: '🛍️', career: 'entrepreneur', playable: false, x: 880, y: 610, w: 160, wall: '#FFE0F0', roof: '#FF7FB5', shape: 'shop', rooms: [{ sceneId: 'shop-floor', label: 'Clothes shop', icon: '👗' }], missions: ['shop-owner'] },
  { id: 'park', name: 'Park', icon: '🌳', playable: false, x: 345, y: 455, w: 150, wall: '#D4F7E8', roof: '#8BD46E', shape: 'house', rooms: [{ sceneId: 'park-lawn', label: 'Park', icon: '🌳' }], missions: ['park-garden'] },
  { id: 'beach', name: 'Beach', icon: '🏖️', playable: false, x: 100, y: 640, w: 150, wall: '#FFF1B8', roof: '#7FD3F7', shape: 'shop', rooms: [{ sceneId: 'beach-shore', label: 'Beach', icon: '🏖️' }], missions: ['lifeguard-duty'] },
  { id: 'cafe', name: 'Cafe', icon: '☕', playable: false, x: 860, y: 700, w: 150, wall: '#FFE3D1', roof: '#B98258', shape: 'shop', rooms: [{ sceneId: 'cafe-room', label: 'Cafe', icon: '☕' }], missions: ['cafe-barista'] },
  { id: 'fishing', name: 'Fishing', icon: '🎣', playable: false, x: 365, y: 870, w: 150, wall: '#CDEFFF', roof: '#3D7BFF', shape: 'shop', rooms: [{ sceneId: 'fishing-dock', label: 'Dock', icon: '🎣' }], missions: ['fishing-release'] },
  { id: 'playground', name: 'Playground', icon: '🛝', playable: false, x: 635, y: 880, w: 150, wall: '#FFE08A', roof: '#FF5D8F', shape: 'shop', rooms: [{ sceneId: 'playground-yard', label: 'Playground', icon: '🛝' }], missions: ['playground-coach', 'playground-upstander'] },
  { id: 'nature-trail', name: 'Nature Trail', icon: '🌲', playable: false, x: 880, y: 890, w: 150, wall: '#D4F7E8', roof: '#5FB894', shape: 'house', rooms: [{ sceneId: 'trail-woods', label: 'Trail', icon: '🌲' }], missions: ['trail-ranger'] },
  { id: 'kpop', name: 'K-pop Training Academy', icon: '🎵', playable: false, x: 640, y: 610, w: 150, wall: '#F3DDFF', roof: '#C77DFF', shape: 'lab', rooms: [{ sceneId: 'kpop-studio', label: 'Dance studio', icon: '🎵' }], missions: ['kpop-star'] },
  { id: 'bank', name: 'Bank', icon: '🏦', playable: false, x: 925, y: 280, w: 120, wall: '#EFEFEF', roof: '#8E8E9A', shape: 'civic', rooms: [{ sceneId: 'bank-hall', label: 'Bank', icon: '🏦' }], missions: ['bank-saver'] },
];

export const building = (id: string) => BUILDINGS.find((b) => b.id === id)!;
