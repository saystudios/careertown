import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CharacterData, PaperLook } from '../engine/types';
import { useGame } from '../engine/store';
import { useOwned } from '../engine/iap';
import { sfx } from '../engine/sfx';
import { STYLE_PACK } from '../data/stylePack';
import { PAPER_BASES, PAPER_CLOTHES, PAPER_HAIR_COLOURS } from '../data/paperArt';
import {
  EXPRESSIONS, EXPRESSION_ICON, WARDROBE, itemsFor, lockOf, presetsFor, defaultLookOf, isExpression,
  type Category, type ExpressionId, type OutfitPreset, type Unlock, type WardrobeItem,
} from '../data/wardrobe';
import { addSavedLook, applyPreset, isPresetWorn, isWorn, presetRefs, removeSavedLook, sameLook, toggle } from '../engine/outfit';
import { PaperArt, PaperFaceIcon } from '../components/Paper';
import { Person } from '../components/Person';
import { DollEditor } from '../components/DollEditor';
import { PetCloset } from '../components/PetCloset';
import { Btn, Face, Modal } from '../ui/kit';

type Tab = Category | 'jobs' | 'looks';
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'hair', icon: '💇', label: 'Hair' },
  { id: 'top', icon: '👕', label: 'Tops' },
  { id: 'bottom', icon: '👖', label: 'Bottoms' },
  { id: 'dress', icon: '👗', label: 'Dresses' },
  { id: 'shoes', icon: '👟', label: 'Shoes' },
  { id: 'accessory', icon: '🎀', label: 'Extras' },
  { id: 'jobs', icon: '💼', label: 'Jobs' },
  { id: 'looks', icon: '♥', label: 'My looks' },
];
const COLOUR_LABELS: Record<string, string> = { black: 'Black', darkbrown: 'Dark brown', brown: 'Brown', blonde: 'Blonde', ginger: 'Ginger', pink: 'Pink' };
const EXPRESSION_LABEL: Record<ExpressionId, string> = { happy: 'Happy', laughing: 'Laughing', wink: 'Wink', surprised: 'Surprised', sad: 'Sad', crying: 'Crying', grumpy: 'Grumpy', silly: 'Silly' };

type Snapshot = { paper?: PaperLook; expression?: string };
const MAX_UNDO = 30;

/**
 * Dress-Up Studio: pick a family member, then change their hair, clothes, shoes, extras and face.
 * Every change is saved straight away (each character keeps their own look); Undo steps back,
 * Reset puts their usual outfit back on, and ♥ keeps the look to wear again later.
 */
