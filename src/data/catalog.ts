import type { Look, Reward } from '../engine/types';

// ── Character creator options ───────────────────────────
export const SKIN_TONES = ['#FCE3CF', '#F6CBA5', '#E8AE7E', '#C98B5B', '#A0663F', '#7A4A2B', '#5A3520', '#F3D6B8'];
export const HAIR_COLORS = ['#2B1B12', '#5B3A21', '#A8652F', '#E9B44C', '#F5E08A', '#C9473A', '#8E8E9A', '#6C5CE7', '#FF7FB5', '#3FC1C9'];
export const CLOTH_COLORS = ['#FF5D8F', '#FFC93C', '#5FE0B7', '#7FD3F7', '#A98BFF', '#FF8A3D', '#3D7BFF', '#2B2350', '#FFFFFF', '#8BD46E'];

type Unlock = { shop?: number; mission?: string; secret?: string };
export interface WardrobeOption<T extends string> { id: T; label: string; unlock?: Unlock }

export const FACES: WardrobeOption<Look['face']>[] = [
  { id: 'round', label: 'Round' }, { id: 'oval', label: 'Oval' }, { id: 'square', label: 'Square' },
];
export const EYES: WardrobeOption<Look['eyes']>[] = [
  { id: 'dot', label: 'Dots' }, { id: 'happy', label: 'Happy' }, { id: 'big', label: 'Sparkly' },
  { id: 'lashes', label: 'Lashes' }, { id: 'sleepy', label: 'Calm' },
];
export const HAIRS: WardrobeOption<Look['hair']>[] = [
  { id: 'short', label: 'Short' }, { id: 'bob', label: 'Bob' }, { id: 'long', label: 'Long' },
  { id: 'ponytail', label: 'Ponytail' }, { id: 'buns', label: 'Space buns' }, { id: 'curly', label: 'Curly' },
  { id: 'spiky', label: 'Spiky' }, { id: 'buzz', label: 'Buzz' }, { id: 'wavy', label: 'Wavy' },
  { id: 'locs', label: 'Locs' }, { id: 'braids', label: 'Braids' }, { id: 'afropuff', label: 'Puff' },
  { id: 'topknot', label: 'Top knot' }, { id: 'headscarf', label: 'Headscarf' },
];
export const BUILDS: WardrobeOption<'slim' | 'average' | 'round'>[] = [
  { id: 'slim', label: 'Slim' }, { id: 'average', label: 'Medium' }, { id: 'round', label: 'Round' },
];
export const TOPS: WardrobeOption<Look['top']>[] = [
  { id: 'tee', label: 'T-shirt' }, { id: 'stripes', label: 'Stripes' }, { id: 'hoodie', label: 'Hoodie' },
  { id: 'sweater', label: 'Sweater' }, { id: 'star', label: 'Star tee' }, { id: 'polo', label: 'Polo' },
  { id: 'labcoat', label: 'Doctor coat', unlock: { mission: 'doctor-checkup' } },
  { id: 'suit', label: 'Lawyer suit', unlock: { mission: 'lawyer-trophy' } },
  { id: 'vest', label: 'Safety vest', unlock: { mission: 'engineer-bridge' } },
];
export const BOTTOMS: WardrobeOption<Look['bottom']>[] = [
  { id: 'pants', label: 'Pants' }, { id: 'jeans', label: 'Jeans' }, { id: 'shorts', label: 'Shorts' },
  { id: 'skirt', label: 'Skirt' }, { id: 'dress', label: 'Dress' },
];
export const GLASSES: WardrobeOption<Look['glasses']>[] = [
  { id: 'none', label: 'None' }, { id: 'round', label: 'Round' }, { id: 'square', label: 'Square' },
  { id: 'star', label: 'Star shades', unlock: { shop: 40 } },
];
export const HATS: WardrobeOption<Look['hat']>[] = [
  { id: 'none', label: 'None' }, { id: 'cap', label: 'Cap' }, { id: 'beanie', label: 'Beanie' },
  { id: 'crown', label: 'Crown', unlock: { secret: 'balloon' } },
  { id: 'hardhat', label: 'Hard hat', unlock: { mission: 'engineer-bridge' } },
];
export const ACCESSORIES: WardrobeOption<Look['accessory']>[] = [
  { id: 'none', label: 'None' }, { id: 'bow', label: 'Bow' }, { id: 'scarf', label: 'Scarf' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'headphones', label: 'Headphones', unlock: { shop: 50 } },
];

