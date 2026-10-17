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

/**
 * Procedural synthesis of deep rolling thunder & electric snap
 * Zero external audio files, 100% Web Audio API
 */
export function playThunderSound(isClose = true) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const dur = isClose ? 2.6 : 3.5;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate brown/pink noise (integrated random values)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.025 * white)) / 1.025;
      lastOut = data[i];
      data[i] *= 3.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Lowpass filter simulating atmospheric acoustic attenuation
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(isClose ? 480 : 220, now);
    filter.frequency.exponentialRampToValueAtTime(45, now + dur);

    const gain = ctx.createGain();
    if (isClose) {
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    } else {
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + dur);
  } catch {}
}

/**
 * Procedural festive firework explosion sound with whistle and crackles
 */
export function playFireworkSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Low-end concussive thud / boom (45Hz - 80Hz)
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = "sine";
    boomOsc.frequency.setValueAtTime(110, now);
    boomOsc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

    boomGain.gain.setValueAtTime(0.28, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    boomOsc.connect(boomGain);
    boomGain.connect(ctx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + 0.9);

    // 2. High frequency crackle noise burst
    const dur = 1.1;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Periodic crackle density
      data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.82 ? 1.0 : 0.08);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(800, now);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.01, now);
    crackleGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(crackleGain);
    crackleGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + dur);
  } catch {}
}

/**
 * High-speed cosmic shooting star celestial shimmer sweep
 */
export function playShootingStarSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [1318.51, 1567.98, 2093.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.04;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * 1.5, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, start + 0.5);

      gain.gain.setValueAtTime(0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch {}
}

/**
 * Delicate winter / christmas bell sparkle chime
 */
export function playCrystalChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [1046.5, 1318.51, 1567.98, 2093.0];
    const n = notes[Math.floor(Math.random() * notes.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(n, now);
    osc.frequency.exponentialRampToValueAtTime(n * 1.01, now + 0.4);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  } catch {}
}

/**
 * Underwater oceanic bubble resonant pop
 */
export function playWaterBubbleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320 + Math.random() * 150, now);
    osc.frequency.exponentialRampToValueAtTime(850 + Math.random() * 200, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch {}
}

/**
 * Sci-Fi Cyber radar / laser telemetry blip
 */
export function playCyberSweepSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1600, now + 0.06);
    osc.frequency.linearRampToValueAtTime(400, now + 0.12);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  } catch {}
}

/**
 * Organic wind rustle breeze for cherry blossom and autumn leaves
 */
export function playGentleWindSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const dur = 1.6;
    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.linearRampToValueAtTime(650, now + 0.8);
    filter.frequency.linearRampToValueAtTime(250, now + dur);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + dur);
  } catch {}
}