export function DressUpStudio({ characterId, onBack, onEdit }: { characterId?: string; onBack: () => void; onEdit: (id?: string) => void }) {
  const { game, dispatch } = useGame();
  const [selId, setSelId] = useState(characterId ?? game.activeCharacterId ?? game.characters[0]?.id);
  const [tab, setTab] = useState<Tab>('hair');
  const [history, setHistory] = useState<Record<string, Snapshot[]>>({});
  const [pets, setPets] = useState(false);
  const [bump, setBump] = useState(0);
  const hasPack = useOwned(STYLE_PACK.productId);
  const c = game.characters.find((x) => x.id === selId) ?? game.characters[0];
  if (!c) return null;
  const p = c.paper;
  const undo = history[c.id] ?? [];

  /** Save a change for this character, remembering the old look for Undo. */
  const commit = (next: CharacterData, sound: 'pop' | 'sparkle' | 'success' = 'pop') => {
    setHistory((h) => ({ ...h, [c.id]: [...(h[c.id] ?? []), { paper: c.paper, expression: c.expression }].slice(-MAX_UNDO) }));
    dispatch({ type: 'SAVE_CHARACTER', character: next });
    dispatch({ type: 'EVENT', name: 'dress' });
    setBump((b) => b + 1);
    sfx(sound);
  };
  const setLook = (paper: PaperLook, sound?: 'pop' | 'sparkle' | 'success') => { if (!sameLook(paper, p)) commit({ ...c, paper }, sound); };
  const doUndo = () => {
    const last = undo[undo.length - 1]; if (!last) return;
    setHistory((h) => ({ ...h, [c.id]: undo.slice(0, -1) }));
    dispatch({ type: 'SAVE_CHARACTER', character: { ...c, paper: last.paper, expression: last.expression } });
    setBump((b) => b + 1); sfx('whoosh');
  };
  const doReset = () => {
    const d = defaultLookOf(c);
    if (d && (!sameLook(d, p) || c.expression)) commit({ ...c, paper: d, expression: undefined }, 'sparkle');
  };
  const saveLook = () => {
    if (!p) return;
    commit(addSavedLook(c), 'success');
    dispatch({ type: 'TOAST', text: `${c.name}’s look is saved in ♥ My looks!` });
  };
  const pick = (id: string) => { if (id === c.id) return; sfx('tap'); setSelId(id); dispatch({ type: 'SET_ACTIVE', id }); };
  const hint = (u: Unlock) => dispatch({ type: 'TOAST', text: u.kind === 'stylePack' ? 'Part of the Style Pack. Ask a grown-up to look in the Shop 🛍️' : `Finish “${u.mission}” to unlock this!` });

  return (
    <div className="ds" role="main" aria-label="Dress-Up Studio">
      <header className="ds-top">
        <Btn tone="white" onClick={onBack} aria-label="Back" className="ds-back">⬅<span className="ds-hide-sm">Back</span></Btn>
        <h1 className="ds-title"><span aria-hidden>👗</span> {c.name}</h1>
        <div className="ds-top-right">
          {game.pets.length > 0 && <Btn tone="mint" onClick={() => setPets(true)} aria-label="Pet closet">🐾<span className="ds-hide-sm">Pets</span></Btn>}
          <Btn tone="white" onClick={() => dispatch({ type: 'TOGGLE_SOUND' })} aria-label={game.settings.sound ? 'Sound on' : 'Sound off'} aria-pressed={game.settings.sound}>{game.settings.sound ? '🔊' : '🔇'}</Btn>
        </div>
      </header>

      <div className="ds-body">
        {/* who is getting dressed */}
        <nav className="ds-rail" aria-label="Characters">
          {game.characters.map((x) => (
            <button key={x.id} className={`ds-person ${x.id === c.id ? 'on' : ''}`} onClick={() => pick(x.id)} aria-label={`Dress ${x.name}`} aria-pressed={x.id === c.id}>
              <Face c={x} size={56} />
              <span>{x.name}</span>
            </button>
          ))}
          {game.characters.length < 10 && <button className="ds-person ds-new" onClick={() => { sfx('pop'); onEdit(undefined); }} aria-label="Make a new friend"><span className="ds-plus">+</span><span>New</span></button>}
        </nav>

        {/* the big mirror */}
        <section className="ds-stage" aria-label={`${c.name} preview`}>
          <div className="ds-mirror">
            <div className="ds-floor" aria-hidden />
            <Fit aspect={p ? PAPER_BASES[p.base].canvas[2] / PAPER_BASES[p.base].canvas[3] : 0.46}>
              <div key={bump} className="ds-char">
                <div className="ds-idle">{p ? <PaperArt p={p} face={isExpression(c.expression) ? c.expression : 'happy'} /> : <Person c={c} mood="normal" />}</div>
              </div>
            </Fit>
            <Btn tone="white" className="ds-edit" onClick={() => onEdit(c.id)} aria-label={`Change ${c.name}’s name, skin and body`}>✏️</Btn>
          </div>
          <div className="ds-faces" role="group" aria-label="Faces">
            {EXPRESSIONS.map((e) => {
              const on = (isExpression(c.expression) ? c.expression : 'happy') === e;
              return (
                <button key={e} className={`ds-face ${on ? 'on' : ''}`} aria-label={EXPRESSION_LABEL[e]} aria-pressed={on} title={EXPRESSION_LABEL[e]}
                  onClick={() => { if (!on) commit({ ...c, expression: e === 'happy' ? undefined : e }, 'sparkle'); }}>{EXPRESSION_ICON[e]}</button>
              );
            })}
          </div>
          <div className="ds-actions">
            <Btn tone="white" onClick={doUndo} disabled={!undo.length} aria-label="Undo">↶<span className="ds-hide-sm">Undo</span></Btn>
            <Btn tone="sky" onClick={doReset} aria-label="Reset to usual outfit">⟲<span className="ds-hide-sm">Reset</span></Btn>
            {p && <Btn tone="berry" onClick={saveLook} aria-label="Save this look">♥<span className="ds-hide-sm">Save look</span></Btn>}
          </div>
        </section>

        {/* the wardrobe */}
        <section className="ds-panel" aria-label="Wardrobe">
          {p ? <>
            <div className="ds-tabs" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={`ds-tab ${tab === t.id ? 'on' : ''}`} onClick={() => { sfx('tap'); setTab(t.id); }}>
                  <span className="ds-tab-icon" aria-hidden>{t.icon}</span><span className="ds-tab-label">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="ds-grid-wrap">
              <Wardrobe tab={tab} c={c} p={p} owned={game.owned} hasPack={hasPack} onLook={setLook} onHint={hint}
                onRemoveLook={(i) => commit(removeSavedLook(c, i))} />
            </div>
          </> : (
            <div className="ds-grid-wrap">
              <p className="font-body text-ink mb-2">{c.name} is drawn in the older style. Their clothes are here:</p>
              {c.doll && <DollEditor d={c.doll} onChange={(doll) => commit({ ...c, doll })} />}
            </div>
          )}
        </section>
      </div>

      {pets && <Modal title="Pet closet" onClose={() => setPets(false)}><PetCloset /></Modal>}
    </div>
  );
}

