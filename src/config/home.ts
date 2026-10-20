// Every tunable value for the home page lives here.

// ── Cat ──────────────────────────────────────────────────────────────
export const CAT = {
  src: "/photo/main-cat.jpg",
  /** Arch frame width / height. */
  aspect: 3 / 4,
  /** Zoom into the photo, anchored at `focus` (% of the frame). */
  zoom: 1.45,
  focus: { x: 34, y: 100 },
};

/** Where smoke comes from, as % of the cat frame. Tied to CAT.zoom / CAT.focus. */
export const MOUTH_ORIGIN = { x: 40.8, y: 54.6 };

// ── Shards ───────────────────────────────────────────────────────────
/** Denim blue sampled from the photo's sky (median of its blue pixels), plus ±8% lightness. */
export const DENIM = {
  base: "#2D6280",
  /** Lightness offsets (percentage points) for the tint and shade. */
  tint: 8,
  shade: -8,
};

/** One shared outline for all four shards, drawn in a 100 × (100·aspect) box. */
export const SHARD = {
  /** Height / width. */
  aspect: 1.3,
  points: "34,0 90,16 100,74 62,130 8,110 0,44",
};

/** Placement as % of the hero frame. `cx` is the centre; size comes from the layout. */
export type ShardPlacement = { cx: number; top: number; rotate: number };

export type Layout = {
  /** Frame width / height. */
  ratio: number;
  /** Cat frame height and distance from the frame bottom, as % of the frame height. */
  cat: { height: number; bottom: number };
  /** Every shard's width as % of the frame width. */
  shardWidth: number;
  /** Sorted left → right, so index 0 is Page 1. */
  shards: ShardPlacement[];
  sparkles: { left: number; top: number; width: number }[];
};

const leftToRight = (shards: ShardPlacement[]) => [...shards].sort((a, b) => a.cx - b.cx);

// The shards fan out from under the cat's bottom edge in an even arc:
// equal spacing, outer pair a little higher and more tilted.
export const LAYOUTS: Record<"wide" | "tall", Layout> = {
  wide: {
    ratio: 1.25,
    cat: { height: 70, bottom: 24 },
    shardWidth: 13,
    shards: leftToRight([
      { cx: 27, top: 64, rotate: 22 },
      { cx: 42.3, top: 70, rotate: 8 },
      { cx: 57.7, top: 70, rotate: -8 },
      { cx: 73, top: 64, rotate: -22 },
    ]),
    sparkles: [
      { left: 2, top: 50, width: 6 },
      { left: 92, top: 44, width: 5 },
    ],
  },
  tall: {
    ratio: 0.8,
    cat: { height: 64, bottom: 26 },
    shardWidth: 20,
    shards: leftToRight([
      { cx: 14, top: 66, rotate: 22 },
      { cx: 38, top: 70, rotate: 8 },
      { cx: 62, top: 70, rotate: -8 },
      { cx: 86, top: 66, rotate: -22 },
    ]),
    sparkles: [
      { left: 4, top: 34, width: 9 },
      { left: 86, top: 30, width: 8 },
    ],
  },
};

/** Stage width / height below which the tall layout is used. */
export const TALL_BELOW = 0.95;

// ── Shard motion ─────────────────────────────────────────────────────
/** Load: fade + slide up out from under the cat. */
export const INTRO = { fadeMs: 800, staggerMs: 100, slidePx: 10 };

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

/** Fill and glow drift between ±lightness (percentage points) of the base blue. */
export const COLOR_DRIFT = { lightness: 4, seconds: 12 };

export const HOVER = { scale: 1.08, dimOpacity: 0.45, previewMs: 300, rewindMs: 350 };

/** The pointer must travel this far on the home page before hover-to-enter arms. */
export const DWELL_ARM_PX = 12;

/** Hover this long to open a page in a new tab. */
export const DWELL_MS = 1200;

/** Pulse on the shard itself when its page opens (the home tab stays put). */
export const RIPPLE = { ms: 400, scale: 1.22 };

/** Dwell finished but the browser blocked the pop-up: the full ring pulses until hover ends. */
export const BLOCKED_PULSE = { seconds: 1.4, minOpacity: 0.4 };

// ── Top bar, menu and language switcher ─────────────────────────────
export const BAR = {
  heightPx: 56,
  mobileHeightPx: 48,
  /** Breakpoint (px) where the bar switches to its desktop height. */
  desktopFromPx: 640,
  /** Bar tint (denim at ~6%), blur and hairline border. */
  background: `${DENIM.base}0f`,
  blurPx: 8,
  border: "rgba(0, 0, 0, 0.06)",
  /** Label fade when a side item needs its space on narrow screens. */
  labelFadeMs: 200,
};

export const HEADER = {
  /** Height the old label pill took in the header flow; keeps "CLAUDE" and the cat where they were. */
  spacerPx: 27,
  spacerDesktopPx: 28,
  /** How far "CLAUDE" + subtitle move down (CSS length). */
  shift: "clamp(24px, calc(2.5vw + 16px), 56px)",
  /** The shift shrinks so the subtitle keeps at least this much room above the cat. */
  catClearancePx: 12,
};

export const MENU = {
  /** Space between the hamburger and the menu track. */
  buttonGapPx: 4,
  /** Minimum space kept between the menu and the centred label. */
  labelGapPx: 24,
  /** Minimum space kept between the menu and the language switcher (label hidden). */
  switcherGapPx: 8,
  openMs: 450,
  closeMs: 350,
  /** Pointer has left both button and menu for this long before it closes. */
  closeDelayMs: 200,
  itemStaggerMs: 50,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const HAMBURGER = {
  hitPx: 44,
  perspectivePx: 400,
  /** Max magnetic tilt toward the cursor, in degrees, and the radius (px) it reacts within. */
  tiltDeg: 14,
  tiltRadiusPx: 160,
  /** 0–1 per frame; lower is smoother. */
  tiltSmoothing: 0.14,
  /** Delay between the slats flipping. */
  flipStaggerMs: 70,
};

export const LANG_SWITCH = {
  /** Smoke condenses into each option. */
  condenseMs: 500,
  staggerMs: 80,
  /** Options dissolve into smoke. */
  dissolveMs: 700,
  /** Hover-out grace before the others dissolve. */
  closeDelayMs: 200,
  /** Particles per option and their look. */
  particles: 16,
  particleRadius: [2.5, 6] as const,
  colors: ["#d9d6d2", "#cfcbc6", "#e8e5e1"],
  /** Crossfade when the direction flips (en/tr ↔ fa). */
  dirFadeMs: 250,
  /** Gap between the switcher and the centred label. */
  labelGapPx: 24,
};

/** After window.close(), give the tab this long to go before falling back to "/". */
export const CLOSE_FALLBACK_MS = 150;

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