/** Catalog id used in `owned` for a wardrobe option. */
export const wardrobeKey = (slot: string, id: string) => `wear:${slot}:${id}`;

// ── Pet accessories ─────────────────────────────────────
export const PET_ACCESSORIES = [
  { id: 'none', label: 'None', color: 'transparent' },
  { id: 'collar-red', label: 'Red collar', color: '#FF5D8F', price: 20 },
  { id: 'collar-blue', label: 'Blue collar', color: '#3D7BFF', price: 20 },
  { id: 'bow-pink', label: 'Pink bow', color: '#FF7FB5', price: 30 },
  { id: 'collar-gold', label: 'Golden collar', color: '#FFC93C' },
];

// ── Visiting patients at the Animal Hospital (not owned by the player) ──
export const VISITORS: Record<string, { id: string; species: 'puppy' | 'kitten' | 'bunny'; name: string; accessory: string }> = {
  'visitor-bunny': { id: 'visitor-bunny', species: 'bunny', name: 'Clover', accessory: 'none' },
  'visitor-puppy': { id: 'visitor-puppy', species: 'puppy', name: 'Rex', accessory: 'collar-blue' },
};

// ── Shop (pretend coins, nothing is required to play) ──
export interface ShopEntry { id: string; label: string; price: number; kind: 'decor' | 'wear' | 'pet'; icon: string }
export const SHOP: ShopEntry[] = [
  { id: 'plant', label: 'Leafy plant', price: 25, kind: 'decor', icon: '🪴' },
  { id: 'beanbag', label: 'Beanbag', price: 40, kind: 'decor', icon: '🛋️' },
  { id: 'fishbowl', label: 'Fishbowl', price: 45, kind: 'decor', icon: '🐠' },
  { id: 'starrug', label: 'Star rug', price: 35, kind: 'decor', icon: '⭐' },
  { id: 'rocketposter', label: 'Rocket poster', price: 30, kind: 'decor', icon: '🚀' },
  { id: 'petbed', label: 'Pet bed', price: 30, kind: 'decor', icon: '🛏️' },
  { id: 'sofa', label: 'Blue sofa', price: 50, kind: 'decor', icon: '🛋️' },
  { id: 'bunkbed', label: 'Bunk bed', price: 60, kind: 'decor', icon: '🛏️' },
  { id: 'piano', label: 'Piano', price: 60, kind: 'decor', icon: '🎹' },
  { id: 'fireplace', label: 'Fireplace', price: 55, kind: 'decor', icon: '🔥' },
  { id: 'aquarium', label: 'Fish tank', price: 45, kind: 'decor', icon: '🐠' },
  { id: 'jukebox', label: 'Jukebox', price: 45, kind: 'decor', icon: '🎶' },
  { id: 'arcade', label: 'Arcade game', price: 50, kind: 'decor', icon: '🕹️' },
  { id: 'gumball', label: 'Gumball machine', price: 35, kind: 'decor', icon: '🍬' },
  { id: 'vanity', label: 'Dressing table', price: 45, kind: 'decor', icon: '💄' },
  { id: 'swingchair', label: 'Swing chair', price: 40, kind: 'decor', icon: '🪺' },
  { id: 'dollhouse', label: 'Dollhouse', price: 45, kind: 'decor', icon: '🏠' },
  { id: 'telescope', label: 'Big telescope', price: 40, kind: 'decor', icon: '🔭' },
  { id: 'ballpit', label: 'Ball pit', price: 50, kind: 'decor', icon: '🟣' },
  { id: 'cafetable', label: 'Round table', price: 25, kind: 'decor', icon: '☕' },
  { id: 'stool', label: 'Stool', price: 15, kind: 'decor', icon: '🪑' },
  { id: 'plantshelf', label: 'Wall shelf', price: 25, kind: 'decor', icon: '🪴' },
  { id: 'pet:collar-red', label: 'Red pet collar', price: 20, kind: 'pet', icon: '❤️' },
  { id: 'pet:collar-blue', label: 'Blue pet collar', price: 20, kind: 'pet', icon: '💙' },
  { id: 'pet:bow-pink', label: 'Pink pet bow', price: 30, kind: 'pet', icon: '🎀' },
];

