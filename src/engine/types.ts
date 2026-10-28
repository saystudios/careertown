// ───────────────────────────────────────────────────────────
// CareerTown core types. Everything the game knows about lives here,
// so new buildings / careers / items only need new data, not new types.
// ───────────────────────────────────────────────────────────

export type CareerId =
  | 'lawyer' | 'engineer' | 'doctor' | 'teacher'
  | 'vet' | 'software' | 'entrepreneur' | 'chef' | 'performer' | 'lifeguard' | 'gardener' | 'fisher' | 'coach' | 'ranger';

export type BuildingId =
  | 'home' | 'school' | 'hospital' | 'courthouse' | 'engineering'
  | 'animal-hospital' | 'tech-lab' | 'restaurant' | 'shopping' | 'bank'
  | 'park' | 'beach' | 'cafe' | 'fishing' | 'playground' | 'nature-trail' | 'kpop';

export type FaceShape = 'round' | 'oval' | 'square';
export type EyeStyle = 'dot' | 'happy' | 'big' | 'lashes' | 'sleepy';
export type HairStyle = 'short' | 'bob' | 'long' | 'ponytail' | 'buns' | 'curly' | 'spiky' | 'buzz'
  | 'wavy' | 'locs' | 'braids' | 'afropuff' | 'topknot' | 'headscarf';
export type Build = 'slim' | 'average' | 'round';
export type TopStyle = 'tee' | 'stripes' | 'hoodie' | 'sweater' | 'star' | 'polo' | 'labcoat' | 'suit' | 'vest' | 'sweatshirt';
export type BottomStyle = 'pants' | 'jeans' | 'shorts' | 'skirt' | 'dress' | 'widejeans';
export type GlassesStyle = 'none' | 'round' | 'square' | 'star';
export type HatStyle = 'none' | 'cap' | 'beanie' | 'crown' | 'hardhat';
export type AccessoryStyle = 'none' | 'bow' | 'headphones' | 'scarf' | 'necklace' | 'crossbody';

export interface Look {
  skin: string;
  face: FaceShape;
  eyes: EyeStyle;
  hair: HairStyle;
  hairColor: string;
  top: TopStyle;
  topColor: string;
  bottom: BottomStyle;
  bottomColor: string;
  shoes: string;
  glasses: GlassesStyle;
  hat: HatStyle;
  accessory: AccessoryStyle;
  build?: Build;
  shoeAccent?: string;
}

export interface CharacterData {
  id: string;
  name: string;
  age: 'child' | 'adult';
  look: Look;
  /** Hand-drawn artwork id (data/sprites.ts). Sprite characters keep a fixed outfit. */
  sprite?: string;
  /** Outfit index for layered artwork characters. */
  outfit?: number;
  /** Worn accessories (item ids) by slot, for layered artwork characters. */
  wear?: Partial<Record<'head' | 'eyes' | 'ears' | 'bag', string>>;
  /** Dress-up character made in the character maker (drawn from data/doll.ts). */
  doll?: DollLook;
  /** YunaVerse character (painted pieces from data/paperArt.ts). Drawn instead of `doll` when set. */
  paper?: PaperLook;
  /** Recolored top / bottom (swatch names from data/clothes.ts) for layered artwork characters. */
  colors?: { top?: string; bottom?: string };
  /** Face the character wears when they aren't doing anything (data/wardrobe.ts EXPRESSIONS). */
  expression?: string;
  /** YunaVerse look that Reset in the Dress-Up Studio goes back to (family use their own outfits). */
  paperDefault?: PaperLook;
  /** Looks saved with the ♥ button in the Dress-Up Studio (newest first). */
  looks?: PaperLook[];
}

export interface DollLook {
  tone: number;                 // 0 light … 3 deep brown
  face: 'girl' | 'boy';
  hair: string | null;
  hairColor: string;
  eyes: string;
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  teeColor?: string;            // the plain tee underneath
  shortsColor?: string;
  /** Grown-up build: same head, longer body (dollArt ART_ADULT_*). */
  adult?: boolean;
}

