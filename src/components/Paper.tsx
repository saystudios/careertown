import type { CharacterData, PaperLook } from '../engine/types';
import type { Mood } from './art/Character';
import type { Face } from '../data/sprites';
import { PAPER_CLOTHES, type Box, type PaperBase } from '../data/paperArt';
import { TownDoll } from './TownDoll';

/** Keep existing wardrobe IDs and body compatibility for saved CareerTown looks. */
const fits = (c: PaperBase | 'any', b: PaperBase) => c === b || (c === 'any' && b !== 'adult');

export function clothBox(id: string, base: PaperBase): Box | undefined {
  const c = PAPER_CLOTHES[id];
  if (!c || !fits(c.base, base)) return undefined;
  return c.atBase?.[base] ?? c.at;
}

export const paperClothesFor = (base: PaperBase, kind: 'top' | 'bottom' | 'shoes') =>
  Object.entries(PAPER_CLOTHES).filter(([, c]) => c.kind === kind && fits(c.base, base)).map(([id]) => id);

export function paperFace(mood: Mood | undefined, face: Face): string {
  switch (mood) {
    case 'happy': return 'laughing';
    case 'wow': return 'surprised';
    case 'sad': return 'sad';
    case 'grumpy': return 'grumpy';
    case 'wink': return 'wink';
    case 'silly': return face === 'wink' ? 'silly' : 'giggle';
    case 'eat': return face === 'wow' ? 'surprised' : 'happy';
    case 'sleep': return 'sleepy';
    case 'proud': return 'starry';
    default: return face === 'wink' ? 'wink' : face === 'wow' ? 'surprised' : face === 'sad' ? 'sad' : 'happy';
  }
}

/** Every character is now rendered with live vector hair, clothes and body pieces.
 * The same renderer is used in the map, scenes, character creator and wardrobe previews.
 * Saved PaperLook choices and all existing wardrobe actions remain unchanged.
 */
export function PaperArt({ p, face = 'happy' }: { p: PaperLook; face?: string }) {
  return <div className="w-full h-full" style={{ position: 'relative' }}><TownDoll p={p} face={face} /></div>;
}

export function PaperFaceIcon({ p, size }: { p: PaperLook; size: number }) {
  return (
    <div style={{ width: size, height: size, overflow: 'hidden', position: 'relative' }}>
      <TownDoll p={p} portrait />
    </div>
  );
}

export const isPaper = (c: CharacterData) => !!c.paper;
