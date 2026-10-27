// Dress-Up Studio rules: outfits, conflicts, job outfits, expressions, missing art and body proportions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PaperLook } from '../src/engine/types';
import { WARDROBE, WARDROBE_BY_ID, TEMPLATES, EXPRESSIONS, CAREER_PRESETS, itemsFor, lockOf, presetsFor, defaultLookOf, isExpression } from '../src/data/wardrobe';
import { equip, unequip, toggle, toggleById, isWorn, applyPreset, isPresetWorn, presetRefs, sanitizeLook, addSavedLook, removeSavedLook, MAX_LOOKS, upgradeCharacter } from '../src/engine/outfit';
import { PAPER_BASES, PAPER_FACES, PAPER_CLOTHES } from '../src/data/paperArt';
import { FAMILY_PAPER } from '../src/data/dollLooks';

const yuna = (): PaperLook => ({ ...FAMILY_PAPER.yuna, acc: {} });
const nene = (): PaperLook => ({ ...FAMILY_PAPER.nene, acc: {} });
const mom = (): PaperLook => ({ ...FAMILY_PAPER.mom, acc: {} });
const item = (id: string) => { const it = WARDROBE_BY_ID[id]; assert.ok(it, `missing wardrobe item ${id}`); return it; };

test('1. outfit selection: picking a piece puts it on straight away', () => {
  let p = yuna();
  p = equip(p, item('hair:ponytail')); assert.equal(p.hair, 'ponytail');
  p = equip(p, item('top:dino-tee')); assert.equal(p.top, 'dino-tee');
  p = equip(p, item('bottom:plaid-skirt')); assert.equal(p.bottom, 'plaid-skirt');
  p = equip(p, item('shoes:pink-sneakers')); assert.equal(p.shoes, 'pink-sneakers');
  p = equip(p, item('acc:head:pink-cap')); assert.equal(p.acc?.head, 'pink-cap');
  p = equip(p, item('acc:eyes:heart-glasses')); assert.equal(p.acc?.eyes, 'heart-glasses');
  assert.equal(p.acc?.head, 'pink-cap', 'accessories in other spots stay on');
  assert.ok(isWorn(p, item('top:dino-tee')));
});

test('2. conflicts: dresses replace tops and bottoms, and the other way round', () => {
  let p = equip(yuna(), item('dress:fairy-dress'));
  assert.equal(p.top, 'fairy-dress'); assert.equal(p.bottom, null, 'a dress takes the bottoms off');
  p = equip(p, item('bottom:pink-leggings'));
  assert.equal(p.bottom, 'pink-leggings'); assert.equal(p.top, null, 'bottoms take a dress off');
  p = equip(p, item('top:rainbow-tee'));
  assert.equal(p.top, 'rainbow-tee'); assert.equal(p.bottom, 'pink-leggings', 'a normal top keeps the bottoms');
  // tapping what you wear takes it off; tapping your hairstyle keeps it
  assert.equal(toggle(p, item('top:rainbow-tee')).top, null);
  assert.equal(toggle(p, item('hair:wavy')).hair, 'wavy');
  assert.equal(unequip(p, item('acc:head:pink-cap')), p, 'taking off something not worn changes nothing');
  // a new cap replaces the old one in the same spot
  const caps = equip(equip(p, item('acc:head:pink-cap')), item('acc:head:cat-beanie'));
  assert.equal(caps.acc?.head, 'cat-beanie');
});

test('7. job outfits put on every piece, only for bodies with the art, and stay locked until earned', () => {
  const doctor = CAREER_PRESETS.find((x) => x.id === 'doctor')!;
  const n = applyPreset(nene(), doctor);
  assert.deepEqual([n.top, n.bottom, n.shoes], ['lab-coat', 'cargo-pants', 'gray-sneakers']);
  assert.equal(n.hair, nene().hair, 'hair stays'); assert.ok(isPresetWorn(n, doctor));
  assert.deepEqual(applyPreset(yuna(), doctor), yuna(), 'no doctor art for the kid body yet: nothing changes');
  assert.ok(!presetsFor('kid').some((x) => x.id === 'doctor'));
  assert.ok(presetsFor('adult').some((x) => x.id === 'chef'));
  // locks
  const lab = WARDROBE.find((w) => w.ref === 'lab-coat')!;
  assert.ok(lockOf(lab, [], false), 'lab coat locked before the doctor mission');
  assert.equal(lockOf(lab, ['wear:top:labcoat'], false), undefined, 'unlocked after');
  const pack = WARDROBE.find((w) => w.ref === 'denim-corset')!;
  assert.ok(lockOf(pack, [], false)); assert.equal(lockOf(pack, [], true), undefined);
  for (const pr of CAREER_PRESETS) for (const t of TEMPLATES) for (const ref of presetRefs(pr, t)) assert.ok(PAPER_CLOTHES[ref], `${pr.id}/${t}: ${ref} has art`);
  const tkd = applyPreset(yuna(), CAREER_PRESETS.find((x) => x.id === 'taekwondo')!);
  assert.equal(tkd.top, 'taekwondo-uniform'); assert.equal(tkd.bottom, null);
});