// ── Badges ──────────────────────────────────────────────
export const BADGES: Record<string, { label: string; icon: string; desc: string }> = {
  'mystery-solver': { label: 'Mystery Solver', icon: '🔎', desc: 'Solved The Missing Science Trophy' },
  'bridge-builder': { label: 'Bridge Builder', icon: '🌉', desc: 'Built a bridge that held 5 cars' },
  'caring-doctor': { label: 'Caring Doctor', icon: '💗', desc: 'Gave Pip a full check-up' },
  'artist': { label: 'Chalk Artist', icon: '🖍️', desc: 'Drew on the classroom chalkboard' },
  'animal-helper': { label: 'Animal Helper', icon: '🐾', desc: 'Gave Clover the bunny a check-up' },
  'code-cadet': { label: 'Code Cadet', icon: '🤖', desc: 'Programmed Bolt to the charger' },
  'explorer': { label: 'Explorer', icon: '🧭', desc: 'Found 3 secrets around town' },
  'chef': { label: 'Little Chef', icon: '👩‍🍳', desc: 'Cooked 3 dishes at home' },
  'garden-helper': { label: 'Garden Helper', icon: '🌷', desc: 'Planted and watered the park garden' },
  'star-barista': { label: 'Star Barista', icon: '☕', desc: 'Made every drink just right at the cafe' },
  'lake-keeper': { label: 'Lake Keeper', icon: '🎣', desc: 'Caught, released and cleaned up at the lake' },
  'upstander': { label: 'Upstander', icon: '🦸', desc: 'Helped Pip and made friends with Zina' },
  'team-player': { label: 'Team Player', icon: '🏅', desc: 'Practised with Coach Jay' },
  'junior-ranger': { label: 'Junior Ranger', icon: '🌲', desc: 'Explored the nature trail with Willow' },
  'beach-hero': { label: 'Beach Hero', icon: '🛟', desc: 'Kept everyone safe as a lifeguard' },
  'super-saver': { label: 'Super Saver', icon: '🐷', desc: 'Counted coins and saved up at the bank' },
  'shop-star': { label: 'Shop Star', icon: '🛍️', desc: 'Ran Nia’s shop for a day' },
  'rising-star': { label: 'Rising Star', icon: '🌟', desc: 'Trained and performed at the K-pop Academy' },
  'pizza-chef': { label: 'Pizza Chef', icon: '🍕', desc: 'Served the pizza party at Café Sunny' },
  'star-teacher': { label: 'Star Teacher', icon: '🍎', desc: 'Planned, taught and checked homework with Ms. Park' },
};

// ── Secrets ─────────────────────────────────────────────
export const SECRETS: Record<string, { label: string; reward: Reward }> = {
  balloon: { label: 'The sky balloon', reward: { coins: 30, unlocks: [wardrobeKey('hat', 'crown')], title: 'You found the sky balloon! A crown is yours.' } },
  underbed: { label: 'Treasure under the bed', reward: { coins: 40, unlocks: ['trophy'], title: 'A treasure chest under the bed!' } },
  cookiejar: { label: 'The cookie jar', reward: { coins: 20, unlocks: ['fishbowl'], title: 'A golden cookie and a fishbowl!' } },
  schoolclock: { label: 'The silly clock', reward: { coins: 25, unlocks: ['rocketposter'], title: 'The clock spun backwards! Rocket poster unlocked.' } },
  gavel: { label: 'Order in the court', reward: { coins: 25, unlocks: ['pet:collar-gold'], title: 'Order! Order! A golden pet collar.' } },
  robot: { label: 'Robot dance party', reward: { coins: 25, unlocks: ['beanbag'], title: 'The robot danced! Beanbag unlocked.' } },
};
