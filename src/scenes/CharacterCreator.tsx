import { useState } from 'react';
import type { CharacterData, GameState, Look } from '../engine/types';
import { useGame } from '../engine/store';
import { BUILDS, ACCESSORIES, BOTTOMS, CLOTH_COLORS, EYES, FACES, GLASSES, HAIRS, HAIR_COLORS, HATS, SKIN_TONES, TOPS, wardrobeKey, type WardrobeOption } from '../data/catalog';
import { MISSIONS } from '../data/missions';
import { CharacterArt } from '../components/art/Character';
import { Btn, Face, HeadCrop } from '../ui/kit';
import { Person, LayeredArt } from '../components/Person';
import { ClothesPicker } from '../components/ClothesPicker';
import { DollEditor } from '../components/DollEditor';
import { PaperEditor } from '../components/PaperEditor';
import { DEFAULT_DOLL } from '../data/dollLooks';
import { LAYERED } from '../data/sprites';
import { uid } from '../engine/ids';
import { sfx } from '../engine/sfx';

type Slot = 'build' | 'face' | 'eyes' | 'hair' | 'top' | 'bottom' | 'glasses' | 'hat' | 'accessory';
const OPTIONS: Record<Slot, WardrobeOption<string>[]> = { build: BUILDS, face: FACES, eyes: EYES, hair: HAIRS, top: TOPS, bottom: BOTTOMS, glasses: GLASSES, hat: HATS, accessory: ACCESSORIES };

export function unlocked(game: GameState, slot: string, o: WardrobeOption<string>) {
  return !o.unlock || game.owned.includes(wardrobeKey(slot, o.id));
}
function lockHint(o: WardrobeOption<string>) {
  if (o.unlock?.mission) return `Finish “${MISSIONS[o.unlock.mission].title}”`;
  if (o.unlock?.shop) return `In the shop`;
  return 'Find a secret around town';
}

type Tab = { id: string; label: string; icon: string; slots: Slot[]; color?: keyof Look; palette?: string[] };
const TABS: Tab[] = [
  { id: 'body', label: 'Face', icon: '🙂', slots: ['build', 'face', 'eyes'], color: 'skin', palette: SKIN_TONES },
  { id: 'hair', label: 'Hair', icon: '💇', slots: ['hair'], color: 'hairColor', palette: HAIR_COLORS },
  { id: 'top', label: 'Tops', icon: '👕', slots: ['top'], color: 'topColor', palette: CLOTH_COLORS },
  { id: 'bottom', label: 'Bottoms', icon: '👖', slots: ['bottom'], color: 'bottomColor', palette: CLOTH_COLORS },
  { id: 'extras', label: 'Extras', icon: '🎩', slots: ['hat', 'glasses', 'accessory'], color: 'shoes', palette: CLOTH_COLORS },
];
const CLOTHES_TABS = ['hair', 'top', 'bottom', 'extras'];
const SLOT_LABEL: Record<Slot, string> = { build: 'Body type', face: 'Face shape', eyes: 'Eyes', hair: 'Hairstyle', top: 'Top', bottom: 'Bottom', glasses: 'Glasses', hat: 'Hat', accessory: 'Accessory' };

