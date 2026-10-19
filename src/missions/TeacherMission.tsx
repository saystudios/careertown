import { useMemo, useState } from 'react';
import { useGame } from '../engine/store';
import { Btn } from '../ui/kit';
import { MissionShell, Panel, Feedback } from './MissionShell';
import { QuizStep } from './QuizStep';
import { sfx } from '../engine/sfx';

const STEPS = ['Plan', 'Help', 'Check'];

/* 1. Plan the lesson: put Ms. Park's lesson in the right order. */
const LESSON = [
  { id: 'greet', icon: '👋', label: 'Say good morning to the class' },
  { id: 'goal', icon: '🎯', label: 'Tell everyone what we’ll learn today' },
  { id: 'show', icon: '🧑‍🏫', label: 'Show an example on the board' },
  { id: 'try', icon: '✏️', label: 'Let students try it themselves' },
  { id: 'check', icon: '✅', label: 'Check what everyone learned' },
];
function PlanStep({ onDone }: { onDone: () => void }) {
  const shuffled = useMemo(() => [...LESSON].sort(() => Math.random() - 0.5), []);
  const [done, setDone] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const pick = (id: string) => {
    if (done.includes(id) || done.length === LESSON.length) return;
    if (LESSON[done.length].id !== id) {
      sfx('fail');
      setMsg({ ok: false, text: `Hmm, is “${LESSON.find((p) => p.id === id)!.label.toLowerCase()}” next? Think about what students need to know first.` });
      return;
    }
    const next = [...done, id]; setDone(next); sfx('pop'); setMsg(null);
    if (next.length === LESSON.length) {
      sfx('success');
      setMsg({ ok: true, text: 'A great lesson plan! 📋 Teachers show how first, then let students practise, then check how it went.' });
    }
  };
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Plan today’s lesson with Ms. Park</h2>
      <p className="font-body text-ink text-lg mt-1">Teachers plan every lesson before class starts. Tap the steps in order, from first to last.</p>
      <div className="mt-3 rounded-2xl border-[3px] border-ink bg-[#2F5D46] px-4 py-3 font-display font-bold text-white text-lg" style={{ minHeight: 72 }}>
        {done.length === 0 ? 'Lesson plan: Adding numbers' : done.map((d, i) => `${i + 1}. ${LESSON.find((p) => p.id === d)!.icon}`).join('   ')}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {shuffled.map((p) => (
          <button key={p.id} onClick={() => pick(p.id)} disabled={done.includes(p.id)}
            className={`rounded-2xl border-[3px] border-ink px-3 min-h-14 py-2 font-display font-bold text-ink text-left flex items-center gap-2 ${done.includes(p.id) ? 'bg-mint' : 'bg-white'}`}>
            <span style={{ fontSize: 26 }}>{p.icon}</span>{p.label}{done.includes(p.id) && <span style={{ marginLeft: 'auto' }}>#{done.indexOf(p.id) + 1}</span>}
          </button>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {done.length === LESSON.length && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Next: help your students →</Btn></div>}
    </Panel>
  );
}

/* 2. Help students: pick the most helpful thing a teacher could say. */
const HELP = [
  { icon: '🙋', text: 'Mia is stuck on 3 + 4. What do you say?',
    options: [{ label: '“Let’s count it together on our fingers.”', ok: true }, { label: '“It’s 7. Next!”', ok: false }, { label: '“You should know this.”', ok: false }],
    why: 'Good teachers help students find the answer themselves, so they can do it next time too.' },
  { icon: '😟', text: 'Leo got an answer wrong and looks sad.',
    options: [{ label: '“Mistakes help our brains grow. Let’s look again.”', ok: true }, { label: '“That’s wrong.”', ok: false }, { label: 'Pretend you didn’t see', ok: false }],
    why: 'Everyone makes mistakes when they learn. Kind words help students keep trying.' },
  { icon: '🤫', text: 'Ava is too shy to ask a question in front of everyone.',
    options: [{ label: 'Quietly ask her one-on-one if she needs help', ok: true }, { label: 'Ask her loudly in front of the class', ok: false }, { label: 'Skip her', ok: false }],
    why: 'Teachers notice every student and find a way to help that feels safe.' },
  { icon: '🚀', text: 'Sam finished early and is bored.',
    options: [{ label: 'Give Sam a fun challenge problem', ok: true }, { label: 'Tell Sam to sit and wait', ok: false }, { label: 'Let Sam leave class', ok: false }],
    why: 'Teachers help every student learn at their own speed, even the fast ones.' },
  { icon: '🗣️', text: 'Two students both want to talk at once.',
    options: [{ label: '“Let’s take turns. Jo first, then Ben.”', ok: true }, { label: 'Only listen to the loudest one', ok: false }, { label: '“Nobody can talk today.”', ok: false }],
    why: 'Taking turns means everyone’s ideas get heard.' },
];

/* 3. Check the homework: mark each answer right or wrong. */
const SUMS: [number, number, number][] = [[2, 3, 5], [4, 4, 9], [6, 1, 7], [5, 3, 7], [8, 2, 10], [3, 6, 9]];
function CheckStep({ onDone }: { onDone: () => void }) {
  const [marks, setMarks] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const mark = (i: number, saysRight: boolean) => {
    if (i in marks) return;
    const [a, b, ans] = SUMS[i]; const right = a + b === ans;
    if (saysRight !== right) {
      sfx('fail');
      setMsg({ ok: false, text: `Check again: count ${a} and then ${b} more. Is it really ${ans}?` });
      return;
    }
    const next = { ...marks, [i]: right }; setMarks(next); sfx('pop');
    if (Object.keys(next).length === SUMS.length) {
      sfx('success');
      setMsg({ ok: true, text: 'All checked! ⭐ Now the class knows which ones to practise. Checking work helps teachers see what to teach next.' });
    } else setMsg(right ? { ok: true, text: `${a} + ${b} = ${a + b}. Correct!` } : { ok: true, text: `Good catch! ${a} + ${b} = ${a + b}, not ${ans}. You can help them fix it.` });
  };
  const all = Object.keys(marks).length === SUMS.length;
  return (
    <Panel>
      <h2 className="font-display text-2xl font-bold text-ink">Check the homework</h2>
      <p className="font-body text-ink text-lg mt-1">Ms. Park’s class did some adding at home. Is each answer right ✅ or does it need fixing ❌?</p>
      <div className="grid sm:grid-cols-2 gap-2 mt-3">
        {SUMS.map(([a, b, ans], i) => (
          <div key={i} className={`rounded-2xl border-[3px] border-ink px-3 py-2 flex items-center gap-2 ${i in marks ? (marks[i] ? 'bg-mint' : 'bg-[#FFE0E8]') : 'bg-white'}`}>
            <span className="font-display font-bold text-ink text-2xl flex-1">{a} + {b} = {ans}
              {i in marks && !marks[i] && <span className="ml-2 text-lg">→ {a + b}</span>}
            </span>
            {i in marks ? <span style={{ fontSize: 28 }}>{marks[i] ? '✅' : '❌'}</span> : (
              <>
                <button aria-label={`${a} plus ${b} equals ${ans} is right`} onClick={() => mark(i, true)} className="h-12 w-12 rounded-xl border-[3px] border-ink bg-white text-2xl">✅</button>
                <button aria-label={`${a} plus ${b} equals ${ans} needs fixing`} onClick={() => mark(i, false)} className="h-12 w-12 rounded-xl border-[3px] border-ink bg-white text-2xl">❌</button>
              </>
            )}
          </div>
        ))}
      </div>
      {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
      {all && <div className="mt-3"><Btn tone="mint" onClick={onDone}>Finish →</Btn></div>}
    </Panel>
  );
}

export function TeacherMission({ onExit }: { onExit: () => void }) {
  const { dispatch } = useGame();
  const [step, setStep] = useState(0);
  return (
    <MissionShell id="teacher-day" step={step} steps={STEPS} onExit={onExit} color="#B8EBA0">
      {step === 0 && <PlanStep onDone={() => setStep(1)} />}
      {step === 1 && <QuizStep title="Help your students" intro="Every student learns differently. What would a great teacher do?" finish="Next: check the homework"
        items={HELP} onDone={() => setStep(2)} />}
      {step === 2 && <CheckStep onDone={() => { dispatch({ type: 'COMPLETE_MISSION', id: 'teacher-day' }); onExit(); }} />}
    </MissionShell>
  );
}