test('4. expressions: all eight faces are drawn, and an unknown face is cleared', () => {
  assert.equal(EXPRESSIONS.length, 8);
  for (const e of EXPRESSIONS) { assert.ok(PAPER_FACES[e], `face ${e} has art`); assert.ok(isExpression(e)); for (const t of TEMPLATES) assert.ok(PAPER_FACES[e].at[t], `${e} fits ${t}`); }
  assert.ok(!isExpression('dancing'));
  const c = upgradeCharacter({ id: 'x', name: 'X', age: 'child', look: {} as never, sprite: 'paper-kid', paper: yuna(), expression: 'dancing' });
  assert.equal(c.expression, undefined);
  const w = upgradeCharacter({ id: 'x', name: 'X', age: 'child', look: {} as never, sprite: 'paper-kid', paper: yuna(), expression: 'wink' });
  assert.equal(w.expression, 'wink');
  // changing the face never changes clothes or hair
  assert.deepEqual(w.paper, sanitizeLook(yuna()));
});

test('10. missing art: pieces without pictures are left out, unknown pieces are taken off', () => {
  for (const it of WARDROBE) if (it.category !== 'hair') assert.ok(it.thumb, `${it.id} has a picture`);
  const broken: PaperLook = { base: 'kid', tone: 9, hair: 'not-a-hair', hairColor: 'green', top: 'gone-top', bottom: 'mom-blue-jeans', shoes: 'red-sneakers', acc: { head: 'nope', bag: 'backpack' } };
  const s = sanitizeLook(broken);
  assert.equal(s.hair, null); assert.equal(s.top, null);
  assert.equal(s.bottom, null, 'grown-up jeans don\'t fit the kid body');
  assert.equal(s.shoes, 'red-sneakers', 'pieces that fit are kept');
  assert.deepEqual(s.acc, { bag: 'backpack' });
  assert.ok(s.tone >= 0 && s.tone < PAPER_BASES.kid.src.length);
  assert.ok(s.hairColor in { black: 1, darkbrown: 1, brown: 1, blonde: 1, ginger: 1, pink: 1 });
  assert.deepEqual(toggleById(yuna(), 'top:not-real'), yuna(), 'unknown ids change nothing');
  // grown-up clothes can't be put on a kid
  assert.deepEqual(equip(yuna(), item('top:chef-coat')), yuna());
});

test('11. proportions: every piece has its own placement on each body it fits, inside the 1024 x 1536 canvas', () => {
  for (const it of WARDROBE) {
    assert.ok(it.compatibleTemplates.length > 0, `${it.id} fits some body`);
    for (const t of it.compatibleTemplates) {
      const box = it.anchors[t]; assert.ok(box, `${it.id} placed on ${t}`);
      const [x, y, w, h] = box!;
      assert.ok(w > 0 && h > 0, `${it.id} on ${t} has a size`);
      assert.ok(x > -512 && y > -512 && x + w < 1536 && y + h < 2048, `${it.id} on ${t} is on the canvas`);
    }
  }
  // kids' clothes sit differently on the kid and the preschool body (no single shared offset)
  const jeans = item('bottom:baggy-jeans');
  assert.notDeepEqual(jeans.anchors.kid, jeans.anchors.preschool);
  // the three bodies keep their own proportions
  const ratio = (t: 'kid' | 'preschool' | 'adult') => (PAPER_BASES[t].feet - PAPER_BASES[t].crown) / (PAPER_BASES[t].neck - PAPER_BASES[t].crown);
  assert.ok(ratio('adult') > ratio('kid') && ratio('kid') > ratio('preschool'), 'grown-up tallest for their head, preschooler roundest');
  assert.ok(itemsFor('adult', 'top').every((i) => i.compatibleTemplates.includes('adult')));
  assert.ok(itemsFor('preschool', 'dress').some((i) => i.ref === 'bunny-dress'));
});

test('saved looks: newest first, no duplicates, at most six, can be deleted', () => {
  let c = { id: 'yuna', name: 'Yuna', age: 'child' as const, look: {} as never, sprite: 'yuna', paper: yuna() };
  c = addSavedLook(c); c = addSavedLook(c);
  assert.equal(c.looks!.length, 1, 'the same look is saved once');
  for (const ref of ['dino-tee', 'rainbow-tee', 'pink-hoodie', 'blue-hoodie', 'bear-sweater', 'jersey-23', 'ghost-hoodie']) c = addSavedLook({ ...c, paper: { ...c.paper, top: ref } });
  assert.equal(c.looks!.length, MAX_LOOKS); assert.equal(c.looks![0].top, 'ghost-hoodie');
  assert.equal(removeSavedLook(c, 0).looks!.length, MAX_LOOKS - 1);
  assert.deepEqual(defaultLookOf({ id: 'yuna', sprite: 'yuna', paper: c.paper }), { ...FAMILY_PAPER.yuna, acc: {} }, 'Reset goes back to Yuna\'s usual outfit');
  assert.deepEqual(defaultLookOf({ id: 'c1', paper: mom(), paperDefault: nene() }), nene(), 'made characters reset to the look they were made with');
});