export function LookEditor({ look, onChange, clothesOnly = false, age = 'child' }: { look: Look; onChange: (l: Look) => void; clothesOnly?: boolean; age?: 'child' | 'adult' }) {
  const { game } = useGame();
  const tabs = clothesOnly ? TABS.filter((t) => CLOTHES_TABS.includes(t.id)) : TABS;
  const [tab, setTab] = useState(tabs[0].id);
  const [hint, setHint] = useState<string>();
  const t = tabs.find((x) => x.id === tab)!;
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((x) => (
          <button key={x.id} onClick={() => { sfx('tap'); setTab(x.id); setHint(undefined); }}
            className={`shrink-0 rounded-2xl border-[3px] border-ink px-3 h-12 font-display font-bold text-ink shadow-chunkysm ${x.id === tab ? 'bg-sun' : 'bg-white'}`}>
            <span className="mr-1">{x.icon}</span>{x.label}
          </button>
        ))}
      </div>
      {t.slots.map((slot) => (
        <div key={slot} className="mt-2">
          <div className="font-display font-bold text-ink mb-1">{SLOT_LABEL[slot]}</div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {OPTIONS[slot].map((o) => {
              const ok = unlocked(game, slot, o);
              const sel = (look[slot] ?? 'average') === o.id;
              const preview = { ...look, [slot]: o.id } as Look;
              return (
                <button key={o.id} aria-label={o.label}
                  onClick={() => { if (!ok) { sfx('fail'); setHint(`${o.label}: ${lockHint(o)}`); return; } sfx('pop'); onChange(preview); }}
                  className={`relative rounded-2xl border-[3px] border-ink overflow-hidden h-20 sm:h-24 ${sel ? 'bg-sun ring-4 ring-berry' : 'bg-sky/25'} ${ok ? '' : 'opacity-60'}`}>
                  {['top', 'bottom', 'build'].includes(slot)
                    ? <div className="absolute inset-x-1 top-1 bottom-4"><CharacterArt look={preview} age={age} /></div>
                    : <div className="absolute left-1/2 -translate-x-1/2 top-0"><HeadCrop look={preview} age={age} size={84} /></div>}
                  <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[11px] font-body text-ink truncate px-1">{o.label}</span>
                  {!ok && <span className="absolute top-1 right-1 text-lg">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {hint && <p className="mt-2 rounded-xl bg-lilac/20 border-2 border-ink px-3 py-2 font-body text-ink">🔒 {hint}</p>}
      {t.color && t.palette && (
        <div className="mt-3">
          <div className="font-display font-bold text-ink mb-1">{t.id === 'body' ? 'Skin tone' : t.id === 'extras' ? 'Shoe color' : 'Color'}</div>
          <div className="flex flex-wrap gap-2">
            {t.palette.map((c) => (
              <button key={c} aria-label={`Color ${c}`} onClick={() => { sfx('pop'); onChange({ ...look, [t.color!]: c }); }}
                className={`w-11 h-11 rounded-full border-[3px] border-ink ${look[t.color!] === c ? 'ring-4 ring-berry scale-110' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const NEW_LOOK: Look = {
  skin: '#E8AE7E', face: 'round', eyes: 'dot', hair: 'bob', hairColor: '#5B3A21', top: 'tee', topColor: '#7FD3F7',
  bottom: 'pants', bottomColor: '#A98BFF', shoes: '#FF5D8F', glasses: 'none', hat: 'none', accessory: 'none',
};

function newDoll(): CharacterData {
  // New characters are YunaVerse characters (the older vector look stays for existing ones).
  return { id: uid('c'), name: 'New friend', age: 'child', look: NEW_LOOK, sprite: 'paper-kid', doll: { ...DEFAULT_DOLL },
    paper: { base: 'kid', tone: Math.floor(Math.random() * 4), hair: 'wavy', hairColor: 'darkbrown', top: 'pink-hoodie', bottom: 'baggy-jeans', shoes: 'gray-sneakers', acc: {} } };
}

/** Pass as editId to start the character maker on a brand-new friend. */
export const NEW_CHARACTER = '__new';

export function CharacterCreator({ editId, onDone }: { editId?: string; onDone: () => void }) {
  const { game, dispatch } = useGame();
  const start = editId === NEW_CHARACTER ? undefined : game.characters.find((c) => c.id === (editId ?? game.activeCharacterId)) ?? game.characters[0];
  const [draft, setDraft] = useState<CharacterData>(() => start ?? newDoll());
  const isNew = !game.characters.some((c) => c.id === draft.id);

  const save = () => {
    dispatch({ type: 'SAVE_CHARACTER', character: { ...draft, name: draft.name.trim().slice(0, 12) || 'Friend' } });
    dispatch({ type: 'TOAST', text: `${draft.name || 'Friend'} is saved!` });
    sfx('success');
  };

  return (
    <div className="h-full overflow-auto p-3 sm:p-5">
      <div className="creator-grid mx-auto max-w-5xl grid md:grid-cols-[280px_1fr] gap-4">
        <div className="creator-side rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4 flex flex-col items-center md:sticky md:top-0 md:self-start">
          <div className="w-full flex gap-2 overflow-x-auto pb-2">
            {game.characters.map((c) => (
              <button key={c.id} onClick={() => { sfx('tap'); setDraft(c); }} aria-label={`Edit ${c.name}`} className={`rounded-full ${c.id === draft.id ? 'ring-4 ring-berry' : ''}`}><Face c={c} size={48} /></button>
            ))}
            {game.characters.length < 10 && (
              <button onClick={() => { sfx('pop'); setDraft(newDoll()); }}
                className="w-12 h-12 shrink-0 rounded-full border-[3px] border-dashed border-ink bg-mint font-display text-2xl text-ink" aria-label="New character">+</button>
            )}
          </div>
          <div className="creator-stage relative w-full aspect-[3/4] rounded-[22px] border-[3px] border-ink bg-sky/30 mt-2 flex items-end justify-center overflow-hidden">
            <div className="absolute bottom-0 inset-x-0 h-[18%] bg-grass border-t-[3px] border-ink" />
            <div className={`relative mb-[6%] ${draft.sprite ? 'w-[64%] h-[88%]' : draft.age === 'adult' ? 'w-[64%] h-[88%]' : 'w-[60%] h-[70%]'} idle-bob`}><Person c={draft} mood="happy" /></div>
          </div>
          <input value={draft.name} maxLength={12} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-label="Character name"
            className="mt-3 w-full rounded-2xl border-[3px] border-ink px-3 h-12 font-display text-xl text-ink text-center" />
          {!draft.sprite && <div className="mt-2 grid grid-cols-2 gap-2 w-full">
            {(['child', 'adult'] as const).map((a) => (
              <button key={a} onClick={() => { sfx('tap'); setDraft({ ...draft, age: a }); }}
                className={`rounded-2xl border-[3px] border-ink h-12 font-display font-bold text-ink ${draft.age === a ? 'bg-sun' : 'bg-white'}`}>{a === 'child' ? '🧒 Kid' : '🧑 Grown-up'}</button>
            ))}
          </div>}
          <div className="mt-3 flex gap-2 w-full">
            <Btn tone="mint" className="flex-1 text-lg" onClick={save}>{isNew ? 'Create' : 'Save'}</Btn>
            {!isNew && game.characters.length > 1 && (
              <Btn tone="white" aria-label="Delete character" onClick={() => { dispatch({ type: 'DELETE_CHARACTER', id: draft.id }); setDraft(game.characters.find((c) => c.id !== draft.id)!); }}>🗑️</Btn>
            )}
          </div>
          <Btn tone="sky" className="mt-2 w-full" onClick={() => { if (!isNew) save(); onDone(); }}>Done</Btn>
        </div>
        <div className="rounded-[28px] border-[4px] border-ink bg-white shadow-chunky p-4">
          {draft.paper ? <div className="p-2"><PaperEditor p={draft.paper} lockBase={!!draft.sprite && !draft.sprite.startsWith('paper-')}
            onChange={(paper) => setDraft({ ...draft, paper, sprite: draft.sprite?.startsWith('paper-') ? `paper-${paper.base}` : draft.sprite })} /></div>
          : draft.doll ? <div className="p-2"><DollEditor d={draft.doll} onChange={(doll) => setDraft({ ...draft, doll })} /></div> : draft.sprite && LAYERED[draft.sprite] ? <div className="p-2"><ClothesPicker preview={false} c={draft} onChange={(colors) => setDraft({ ...draft, colors })} /></div> : draft.sprite ? <div className="h-full grid place-items-center text-center p-6"><div><div className="text-5xl">🎨</div><p className="font-display text-2xl font-extrabold text-ink mt-2">{draft.name}’s look is hand-drawn artwork</p><p className="font-body text-ink mt-2 max-w-sm">Their outfit stays the same. Tap <b>+</b> to make a new character you can dress up any way you like.</p></div></div> : <LookEditor age={draft.age} look={draft.look} onChange={(look) => setDraft({ ...draft, look })} />}
        </div>
      </div>
    </div>
  );
}
