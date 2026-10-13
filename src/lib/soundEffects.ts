/**
 * Zero-dependency Web Audio API sound synthesizer
 * Provides snappy haptic and sci-fi sound effects for interactive UI without audio assets.
 */

let audioCtx: AudioContext | null = null;
let isMutedState = false;

// Initialize mute state from localStorage if available in browser
if (typeof window !== "undefined") {
  try {
    isMutedState = localStorage.getItem("tx_sound_muted") === "true";
  } catch {
    isMutedState = false;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (isMutedState) return null;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function isSoundMuted(): boolean {
  return isMutedState;
}

export function toggleSoundMute(): boolean {
  isMutedState = !isMutedState;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("tx_sound_muted", isMutedState ? "true" : "false");
    } catch {}
  }
  return isMutedState;
}

/**
 * Snappy mechanical keyboard / UI click
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {}
}

/**
 * Positive chime when answering correctly
 */
export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Two-tone bright chord (C5 -> G5)
    [523.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const start = now + idx * 0.07;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.28);
    });
  } catch {}
}

/**
 * Subdued thud when answering wrongly
 */
export function playWrongSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  } catch {}
}

/**
 * Urgent siren tone when failing a critical question (Điểm Liệt)
 */
export function playCriticalFailSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // 2 alarm bursts
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const start = now + i * 0.18;
      osc.type = "square";
      osc.frequency.setValueAtTime(440, start);
      osc.frequency.linearRampToValueAtTime(880, start + 0.09);
      osc.frequency.linearRampToValueAtTime(440, start + 0.17);

      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.17);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.18);
    }
  } catch {}
}

/**
 * Victorious fanfare when passing the exam
 */
export function playExamPassFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Fanfare triad notes: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const start = now + idx * 0.1;
      const dur = idx === notes.length - 1 ? 0.6 : 0.22;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  } catch {}
}

/**
 * Motor engine hum for interactive traffic simulator
 */
export function playEngineRevSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);
    osc.frequency.linearRampToValueAtTime(140, now + 0.7);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  } catch {}
}
