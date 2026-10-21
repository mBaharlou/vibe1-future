import { useSyncExternalStore } from "react";
import { SOUND } from "../config/home";

// Sounds, synthesized with the Web Audio API (nothing to license):
// - lighter: 1–3 flint clicks (sharp band-passed noise ticks with a tiny metallic ring), the gas
//   hiss once the valve opens, and a low flame whoosh when it catches;
// - exhale: a soft, low breath under the final smoke burst;
// - whoosh: the smoke pouring out of the wordmark's O.
// Browsers only allow audio after the user clicks/taps/presses a key on the page, so the context
// is created on the first pointerdown/keydown ("unlock"). Until then every sound is silent.

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let lighterFile: AudioBuffer | null = null;
let unlocked = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function unlock() {
  if (unlocked) return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
  } catch {
    return;
  }
  unlocked = true;
  noiseBuffer ??= makeNoise(ctx);
  window.removeEventListener("pointerdown", unlock, true);
  window.removeEventListener("keydown", unlock, true);
  notify();
  void loadOverride(ctx);
}
window.addEventListener("pointerdown", unlock, true);
window.addEventListener("keydown", unlock, true);

// A CC0 recording at public/sounds/lighter.mp3, if one is added, replaces the synthesized lighter.
async function loadOverride(audio: AudioContext) {
  try {
    const res = await fetch(SOUND.overrideSrc);
    if (!res.ok || !res.headers.get("content-type")?.startsWith("audio")) return;
    lighterFile = await audio.decodeAudioData(await res.arrayBuffer());
  } catch {
    // No file: keep the synthesized lighter.
  }
}

// Pink-ish noise (Paul Kellet's filter): softer and more natural than white noise.
function makeNoise(audio: AudioContext) {
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
  src.buffer = noiseBuffer;
  src.loop = true;
  src.start(at, Math.random());
  src.stop(at + duration + 0.05);
  return src;
}

const ready = () => (unlocked && ctx && noiseBuffer && !isMuted() ? ctx : null);

export type Lighting = {
  /** Flint strike times, in ms from the start (also when to show sparks). */
  strikes: number[];
  /** When the flame catches, in ms from the start. */
  catchAt: number;
  /** Stop early with a quick fade (cancelled). */
  stop: () => void;
};

/**
 * Plans a lighter sequence lasting `durationMs` and plays it if sound is unlocked and not muted.
 * The plan (strike and catch times) is returned either way, so visuals stay in sync.
 */
