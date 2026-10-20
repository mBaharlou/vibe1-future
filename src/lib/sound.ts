import { useSyncExternalStore } from "react";
import { SOUND } from "../config/home";

// A short "inhale + exhale", synthesized with the Web Audio API (nothing to license):
// inhale = band-passed pink noise swelling up, with a faint paper crackle on top;
// exhale = softer, longer low-passed breath that fades out. Only ever started from a click.

let ctx: AudioContext | null = null;
let pink: AudioBuffer | null = null;

// Paul Kellet's pink-noise filter over white noise.
function makePink(audio: AudioContext) {
  const length = audio.sampleRate * 2;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const out = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buffer;
}

function noise(audio: AudioContext, at: number, duration: number) {
  const src = audio.createBufferSource();
  src.buffer = pink;
  src.loop = true;
  src.start(at, Math.random());
  src.stop(at + duration + 0.05);
  return src;
}

/** Plays the inhale + exhale. Call from a click/tap/Enter handler (browsers need the gesture). */
export function playDrag() {
  if (isMuted()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    pink ??= makePink(ctx);
  } catch {
    return;
  }
  const audio = ctx;
  const t0 = audio.currentTime + 0.01;
  const inhale = SOUND.inhaleMs / 1000;
  const exhaleAt = t0 + inhale + SOUND.pauseMs / 1000;
  const exhale = SOUND.exhaleMs / 1000;

  const master = audio.createGain();
  master.gain.value = SOUND.volume;
  master.connect(audio.destination);

  // Inhale: a narrow breath that rises in pitch and volume.
  const inBand = audio.createBiquadFilter();
  inBand.type = "bandpass";
  inBand.Q.value = 0.9;
  inBand.frequency.setValueAtTime(900, t0);
  inBand.frequency.linearRampToValueAtTime(1700, t0 + inhale);
  const inGain = audio.createGain();
  inGain.gain.setValueAtTime(0.0001, t0);
  inGain.gain.exponentialRampToValueAtTime(0.9, t0 + inhale * 0.85);
  inGain.gain.exponentialRampToValueAtTime(0.0001, t0 + inhale + 0.04);
  noise(audio, t0, inhale).connect(inBand).connect(inGain).connect(master);

  // Paper crackle: tiny high-passed bursts scattered through the inhale.
  const crackleHp = audio.createBiquadFilter();
  crackleHp.type = "highpass";
  crackleHp.frequency.value = 3200;
  crackleHp.connect(master);
  for (let i = 0; i < SOUND.crackles; i++) {
    const at = t0 + inhale * (0.25 + Math.random() * 0.7);
    const len = 0.006 + Math.random() * 0.012;
    const g = audio.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.25 + Math.random() * 0.3, at + len * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    noise(audio, at, len).connect(g).connect(crackleHp);
  }

  // Exhale: softer, lower, longer, fading out.
  const outLow = audio.createBiquadFilter();
  outLow.type = "lowpass";
  outLow.Q.value = 0.5;
  outLow.frequency.setValueAtTime(1100, exhaleAt);
  outLow.frequency.exponentialRampToValueAtTime(380, exhaleAt + exhale);
  const outGain = audio.createGain();
  outGain.gain.setValueAtTime(0.0001, exhaleAt);
  outGain.gain.exponentialRampToValueAtTime(0.6, exhaleAt + 0.08);
  outGain.gain.exponentialRampToValueAtTime(0.0001, exhaleAt + exhale);
  noise(audio, exhaleAt, exhale).connect(outLow).connect(outGain).connect(master);
}

// ── Mute, persisted in localStorage and shared by every component ──
const listeners = new Set<() => void>();
// Used when storage is blocked, so the toggle still works for this page view.
let mutedInMemory = false;

function isMuted() {
  try {
    return localStorage.getItem(SOUND.storageKey) === "1";
  } catch {
    return mutedInMemory;
  }
}

export function setMuted(muted: boolean) {
  mutedInMemory = muted;
  try {
    localStorage.setItem(SOUND.storageKey, muted ? "1" : "0");
  } catch {
    // Storage blocked: mutedInMemory covers it.
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === SOUND.storageKey && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const useMuted = () => useSyncExternalStore(subscribe, isMuted);
