import { useSyncExternalStore } from "react";

// The 21+ age gate and the prize it hands out. Passing it (scratch the card, confirm 21+) is
// remembered in localStorage, so it shows once per browser, and unlocks a 10% discount the cart
// applies to every product. Other tabs follow through the "storage" event.

export const DISCOUNT_RATE = 0.1;
const STORAGE_KEY = "age-gate";
const CHANGE = "age-gate-change";

type Gate = { verified: boolean; discount: number };
const LOCKED: Gate = { verified: false, discount: 0 };

let cached: { raw: string | null; gate: Gate } | null = null;

function read(): Gate {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: the gate shows on every visit.
  }
  if (cached && cached.raw === raw) return cached.gate;
  let gate = LOCKED;
  try {
    const parsed = JSON.parse(raw ?? "null") as Partial<Gate> | null;
    if (parsed?.verified === true) gate = { verified: true, discount: typeof parsed.discount === "number" ? parsed.discount : 0 };
  } catch {
    // Unreadable: treat as not passed.
  }
  cached = { raw, gate };
  return gate;
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && onChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE, onChange);
  };
}

/** Confirmed 21+: open the site and keep the prize. */
export function passGate() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ verified: true, discount: DISCOUNT_RATE }));
  } catch {
    // Storage blocked: still let them in for this page view.
    cached = { raw: null, gate: { verified: true, discount: DISCOUNT_RATE } };
  }
  window.dispatchEvent(new Event(CHANGE));
}

export const useGate = () => useSyncExternalStore(subscribe, read);