export function playLighter(durationMs: number): Lighting {
  const total = durationMs / 1000;
  const count = SOUND.strikes[0] + Math.floor(Math.random() * (SOUND.strikes[1] - SOUND.strikes[0] + 1));
  // Strikes spread over the first ~70% of the time; the last one catches.
  const strikes = Array.from({ length: count }, (_, i) => (count === 1 ? 0.5 : (i / (count - 1)) * 0.62 + 0.04) * total);
  const catchAt = strikes[strikes.length - 1] + Math.min(0.06, total * 0.05);
  const plan = { strikes: strikes.map((s) => s * 1000), catchAt: catchAt * 1000 };

  const audio = ready();
  if (!audio) return { ...plan, stop: () => {} };
  const t0 = audio.currentTime + 0.01;
  const end = t0 + total;
  const master = audio.createGain();
  master.gain.value = SOUND.volume;
  master.connect(audio.destination);
  const stop = () => {
    const now = audio.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + SOUND.cancelFadeMs / 1000);
    setTimeout(() => master.disconnect(), SOUND.cancelFadeMs + 50);
  };

  if (lighterFile) {
    const src = audio.createBufferSource();
    src.buffer = lighterFile;
    src.playbackRate.value = Math.max(0.5, lighterFile.duration / total);
    src.connect(master);
    src.start(t0);
    return { ...plan, stop };
  }

  for (const s of strikes) {
    const at = t0 + s;
    // Flint: a very short, bright click…
    const click = audio.createBiquadFilter();
    click.type = "bandpass";
    click.frequency.value = 3200 + Math.random() * 1600;
    click.Q.value = 4;
    const cg = audio.createGain();
    cg.gain.setValueAtTime(0.0001, at);
    cg.gain.exponentialRampToValueAtTime(SOUND.flint, at + 0.002);
    cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
    noise(audio, at, 0.035).connect(click).connect(cg).connect(master);
    // …with the wheel's tiny metallic ring…
    const ring = audio.createOscillator();
    ring.type = "triangle";
    ring.frequency.setValueAtTime(2600 + Math.random() * 900, at);
    const rg = audio.createGain();
    rg.gain.setValueAtTime(0.0001, at);
    rg.gain.exponentialRampToValueAtTime(SOUND.flint * 0.12, at + 0.003);
    rg.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
    ring.connect(rg).connect(master);
    ring.start(at);
    ring.stop(at + 0.08);
    // …and a few sparks crackling after it.
    for (let k = 0; k < 4; k++) {
      const sat = at + 0.008 + Math.random() * 0.06;
      const sp = audio.createBiquadFilter();
      sp.type = "highpass";
      sp.frequency.value = 5000;
      const sg = audio.createGain();
      sg.gain.setValueAtTime(0.0001, sat);
      sg.gain.exponentialRampToValueAtTime(SOUND.flint * 0.25, sat + 0.001);
      sg.gain.exponentialRampToValueAtTime(0.0001, sat + 0.006);
      noise(audio, sat, 0.01).connect(sp).connect(sg).connect(master);
    }
  }

  // Gas hiss from the first strike to the end.
  const gasAt = t0 + strikes[0];
  const gas = audio.createBiquadFilter();
  gas.type = "bandpass";
  gas.frequency.value = 6500;
  gas.Q.value = 0.7;
  const gg = audio.createGain();
  gg.gain.setValueAtTime(0.0001, gasAt);
  gg.gain.exponentialRampToValueAtTime(SOUND.hiss, gasAt + 0.08);
  gg.gain.setValueAtTime(SOUND.hiss, end - 0.12);
  gg.gain.exponentialRampToValueAtTime(0.0001, end);
  noise(audio, gasAt, end - gasAt).connect(gas).connect(gg).connect(master);

  // Flame: a low whoosh as it catches, settling into a soft roar.
  const flameAt = t0 + catchAt;
  const flame = audio.createBiquadFilter();
  flame.type = "lowpass";
  flame.Q.value = 0.8;
  flame.frequency.setValueAtTime(250, flameAt);
  flame.frequency.exponentialRampToValueAtTime(950, flameAt + 0.12);
  flame.frequency.exponentialRampToValueAtTime(520, end);
  const fg = audio.createGain();
  fg.gain.setValueAtTime(0.0001, flameAt);
  fg.gain.exponentialRampToValueAtTime(SOUND.flame, flameAt + 0.1);
  fg.gain.exponentialRampToValueAtTime(SOUND.flame * 0.45, flameAt + 0.3);
  fg.gain.setValueAtTime(SOUND.flame * 0.45, Math.max(flameAt + 0.3, end - 0.15));
  fg.gain.exponentialRampToValueAtTime(0.0001, end);
  noise(audio, flameAt, end - flameAt).connect(flame).connect(fg).connect(master);

  return { ...plan, stop };
}

/** A short, quiet exhale under the final smoke burst. */
export function playExhale() {
  const audio = ready();
  if (!audio) return;
  const t0 = audio.currentTime + 0.01;
  const len = SOUND.exhaleMs / 1000;
  const low = audio.createBiquadFilter();
  low.type = "lowpass";
  low.Q.value = 0.5;
  low.frequency.setValueAtTime(1100, t0);
  low.frequency.exponentialRampToValueAtTime(380, t0 + len);
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(SOUND.exhale * SOUND.volume * 3, t0 + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  noise(audio, t0, len).connect(low).connect(g).connect(audio.destination);
}

/** A very soft whoosh: band-passed noise sweeping up, then away. `volume` is the peak gain. */
export function playWhoosh(volume: number, durationMs = 900) {
  const audio = ready();
  if (!audio) return;
  const t0 = audio.currentTime + 0.01;
  const len = durationMs / 1000;
  const band = audio.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(320, t0);
  band.frequency.exponentialRampToValueAtTime(1500, t0 + len * 0.35);
  band.frequency.exponentialRampToValueAtTime(600, t0 + len);
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(volume, t0 + len * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
  noise(audio, t0, len).connect(band).connect(g).connect(audio.destination);
}

const subscribeUnlock = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
/** False until the first click/tap/key press lets the page play sound. */
export const useAudioUnlocked = () => useSyncExternalStore(subscribeUnlock, () => unlocked);

// ── Mute, persisted in localStorage and shared by every component ──
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
  notify();
}

const subscribeMute = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === SOUND.storageKey && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const useMuted = () => useSyncExternalStore(subscribeMute, isMuted);
