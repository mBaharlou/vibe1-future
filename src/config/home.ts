// Every tunable value for the home page lives here.

// ── Cat ──────────────────────────────────────────────────────────────
export const CAT = {
  src: "/photo/main-cat.jpg",
  alt: "Tabby cat in a sunny field",
  /** Arch frame width / height. */
  aspect: 3 / 4,
  /** Zoom into the photo, anchored at `focus` (% of the frame). */
  zoom: 1.45,
  focus: { x: 34, y: 100 },
};

/** Where smoke comes from, as % of the cat frame. Tied to CAT.zoom / CAT.focus. */
export const MOUTH_ORIGIN = { x: 40.8, y: 54.6 };

// ── Shard layouts ────────────────────────────────────────────────────
export type ShardGeometry = {
  /** Position and size as % of the hero frame (width sets both sides of a square box). */
  left: number;
  top: number;
  width: number;
  rotate: number;
  /** Polygon points in a 0–100 box. */
  points: string;
};

export type Layout = {
  /** Frame width / height. */
  ratio: number;
  /** Cat frame height as % of the hero frame. */
  cat: number;
  /** Sorted left → right, so index 0 is Page 1. */
  shards: ShardGeometry[];
  sparkles: { left: number; top: number; width: number }[];
};

const leftToRight = (shards: ShardGeometry[]) =>
  [...shards].sort((a, b) => a.left + a.width / 2 - (b.left + b.width / 2));

// Same four outlines in both layouts so they read as one set.
const OUTLINES = {
  upperLeft: "2,22 34,2 62,30 98,70 80,98 30,64",
  lowerLeft: "0,58 26,20 70,8 100,30 86,64 30,96",
  upperRight: "96,18 62,0 34,34 4,74 26,100 74,60",
  lowerRight: "100,52 70,14 26,4 0,36 18,70 76,96",
};

export const LAYOUTS: Record<"wide" | "tall", Layout> = {
  wide: {
    ratio: 1.25,
    cat: 82,
    shards: leftToRight([
      { left: 18, top: 3, width: 27, rotate: -6, points: OUTLINES.upperLeft },
      { left: 10, top: 35, width: 27, rotate: 10, points: OUTLINES.lowerLeft },
      { left: 55, top: 1, width: 27, rotate: 8, points: OUTLINES.upperRight },
      { left: 63, top: 33, width: 27, rotate: -11, points: OUTLINES.lowerRight },
    ]),
    sparkles: [
      { left: 2, top: 50, width: 6 },
      { left: 92, top: 44, width: 5 },
    ],
  },
  tall: {
    ratio: 0.8,
    cat: 62,
    shards: leftToRight([
      { left: 8, top: 17, width: 36, rotate: -6, points: OUTLINES.upperLeft },
      { left: 0, top: 43, width: 36, rotate: 10, points: OUTLINES.lowerLeft },
      { left: 56, top: 14, width: 36, rotate: 8, points: OUTLINES.upperRight },
      { left: 64, top: 41, width: 36, rotate: -11, points: OUTLINES.lowerRight },
    ]),
    sparkles: [
      { left: 4, top: 76, width: 9 },
      { left: 86, top: 72, width: 8 },
    ],
  },
};

/** Stage width / height below which the tall layout is used. */
export const TALL_BELOW = 0.95;

// ── Shard motion ─────────────────────────────────────────────────────
export const INTRO = { fadeMs: 800, staggerMs: 100 };

export const FLOAT = { px: 2.5, minS: 6, maxS: 8 };

export const GLOW = {
  blurPx: 24,
  /** Breathing range and the static value used with reduced motion. */
  min: 0.2,
  max: 0.35,
  staticOpacity: 0.25,
  scale: 1.05,
  minS: 8,
  maxS: 10,
  /** Glow while a shard is hovered or focused. */
  active: 0.5,
};

/** Fill and glow drift between ±lightness (percentage points) of each page color. */
export const COLOR_DRIFT = { lightness: 4, seconds: 12 };

export const HOVER = { scale: 1.12, dimOpacity: 0.45, previewMs: 300, rewindMs: 350 };

/** Hover this long to enter a page. */
export const DWELL_MS = 1200;

// ── Haze and smoke ───────────────────────────────────────────────────
export const HAZE = {
  blurPx: 40,
  /** Extra opacity on every blob while the cat is hovered, eased over `thickenMs`. */
  thicken: 0.05,
  thickenMs: 1000,
  blobs: [
    { left: -10, bottom: -6, width: 70, height: 46, color: "255,255,255", opacity: 0.12, driftPct: 8, seconds: 46 },
    { left: 40, bottom: 4, width: 72, height: 40, color: "160,160,160", opacity: 0.08, driftPct: -7, seconds: 58 },
    { left: 15, bottom: 22, width: 60, height: 30, color: "190,190,190", opacity: 0.06, driftPct: 6, seconds: 36 },
  ],
};

export const SMOKE = {
  maxParticles: 36,
  emitEveryMs: [120, 180] as const,
  lifeMs: [2500, 4000] as const,
  startOpacity: 0.5,
  scale: [0.3, 2.5] as const,
  /** Puff radius at scale 1, as a fraction of the cat frame width. */
  radius: 0.085,
  /** How far a puff rises over its life, as a fraction of the cat frame height. */
  rise: 0.48,
  colors: ["#f5f2ee", "#e8e5e1", "#d9d6d2"],
  /** Touch: how long one tap keeps emitting. */
  tapBurstMs: 2000,
};
