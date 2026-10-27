/**
 * The Dress-Up Studio's wardrobe: every YunaVerse piece as a WardrobeItem with a stable id, a category,
 * the bodies it fits, where it is drawn (render layer) and what it can't be worn with.
 *
 * The pictures and their per-body placement boxes come from data/paperArt.ts (generated from the
 * YunaVerse art in art/yunaverse/ on the 1024 x 1536 canvas). Nothing here draws or moves art: it only
 * describes it, so a missing picture is simply left out of the wardrobe.
 */
import { PAPER_BASES, PAPER_CLOTHES, PAPER_HAIR, PAPER_ACCESSORIES, PAPER_FACES, type Box, type PaperBase } from './paperArt';
import { CAREER_OUTFITS, FAMILY_PAPER } from './dollLooks';
import { STYLE_PACK_CLOTHES, STYLE_PACK_FRIENDS } from './stylePack';
import type { PaperLook } from '../engine/types';

/** Body templates: standard kid, preschooler (shorter, rounder) and grown-up (longer torso and legs). */
export type Template = PaperBase;
export const TEMPLATES: Template[] = ['kid', 'preschool', 'adult'];

export type Category = 'hair' | 'top' | 'dress' | 'bottom' | 'shoes' | 'accessory';
export type AccSlot = 'head' | 'eyes' | 'ears' | 'hair' | 'bag';

/**
 * Drawing order, back to front. PaperArt (components/Paper.tsx) draws in exactly this order:
 * the head is drawn a second time over the collar so tops never cover the chin.
 */
export const RENDER_LAYERS = ['hairBack', 'body', 'shoes', 'bottom', 'top', 'bottomOverTop', 'bag', 'head', 'face', 'hairFront', 'headAccessory'] as const;
export type RenderLayer = (typeof RENDER_LAYERS)[number];

export type Unlock = { kind: 'mission'; key: string; mission: string } | { kind: 'stylePack' };

export interface WardrobeItem {
  /** Stable id, e.g. 'top:pink-hoodie', 'dress:fairy-dress', 'acc:head:pink-cap'. */
  id: string;
  /** The art id stored in a character's look (PaperLook). */
  ref: string;
  category: Category;
  /** For accessories: which spot they sit in (one per spot). */
  slot?: AccSlot;
  label: string;
  /** Picture used for the wardrobe tile (hair tiles draw the character's head instead). */
  thumb?: string;
  compatibleTemplates: Template[];
  renderLayer: RenderLayer;
  /** Where the piece sits on each body, [x, y, w, h] on the 1024 x 1536 canvas. */
  anchors: Partial<Record<Template, Box>>;
  /** Categories this piece takes off when it goes on. */
  conflicts: Category[];
  unlock?: Unlock;
}

/** Tops drawn as a whole outfit down to the knees or feet: they take the place of a top and a bottom. */
export const FULL_OUTFITS = new Set(['bunny-dress', 'fairy-dress', 'pink-overall-dress', 'taekwondo-uniform']);

const LABEL_FIX: Record<string, string> = {
  wavy: 'Long wavy', bob: 'Bob with clip', bobbangs: 'Bob with bangs', bowwaves: 'Waves with bow', braids: 'Two braids', locs: 'Locs',
  long: 'Long straight', longwaves: 'Long waves', messy: 'Messy', sideswept: 'Side-swept', spacebuns: 'Space buns', ponytail: 'High ponytail',
  momwaves: 'Long layers', dadshort: 'Short and swept', boyshort: 'Short and messy', sleekbob: 'Sleek bob', lowbun: 'Low side bun',
  scrunchieponytail: 'Ponytail with scrunchie', 'jersey-23': 'Jersey 23', 'taekwondo-uniform': 'Taekwondo uniform',
};
export const niceLabel = (ref: string) => LABEL_FIX[ref] ?? ref.replace(/^(mom|dad)-/, '').replace(/-/g, ' ').replace(/^\w/, (m) => m.toUpperCase());

/** Kids' clothes marked 'any' fit both kid bodies; grown-up clothes only the grown-up body. */
const clothTemplates = (base: PaperBase | 'any'): Template[] => (base === 'any' ? ['kid', 'preschool'] : [base]);

function careerUnlock(ref: string): Unlock | undefined {
  const c = CAREER_OUTFITS[ref];
  return c ? { kind: 'mission', key: c.unlock, mission: c.mission } : undefined;
}

function buildCatalog(): WardrobeItem[] {
  const items: WardrobeItem[] = [];
  for (const [ref, h] of Object.entries(PAPER_HAIR)) {
    const front = h.front ?? h.back;
    if (!front) continue;
    items.push({ id: `hair:${ref}`, ref, category: 'hair', label: niceLabel(ref), compatibleTemplates: TEMPLATES.filter((t) => !!front.at[t]),
      renderLayer: 'hairFront', anchors: { ...front.at }, conflicts: [] });
  }
  for (const [ref, c] of Object.entries(PAPER_CLOTHES)) {
    if (!c.src) continue;                                     // missing picture: leave it out
    const temps = clothTemplates(c.base);
    const anchors: WardrobeItem['anchors'] = {};
    for (const t of temps) anchors[t] = c.atBase?.[t] ?? c.at;
    const full = c.kind === 'top' && FULL_OUTFITS.has(ref);
    const category: Category = full ? 'dress' : c.kind;
    items.push({
      id: `${category}:${ref}`, ref, category, label: niceLabel(ref), thumb: c.src, compatibleTemplates: temps,
      renderLayer: c.kind === 'bottom' && c.overTop ? 'bottomOverTop' : c.kind === 'shoes' ? 'shoes' : c.kind === 'bottom' ? 'bottom' : 'top',
      anchors,
      conflicts: category === 'dress' ? ['top', 'bottom'] : category === 'top' || category === 'bottom' ? ['dress'] : [],
      unlock: careerUnlock(ref) ?? (STYLE_PACK_CLOTHES.has(ref) ? { kind: 'stylePack' } : undefined),
    });
  }
  for (const [ref, a] of Object.entries(PAPER_ACCESSORIES)) {
    if (!a.src) continue;
    items.push({ id: `acc:${a.slot}:${ref}`, ref, category: 'accessory', slot: a.slot, label: niceLabel(ref), thumb: a.src,
      compatibleTemplates: TEMPLATES.filter((t) => !!a.at[t]), renderLayer: a.slot === 'bag' ? 'bag' : 'headAccessory', anchors: { ...a.at }, conflicts: [] });
  }
  return items;
}

