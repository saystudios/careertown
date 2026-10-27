// Game-level checks: switching characters, saving and loading, upgrading old saves, moving between rooms,
// movement limits and the career missions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { CharacterData, GameState } from '../src/engine/types';
import { reducer, freshGame, type Root } from '../src/engine/store';
import { migrate, SAVE_VERSION, localSave } from '../src/engine/save';
import { walkTarget, resolveDrop, type Lookup } from '../src/engine/interactions';
import { MISSIONS } from '../src/data/missions';
import { BUILDINGS } from '../src/data/buildings';
import { WARDROBE_BY_ID, lockOf } from '../src/data/wardrobe';
import { equip } from '../src/engine/outfit';

const root = (): Root => ({ game: freshGame(), queue: [] });
const get = (r: Root, id: string) => r.game.characters.find((c) => c.id === id)!;
const dress = (r: Root, id: string, itemId: string): Root => {
  const c = get(r, id);
  return reducer(r, { type: 'SAVE_CHARACTER', character: { ...c, paper: equip(c.paper!, WARDROBE_BY_ID[itemId]) } });
};

test('3. switching characters keeps everyone\'s own look', () => {
  let r = root();
  assert.ok(get(r, 'yuna').paper && get(r, 'natalie').paper, 'the family are YunaVerse characters');
  r = dress(r, 'yuna', 'dress:fairy-dress');
  r = reducer(r, { type: 'SAVE_CHARACTER', character: { ...get(r, 'yuna'), expression: 'wink' } });
  const natalieBefore = JSON.stringify(get(r, 'natalie'));
  r = reducer(r, { type: 'SET_ACTIVE', id: 'natalie' });
  r = dress(r, 'natalie', 'acc:head:pink-cap');
  r = reducer(r, { type: 'SET_ACTIVE', id: 'yuna' });
  assert.equal(get(r, 'yuna').paper!.top, 'fairy-dress');
  assert.equal(get(r, 'yuna').expression, 'wink');
  assert.equal(get(r, 'yuna').paper!.acc?.head, undefined, 'Natalie\'s cap is only on Natalie');
  assert.equal(get(r, 'natalie').paper!.acc?.head, 'pink-cap');
  assert.notEqual(JSON.stringify(get(r, 'natalie')), natalieBefore);
  assert.equal(r.game.activeCharacterId, 'yuna');
});

test('a new character remembers the look they were made with (for Reset)', () => {
  let r = root();
  const made: CharacterData = { id: 'c-new', name: 'Mia', age: 'child', look: {} as never, sprite: 'paper-kid', paper: { base: 'kid', tone: 1, hair: 'bob', hairColor: 'pink', top: 'dino-tee', bottom: 'blue-skirt', shoes: 'pink-sneakers', acc: {} } };
  r = reducer(r, { type: 'SAVE_CHARACTER', character: made });
  assert.deepEqual(get(r, 'c-new').paperDefault, made.paper);
  r = dress(r, 'c-new', 'top:rainbow-tee');
  assert.equal(get(r, 'c-new').paperDefault!.top, 'dino-tee', 'dressing up later doesn\'t change the default');
});

/** A tiny in-memory localStorage so the real save adapter can run. */
function fakeStorage() {
  const m = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null), setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k), clear: () => m.clear(), key: (i: number) => [...m.keys()][i] ?? null, get length() { return m.size; },
  } as Storage;
  return m;
}

test('5. save and restore: outfits, faces and saved looks come back after closing the app', async () => {
  fakeStorage();
  let r = root();
  r = dress(r, 'yuna', 'top:dino-tee');
  r = reducer(r, { type: 'SAVE_CHARACTER', character: { ...get(r, 'yuna'), expression: 'silly', looks: [get(r, 'yuna').paper!] } });
  await localSave.save('p1', r.game);
  const back = migrate((await localSave.load('p1'))!);
  const y = back.characters.find((c) => c.id === 'yuna')!;
  assert.equal(y.paper!.top, 'dino-tee'); assert.equal(y.expression, 'silly'); assert.equal(y.looks!.length, 1);
  assert.equal(back.version, SAVE_VERSION);
});

