/**
 * Dress-up rules, kept free of React so they can be tested: putting a piece on, taking it off,
 * job outfits, saved looks and cleaning up looks from older saves.
 */
import type { CharacterData, PaperLook } from './types';
import { PAPER_CLOTHES, PAPER_HAIR, PAPER_ACCESSORIES, PAPER_HAIR_COLOURS, PAPER_BASES } from '../data/paperArt';
import { FULL_OUTFITS, WARDROBE_BY_ID, isExpression, presetsFor, type OutfitPreset, type Template, type WardrobeItem, type AccSlot } from '../data/wardrobe';

const fits = (ref: string | null | undefined, kind: 'top' | 'bottom' | 'shoes', t: Template) => {
  if (!ref) return false;
  const c = PAPER_CLOTHES[ref];
  return !!c && c.kind === kind && (c.base === t || (c.base === 'any' && t !== 'adult'));
};
export const isFullOutfit = (ref: string | null | undefined) => !!ref && FULL_OUTFITS.has(ref);

/** Is this piece on the character right now? */
export function isWorn(p: PaperLook, item: WardrobeItem): boolean {
  switch (item.category) {
    case 'hair': return p.hair === item.ref;
    case 'top': case 'dress': return p.top === item.ref;
    case 'bottom': return p.bottom === item.ref;
    case 'shoes': return p.shoes === item.ref;
    case 'accessory': return !!item.slot && p.acc?.[item.slot] === item.ref;
  }
}

/** Put a piece on. Dresses replace the top and the bottom; a top or bottom replaces a dress. */
export function equip(p: PaperLook, item: WardrobeItem): PaperLook {
  if (!item.compatibleTemplates.includes(p.base)) return p;
  switch (item.category) {
    case 'hair': return { ...p, hair: item.ref };
    case 'dress': return { ...p, top: item.ref, bottom: null };
    case 'top': return { ...p, top: item.ref };
    case 'bottom': return { ...p, bottom: item.ref, top: isFullOutfit(p.top) ? null : p.top };
    case 'shoes': return { ...p, shoes: item.ref };
    case 'accessory': return item.slot ? { ...p, acc: { ...(p.acc ?? {}), [item.slot]: item.ref } } : p;
  }
}

/** Take a piece off (hair stays: tapping the hairstyle you have does nothing). */
export function unequip(p: PaperLook, item: WardrobeItem): PaperLook {
  switch (item.category) {
    case 'hair': return p;
    case 'top': case 'dress': return p.top === item.ref ? { ...p, top: null } : p;
    case 'bottom': return p.bottom === item.ref ? { ...p, bottom: null } : p;
    case 'shoes': return p.shoes === item.ref ? { ...p, shoes: null } : p;
    case 'accessory': {
      if (!item.slot || p.acc?.[item.slot] !== item.ref) return p;
      const acc = { ...(p.acc ?? {}) }; delete acc[item.slot];
      return { ...p, acc };
    }
  }
}

/** A tap on a wardrobe tile: on if it's off, off if it's on. */
export const toggle = (p: PaperLook, item: WardrobeItem) => (isWorn(p, item) ? unequip(p, item) : equip(p, item));
export const toggleById = (p: PaperLook, id: string) => { const it = WARDROBE_BY_ID[id]; return it ? toggle(p, it) : p; };

/** Job outfit: every piece of it goes on at once; hair and accessories stay. */
export function applyPreset(p: PaperLook, preset: OutfitPreset): PaperLook {
  const set = preset.pieces[p.base];
  if (!set || !presetsFor(p.base).some((x) => x.id === preset.id)) return p;
  return { ...p, top: set.top ?? null, bottom: set.bottom ?? null, shoes: set.shoes ?? null };
}
export const isPresetWorn = (p: PaperLook, preset: OutfitPreset) => {
  const set = preset.pieces[p.base];
  return !!set && (set.top ?? null) === (p.top ?? null) && (set.bottom ?? null) === (p.bottom ?? null) && (set.shoes ?? null) === (p.shoes ?? null);
};
/** Pieces of a job outfit (art ids), to check locks. */
export const presetRefs = (preset: OutfitPreset, t: Template) => Object.values(preset.pieces[t] ?? {}).filter((r): r is string => !!r);

/**
 * Make a saved look safe to draw: pieces that no longer exist or don't fit this body are taken off,
 * an unknown hair colour becomes the first one. Nothing that fits is ever changed.
 */
export function sanitizeLook(p: PaperLook): PaperLook {
  const base: Template = PAPER_BASES[p.base] ? p.base : 'kid';
  const acc: NonNullable<PaperLook['acc']> = {};
  for (const [slot, ref] of Object.entries(p.acc ?? {}) as [AccSlot, string | undefined][]) {
    const a = ref ? PAPER_ACCESSORIES[ref] : undefined;
    if (a && a.slot === slot && a.at[base]) acc[slot] = ref;
  }
  const colours = Object.keys(PAPER_HAIR_COLOURS);
  return {
    ...p,
    base,
    tone: Number.isFinite(p.tone) ? Math.max(0, Math.min(PAPER_BASES[base].src.length - 1, Math.round(p.tone))) : 0,
    hair: p.hair && PAPER_HAIR[p.hair] ? p.hair : null,
    hairColor: PAPER_HAIR_COLOURS[p.hairColor] ? p.hairColor : colours[0],
    top: fits(p.top, 'top', base) ? p.top : null,
    bottom: fits(p.bottom, 'bottom', base) ? p.bottom : null,
    shoes: fits(p.shoes, 'shoes', base) ? p.shoes : null,
    acc,
  };
}

/** The same look? (for highlighting saved looks and skipping no-op undo steps) */
export const sameLook = (a: PaperLook | undefined, b: PaperLook | undefined) => JSON.stringify(sanitizeLook(a ?? ({} as PaperLook))) === JSON.stringify(sanitizeLook(b ?? ({} as PaperLook)));

/** Saved looks per character (the ♥ button). */
export const MAX_LOOKS = 6;
export function addSavedLook(c: CharacterData): CharacterData {
  if (!c.paper) return c;
  const looks = (c.looks ?? []).filter((l) => !sameLook(l, c.paper));
  return { ...c, looks: [{ ...c.paper, acc: { ...(c.paper.acc ?? {}) } }, ...looks].slice(0, MAX_LOOKS) };
}
export const removeSavedLook = (c: CharacterData, i: number): CharacterData => ({ ...c, looks: (c.looks ?? []).filter((_, k) => k !== i) });

/** Tidy one character from an older save: safe look, a default look to reset to, a valid expression. */
export function upgradeCharacter(c: CharacterData): CharacterData {
  if (!c.paper) return isExpression(c.expression) || c.expression === undefined ? c : { ...c, expression: undefined };
  const paper = sanitizeLook(c.paper);
  return {
    ...c,
    paper,
    paperDefault: c.paperDefault ? sanitizeLook(c.paperDefault) : { ...paper, acc: { ...paper.acc } },
    looks: c.looks?.map(sanitizeLook).filter((l) => l.base === paper.base),
    expression: isExpression(c.expression) ? c.expression : undefined,
  };
}