/** The grid of pictures for one tab. */
function Wardrobe({ tab, c, p, owned, hasPack, onLook, onHint, onRemoveLook }: {
  tab: Tab; c: CharacterData; p: PaperLook; owned: string[]; hasPack: boolean;
  onLook: (p: PaperLook, sound?: 'pop' | 'sparkle' | 'success') => void; onHint: (u: Unlock) => void;
  onRemoveLook: (i: number) => void;
}) {
  const items = useMemo(() => (tab === 'jobs' || tab === 'looks' ? [] : itemsFor(p.base, tab)), [tab, p.base]);

  if (tab === 'jobs') {
    const presets = presetsFor(p.base);
    return (
      <>
        <div className="ds-grid ds-grid-tall">
          {presets.map((pr) => <JobTile key={pr.id} pr={pr} p={p} owned={owned} hasPack={hasPack} onLook={onLook} onHint={onHint} />)}
        </div>
        {presets.length === 0 && <Empty icon="💼" text="Job outfits for this body are coming soon!" />}
        <p className="ds-note">Finish missions around town to unlock more job outfits.</p>
      </>
    );
  }

  if (tab === 'looks') {
    const looks = c.looks ?? [];
    return looks.length ? (
      <div className="ds-grid ds-grid-tall">
        {looks.map((l, i) => {
          const on = sameLook(l, p);
          return (
            <div key={i} className="ds-tile-wrap">
              <button className={`ds-tile ds-tile-tall ${on ? 'on' : ''}`} aria-label={`Wear saved look ${i + 1}`} aria-pressed={on} onClick={() => onLook({ ...l, acc: { ...(l.acc ?? {}) } }, 'sparkle')}>
                <MiniDoll p={l} />
              </button>
              <button className="ds-remove" aria-label={`Delete saved look ${i + 1}`} onClick={() => onRemoveLook(i)}>✕</button>
            </div>
          );
        })}
      </div>
    ) : <Empty icon="♥" text="Tap ♥ Save look to keep an outfit here." />;
  }

  return (
    <>
      <div className="ds-grid">
        {items.map((it) => <ItemTile key={it.id} it={it} p={p} owned={owned} hasPack={hasPack} onLook={onLook} onHint={onHint} />)}
      </div>
      {items.length === 0 && <Empty icon="🧺" text="Nothing here for this body yet." />}
      {tab === 'hair' && (
        <div className="ds-swatches" role="group" aria-label="Hair color">
          {Object.entries(PAPER_HAIR_COLOURS).map(([id, hex]) => (
            <button key={id} className={`ds-swatch ${p.hairColor === id ? 'on' : ''}`} style={{ background: hex }} aria-label={`Hair color ${COLOUR_LABELS[id] ?? id}`} aria-pressed={p.hairColor === id}
              onClick={() => onLook({ ...p, hairColor: id })} />
          ))}
        </div>
      )}
    </>
  );
}