test('6. upgrading an older save keeps progress and makes looks safe', () => {
  const g = freshGame();
  const old = {
    ...g, version: 1, coins: 321, xp: 999, completedMissions: { 'doctor-checkup': 2 }, owned: [...g.owned, 'wear:top:labcoat'], stickers: ['rainbow'],
    characters: g.characters.map((c) => (c.id === 'yuna'
      ? { ...c, paper: { ...c.paper!, top: 'retired-top', acc: { head: 'pink-cap' } }, expression: 'dancing' }
      : c.id === 'nene' ? { ...c, paper: { ...c.paper!, top: 'lab-coat' } } : c)),
  } as unknown as GameState;
  const snapshot = JSON.stringify(old);
  const up = migrate(old);
  assert.equal(JSON.stringify(old), snapshot, 'the old save object is not changed in place');
  assert.equal(up.version, 2);
  assert.equal(up.coins, 321); assert.equal(up.xp, 999);
  assert.deepEqual(up.completedMissions, { 'doctor-checkup': 2 });
  assert.ok(up.owned.includes('wear:top:labcoat')); assert.deepEqual(up.stickers, ['rainbow']);
  assert.deepEqual(Object.keys(up.scenes).sort(), Object.keys(old.scenes).sort(), 'rooms are kept');
  const y = up.characters.find((c) => c.id === 'yuna')!;
  assert.equal(y.paper!.top, null, 'a piece that no longer exists is taken off');
  assert.equal(y.paper!.acc?.head, 'pink-cap', 'everything else is kept');
  assert.equal(y.expression, undefined);
  assert.equal(up.characters.find((c) => c.id === 'nene')!.paper!.top, 'lab-coat');
  assert.ok(y.paperDefault, 'gets a look to reset to');
  assert.equal(up.characters.length, old.characters.length);
  assert.equal(migrate(up), up, 'an up-to-date save is left alone');
});

test('9. room transitions: moving between rooms never touches the outfit', () => {
  let r = root();
  r = dress(r, 'yuna', 'acc:head:cat-beanie');
  r = reducer(r, { type: 'SAVE_CHARACTER', character: { ...get(r, 'yuna'), expression: 'grumpy' } });
  const look = JSON.stringify(get(r, 'yuna'));
  r = reducer(r, { type: 'PLACE_ACTOR', to: 'home-bedroom', entity: { id: 'char-yuna-2', kind: 'character', ref: 'yuna', x: 500, y: 650, pose: 'stand' } });
  r = reducer(r, { type: 'PLACE_ACTOR', to: 'hospital-exam', entity: { id: 'char-yuna-3', kind: 'character', ref: 'yuna', x: 400, y: 650, pose: 'stand' } });
  const where = Object.entries(r.game.scenes).filter(([, list]) => list!.some((e) => e.kind === 'character' && e.ref === 'yuna')).map(([id]) => id);
  assert.deepEqual(where, ['hospital-exam'], 'Yuna is in one room at a time');
  assert.equal(JSON.stringify(get(r, 'yuna')), look);
  r = reducer(r, { type: 'COMPLETE_MISSION', id: 'doctor-checkup' });
  assert.equal(JSON.stringify(get(r, 'yuna')), look, 'finishing a mission keeps the outfit');
});

test('8. movement stays on the floor and inside the room', () => {
  const horizon = 380;
  assert.deepEqual(walkTarget(500, 100, horizon), { x: 500, y: horizon + 60 }, 'tapping the wall walks to the bottom of the wall');
  assert.deepEqual(walkTarget(-200, 900, horizon), { x: 30, y: 695 }, 'tapping off the edge stops at the edge');
  assert.deepEqual(walkTarget(1500, 500, horizon, 0, 1200), { x: 1200, y: 500 });
  const look: Lookup = { character: () => ({ id: 'yuna', name: 'Yuna', age: 'child', look: {} as never, sprite: 'yuna' }), pet: () => undefined };
  const me = { id: 'char-yuna', kind: 'character' as const, ref: 'yuna', x: 500, y: 650, pose: 'stand' as const };
  const fx = resolveDrop(me, 500, 50, 500, 50, [me], look, horizon);
  const moved = fx.patches.find((p) => p.id === me.id)!.patch;
  assert.ok((moved.y ?? 0) >= horizon + 60, 'a character dropped on the wall lands on the floor');
  assert.ok((moved.y ?? 0) <= 695);
});

test('12. career missions: every mission still has a screen, a building and its unlocks', () => {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  for (const [id, m] of Object.entries(MISSIONS)) {
    assert.ok(app.includes(`'${id}':`), `mission ${id} is registered in App.tsx`);
    assert.ok(BUILDINGS.some((b) => b.id === m.building), `mission ${id} has a building`);
  }
  // finishing the doctor mission unlocks the lab coat for the wardrobe
  let r = root();
  const lab = WARDROBE_BY_ID['top:lab-coat'];
  assert.ok(lockOf(lab, r.game.owned, false));
  r = reducer(r, { type: 'COMPLETE_MISSION', id: 'doctor-checkup' });
  assert.equal(lockOf(lab, r.game.owned, false), undefined);
});