export interface PaperLook {
  base: 'kid' | 'preschool' | 'adult';
  tone: number;                  // skin tone index (data/paperArt.ts PAPER_SKIN_TONES)
  hair: string | null;           // PAPER_HAIR id
  hairColor: string;             // PAPER_HAIR_COLOURS key
  top: string | null;            // PAPER_CLOTHES ids
  bottom: string | null;
  shoes: string | null;
  acc?: Partial<Record<'head' | 'eyes' | 'ears' | 'hair' | 'bag', string>>;
}

export type PetSpecies = 'puppy' | 'kitten' | 'bunny';
export interface PetData {
  id: string;
  species: PetSpecies;
  name: string;
  accessory: string; // pet-accessory catalog id, or 'none'
  sprite?: string;
  /** Outfit index for artwork pets (data/accessories.ts PET_LOOKS). */
  look?: number;
}

export type Pose = 'stand' | 'sit' | 'sleep' | 'walk' | 'wave';

/** Anything placed inside a room: a person, a pet or an object. */
export interface Entity {
  id: string;
  kind: 'character' | 'item' | 'pet';
  ref: string;          // characterId | petId | item def id
  x: number;            // bottom-centre, room units (0..1000)
  y: number;            // bottom-centre, room units (0..700)
  pose?: Pose;
  holding?: string;     // entity id held in hand (characters)
  heldBy?: string;      // entity id holding this item
  state?: Record<string, unknown>;
}

export type SceneId =
  | 'home-kitchen' | 'home-bedroom' | 'home-living' | 'home-bathroom'
  | 'school-classroom' | 'hospital-exam' | 'courthouse-room' | 'engineering-lab'
  | 'vet-clinic' | 'tech-lab' | 'restaurant-kitchen'
  | 'beach-shore' | 'park-lawn' | 'cafe-room' | 'fishing-dock' | 'playground-yard' | 'trail-woods' | 'shop-floor' | 'bank-hall' | 'kpop-studio'
  | 'kpop-booth' | 'kpop-dressing' | 'kpop-stage';

export interface Reward {
  coins?: number;
  xp?: number;
  career?: CareerId;
  careerXp?: number;
  badge?: string;       // badge id
  unlocks?: string[];   // catalog ids (clothes, furniture, pet accessories) or 'pet:puppy'
  title?: string;       // headline for the reward popup
}

export interface DailyState {
  date: string;   // yyyy-mm-dd
  id: string;
  progress: number;
  done: boolean;
}

export interface GameState {
  version: number;
  playerName: string;
  coins: number;
  xp: number;
  careerXp: Partial<Record<CareerId, number>>;
  badges: string[];
  completedMissions: Record<string, number>; // missionId -> times completed
  owned: string[];
  characters: CharacterData[];
  pets: PetData[];
  scenes: Partial<Record<SceneId, Entity[]>>;
  secrets: string[];
  daily: DailyState;
  stats: Record<string, number>; // event counters (eat, sleep, cook…)
  settings: { sound: boolean; music?: boolean; petFollow?: boolean; breakMins?: number; playdates?: boolean };
  /** Sticker book (daily stickers and special ones). */
  stickers?: string[];
  /** Last day (yyyy-mm-dd) a daily sticker was given. */
  lastPlayed?: string;
  activeCharacterId?: string;
  seenIntro: boolean;
}

export type Screen =
  | { name: 'map' }
  | { name: 'building'; id: BuildingId }
  | { name: 'scene'; sceneId: SceneId }
  | { name: 'mission'; id: string }
  | { name: 'creator'; editId?: string; back?: Screen }
  | { name: 'studio'; characterId?: string; back?: Screen }
  | { name: 'passport' }
  | { name: 'visit'; id: BuildingId }
  | { name: 'playdate' }
  | { name: 'shop' };