export const WARDROBE: WardrobeItem[] = buildCatalog();
export const WARDROBE_BY_ID: Record<string, WardrobeItem> = Object.fromEntries(WARDROBE.map((i) => [i.id, i]));

export const itemsFor = (template: Template, category: Category) =>
  WARDROBE.filter((i) => i.category === category && i.compatibleTemplates.includes(template));

/** Why a piece can't be worn yet, or undefined if it can. */
export function lockOf(item: { unlock?: Unlock }, owned: string[], hasStylePack: boolean): Unlock | undefined {
  const u = item.unlock;
  if (!u) return undefined;
  if (u.kind === 'stylePack') return hasStylePack ? undefined : u;
  return owned.includes(u.key) ? undefined : u;
}

/* ── Expressions ─────────────────────────────────────── */

/** The eight YunaVerse faces kids can pick (each is a drawn face in data/paperArt.ts). */
export const EXPRESSIONS = ['happy', 'laughing', 'wink', 'surprised', 'sad', 'crying', 'grumpy', 'silly'] as const;
export type ExpressionId = (typeof EXPRESSIONS)[number];
export const EXPRESSION_ICON: Record<ExpressionId, string> = {
  happy: '🙂', laughing: '😄', wink: '😉', surprised: '😮', sad: '🙁', crying: '😢', grumpy: '😠', silly: '😜',
};
export const isExpression = (v: unknown): v is ExpressionId => typeof v === 'string' && (EXPRESSIONS as readonly string[]).includes(v) && !!PAPER_FACES[v];

/* ── Job outfits: one tap puts on every piece ─────────── */

export interface OutfitPreset {
  id: string;
  label: string;
  icon: string;
  /** Pieces per body. A body with no entry has no art for this job yet, so the preset is hidden for it. */
  pieces: Partial<Record<Template, Partial<Pick<PaperLook, 'top' | 'bottom' | 'shoes'>>>>;
}
export const CAREER_PRESETS: OutfitPreset[] = [
  { id: 'doctor', label: 'Doctor', icon: '🩺', pieces: { preschool: { top: 'lab-coat', bottom: 'cargo-pants', shoes: 'gray-sneakers' } } },
  { id: 'engineer', label: 'Engineer', icon: '🔧', pieces: { preschool: { top: 'safety-vest', bottom: 'cargo-pants', shoes: 'black-boots' } } },
  { id: 'lawyer', label: 'Lawyer', icon: '⚖️', pieces: {
    preschool: { top: 'suit-jacket', bottom: 'plaid-skirt', shoes: 'loafers' },
    adult: { top: 'judge-suit', bottom: 'gray-trousers', shoes: 'black-shoes' } } },
  { id: 'chef', label: 'Chef', icon: '👩‍🍳', pieces: { adult: { top: 'chef-coat', bottom: 'blue-jeans', shoes: 'white-clogs' } } },
  { id: 'taekwondo', label: 'Taekwondo', icon: '🥋', pieces: { kid: { top: 'taekwondo-uniform', bottom: null, shoes: null }, preschool: { top: 'taekwondo-uniform', bottom: null, shoes: null } } },
];
/** Jobs whose outfit has art for this body (and whose pieces all exist). */
export const presetsFor = (template: Template) => CAREER_PRESETS.filter((p) => {
  const set = p.pieces[template];
  return !!set && Object.values(set).every((ref) => ref === null || ref === undefined || !!PAPER_CLOTHES[ref]);
});
/** Jobs with no art yet for a body: reported as missing artwork. */
export const missingPresetArt = () => CAREER_PRESETS.flatMap((p) => TEMPLATES.filter((t) => !p.pieces[t]).map((t) => `${p.label} outfit for the ${t} body`));

/* ── Defaults ─────────────────────────────────────────── */

/** The look Reset goes back to: the family's own outfits, or the look the character was made with. */
export function defaultLookOf(c: { id: string; sprite?: string; paper?: PaperLook; paperDefault?: PaperLook }): PaperLook | undefined {
  const fam = (c.sprite ? FAMILY_PAPER[c.sprite] : undefined) ?? STYLE_PACK_FRIENDS.find((f) => f.id === c.id)?.paper;
  const d = fam ?? c.paperDefault ?? c.paper;
  return d ? { ...d, acc: { ...(d.acc ?? {}) } } : undefined;
}

export const bodyExists = (t: string): t is Template => !!PAPER_BASES[t as Template];