function ItemTile({ it, p, owned, hasPack, onLook, onHint }: { it: WardrobeItem; p: PaperLook; owned: string[]; hasPack: boolean; onLook: (p: PaperLook) => void; onHint: (u: Unlock) => void }) {
  const lock = lockOf(it, owned, hasPack);
  const on = isWorn(p, it);
  const art = it.category === 'hair'
    ? <PaperFaceIcon p={{ ...p, hair: it.ref, acc: {} }} size={76} />
    : it.thumb ? <img src={it.thumb} alt="" draggable={false} loading="lazy" decoding="async" /> : null;
  if (!art) return null;   // no picture: don't offer it
  return (
    <button className={`ds-tile ${on ? 'on' : ''} ${lock ? 'locked' : ''}`} aria-pressed={on}
      aria-label={lock ? `${it.label}, locked` : on && it.category !== 'hair' ? `${it.label}, tap to take off` : it.label} title={it.label}
      onClick={() => (lock ? (sfx('fail'), onHint(lock)) : onLook(toggle(p, it)))}>
      <span className="ds-tile-art">{art}</span>
      {lock && <span className="ds-lock" aria-hidden>🔒</span>}
      {on && <span className="ds-check" aria-hidden>✓</span>}
    </button>
  );
}

function JobTile({ pr, p, owned, hasPack, onLook, onHint }: { pr: OutfitPreset; p: PaperLook; owned: string[]; hasPack: boolean; onLook: (p: PaperLook, s?: 'success') => void; onHint: (u: Unlock) => void }) {
  const lock = presetRefs(pr, p.base).map((ref) => WARDROBE.find((w) => w.ref === ref && PAPER_CLOTHES[ref])).map((w) => (w ? lockOf(w, owned, hasPack) : undefined)).find(Boolean);
  const on = isPresetWorn(p, pr);
  return (
    <button className={`ds-tile ds-tile-tall ${on ? 'on' : ''} ${lock ? 'locked' : ''}`} aria-pressed={on} aria-label={lock ? `${pr.label} outfit, locked` : `${pr.label} outfit`}
      onClick={() => (lock ? (sfx('fail'), onHint(lock)) : onLook(applyPreset(p, pr), 'success'))}>
      <MiniDoll p={applyPreset(p, pr)} />
      <span className="ds-job-label"><span aria-hidden>{pr.icon}</span> {pr.label}</span>
      {lock && <span className="ds-lock" aria-hidden>🔒</span>}
    </button>
  );
}

function MiniDoll({ p }: { p: PaperLook }) {
  const cv = PAPER_BASES[p.base].canvas;
  return <span className="ds-mini" style={{ aspectRatio: `${cv[2]} / ${cv[3]}` }}><PaperArt p={p} /></span>;
}

function Empty({ icon, text }: { icon: string; text: ReactNode }) {
  return <div className="ds-empty"><div className="ds-empty-icon" aria-hidden>{icon}</div><p>{text}</p></div>;
}

/**
 * Sizes the character as large as the mirror allows without stretching or clipping:
 * at most 86% of its height and 90% of its width, always at the body's own proportions.
 */
function Fit({ aspect, children }: { aspect: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => {
      const W = el.clientWidth * 0.9, H = el.clientHeight * 0.86;   // headroom: tall ponytails reach above the body's box
      const h = Math.min(H, W / aspect);
      setBox((b) => (b && Math.abs(b.h - h) < 0.5 ? b : { w: h * aspect, h }));
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : undefined;
    ro?.observe(el); window.addEventListener('resize', measure);
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, [aspect]);
  return (
    <div ref={ref} className="ds-fit">
      {box && <div style={{ width: box.w, height: box.h, position: 'relative', marginBottom: '3%' }}>{children}</div>}
    </div>
  );
}
