// Tiny synthesized sound effects (WebAudio) — original, no audio files needed.
export type SfxName =
  | 'pop' | 'tap' | 'coin' | 'success' | 'fail' | 'bang' | 'ring' | 'munch' | 'splash'
  | 'sparkle' | 'whoosh' | 'click' | 'heartbeat' | 'beep' | 'tick' | 'snore' | 'crack' | 'notes';

let ctx: AudioContext | null = null;
let enabled = true;
export const setSoundEnabled = (on: boolean) => { enabled = on; };

/** The shared audio context (also used by the background music). */
export function audioCtx() { return ac(); }
function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state !== 'running') void ctx.resume().catch(() => {});
  return ctx;
}

/* iPhone/iPad: sound only starts after a touch, and by default the ringer's
   silent switch mutes web sound. Ask for "playback" audio (like a video app)
   and wake the audio up on the first touch, and again after coming back. */
function unlock() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession && nav.audioSession.type !== 'playback') nav.audioSession.type = 'playback';
  } catch { /* older iOS */ }
  const a = ac(); if (!a) return;
  try {
    const b = a.createBuffer(1, 1, 22050); const s = a.createBufferSource();
    s.buffer = b; s.connect(a.destination); s.start(0);
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') {
  for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, unlock, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx) void ctx.resume().catch(() => {}); });
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', when = 0, vol = 0.18, slideTo?: number) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + when;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.15, when = 0) {
  const a = ac(); if (!a) return;
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(); const g = a.createGain();
  s.buffer = buf; g.gain.value = vol; s.connect(g).connect(a.destination); s.start(a.currentTime + when);
}

export function sfx(name: SfxName) {
  if (!enabled) return;
  try {
    switch (name) {
      case 'pop': tone(520, 0.12, 'sine', 0, 0.2, 900); break;
      case 'tap': tone(700, 0.06, 'triangle', 0, 0.12); break;
      case 'click': tone(1200, 0.04, 'square', 0, 0.06); break;
      case 'coin': tone(988, 0.08, 'square', 0, 0.08); tone(1319, 0.2, 'square', 0.08, 0.08); break;
      case 'success': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.1, 0.16)); break;
      case 'fail': tone(330, 0.2, 'sawtooth', 0, 0.08, 220); tone(247, 0.3, 'sawtooth', 0.18, 0.08, 160); break;
      case 'bang': noise(0.12, 0.3); tone(140, 0.15, 'sine', 0, 0.3, 60); break;
      case 'ring': for (let i = 0; i < 6; i++) tone(1568, 0.06, 'square', i * 0.07, 0.06); break;
      case 'munch': noise(0.05, 0.12); noise(0.05, 0.12, 0.12); noise(0.05, 0.12, 0.24); break;
      case 'splash': noise(0.4, 0.12); tone(400, 0.3, 'sine', 0, 0.06, 900); break;
      case 'notes': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.13, 0.12)); break;
      case 'sparkle': [1568, 2093, 2637].forEach((f, i) => tone(f, 0.15, 'sine', i * 0.06, 0.08)); break;
      case 'whoosh': noise(0.3, 0.07); break;
      case 'heartbeat': tone(70, 0.12, 'sine', 0, 0.4); tone(65, 0.12, 'sine', 0.18, 0.35); break;
      case 'beep': tone(880, 0.08, 'square', 0, 0.06); tone(1175, 0.08, 'square', 0.1, 0.06); tone(988, 0.1, 'square', 0.2, 0.06); break;
      case 'tick': tone(2000, 0.02, 'square', 0, 0.06); break;
      case 'snore': tone(110, 0.5, 'sawtooth', 0, 0.04, 90); break;
      case 'crack': noise(0.25, 0.3); tone(90, 0.4, 'sawtooth', 0, 0.15, 40); break;
    }
  } catch { /* audio is optional */ }
}

/* ── Music for the K-pop Academy (same tiny synth, no audio files) ── */
export type Drum = 'kick' | 'clap' | 'hat';
/** A drum hit, `when` seconds from now. */
export function drum(kind: Drum, when = 0) {
  if (!enabled) return;
  try {
    if (kind === 'kick') tone(150, 0.18, 'sine', when, 0.45, 45);
    else if (kind === 'clap') { noise(0.09, 0.22, when); noise(0.06, 0.16, when + 0.02); }
    else noise(0.03, 0.08, when);
  } catch { /* no audio */ }
}
/** A musical note (Hz), `when` seconds from now. */
export function note(freq: number, dur = 0.22, when = 0, kind: 'sing' | 'bass' | 'bell' = 'sing') {
  if (!enabled) return;
  try {
    if (kind === 'bass') tone(freq, dur, 'triangle', when, 0.3);
    else if (kind === 'bell') { tone(freq, dur, 'sine', when, 0.16); tone(freq * 2, dur * 0.6, 'sine', when, 0.05); }
    else { tone(freq, dur, 'square', when, 0.06); tone(freq, dur, 'triangle', when, 0.12); }
  } catch { /* no audio */ }
}
