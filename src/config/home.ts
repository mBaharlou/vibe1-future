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

// ── Owner (top bar link) ─────────────────────────────────────────────
export const OWNER = { name: "Mohammad Baharlou", githubUrl: "https://github.com/mBaharlou" };

// ── Palette ──────────────────────────────────────────────────────────
/** Denim blue sampled from the photo's sky; the site's accent (bar tint, focus, menu hover). */
export const DENIM = { base: "#2D6280" };

// ── Joints ───────────────────────────────────────────────────────────
/**
 * Point on the cat's head the joints fan out from, in % of the cat frame (x from the left,
 * y from the top). The filter ends sit behind the head; the lit tips point outward.
 */
export const HEAD_ORIGIN = { x: 50, y: 32 };

/** One fanned joint. `angle`: tip direction in degrees (0 = right, -90 = up). `dist`: filter
 *  end's distance from HEAD_ORIGIN, in % of the cat frame width. */
export type JointPlacement = { angle: number; dist: number };

export const JOINT = {
  src: "/photo/joint-cutout.webp",
  fallbackSrc: "/photo/joint-cutout.png",
  /** Cutout height / width (508 × 68 px). */
  aspect: 68 / 508,
  /** Length of every joint, in % of the cat frame width. */
  length: 92,
  /** Wide screens fan out flatter; tall screens steeper so the fan fits the width. */
  fans: {
    wide: [
      { angle: -166, dist: 0 },
      { angle: -138, dist: 0 },
      { angle: -42, dist: 0 },
      { angle: -14, dist: 0 },
    ],
    tall: [
      { angle: -146, dist: 0 },
      { angle: -116, dist: 2 },
      { angle: -64, dist: 2 },
      { angle: -34, dist: 0 },
    ],
  } satisfies Record<string, JointPlacement[]>,
  /** Stage width / height below which the tall fan is used. */
  tallBelow: 1.05,
  /** The cat frame never takes more than this share of the stage height. */
  catMaxHeight: 0.86,
  /** Space kept free around the fan, in px. */
  marginPx: 14,
  /** Load: slide out from behind the head along the joint's own axis, plus a fade. */
  intro: { ms: 900, staggerMs: 120, slidePct: 45, ease: [0.22, 1, 0.36, 1] as const },
  /** Idle sway around the filter end. */
  sway: { deg: 1.5, minS: 7, maxS: 9 },
  hover: { scale: 1.06, dimOpacity: 0.72 },
  /** Ember at the lit tip. */
  ember: { color: "255, 150, 60", pulseS: 3.2 },
};

/** Thin wisps rising from each lit tip (one shared canvas). Matches the cat smoke, much lighter. */
export const JOINT_SMOKE = {
  /** Emission interval per joint; hovering a joint thickens its smoke. */
  emitMs: 300,
  hoverEmitMs: 140,
  lifeMs: [2600, 3800] as const,
  /** Puff radius in px at the start and end of its life. */
  radius: [3, 14] as const,
  rise: [60, 110] as const,
  curl: 9,
  startOpacity: 0.25,
  hoverOpacity: 0.34,
  maxParticles: 90,
  colors: ["#f5f2ee", "#e8e5e1", "#d9d6d2"],
};

/** Selecting a joint: the ember flares, a big soft puff swells over the page, then the page opens. */
export const SELECT = {
  flareMs: 260,
  burstMs: 900,
  burstPuffs: 18,
  /** Largest puff radius, as a share of the larger viewport side. */
  burstRadius: 0.55,
  burstOpacity: 0.7,
  /** window.open runs this long after the click, well inside the click's activation window. */
  openAfterMs: 520,
  /** New tab: the haze clears off the page. */
  revealMs: 700,
};

/** Synthesized inhale + exhale (Web Audio). */
export const SOUND = {
  volume: 0.35,
  inhaleMs: 560,
  pauseMs: 90,
  exhaleMs: 620,
  /** Paper crackle bursts during the inhale. */
  crackles: 7,
  storageKey: "muted",
};

// ── Wandering eyes ───────────────────────────────────────────────────
export const EYES = {
  /** Eye width in px (mobile, desktop). */
  sizePx: [30, 44] as const,
  /** Seconds for the drift to roughly cross its region. */
  crossS: [15, 25] as const,
  /** Gentle tilt, degrees. */
  tiltDeg: 8,
  /** How far the iris can move, as a share of the eye's half width. */
  irisTravel: 0.42,
  blinkMs: 120,
  blinkEveryS: [3, 7] as const,
  /** An eye this close (px) to a hovered joint's tip looks at it instead of the cursor. */
  lookAtJointPx: 420,
  /** Extra room kept around the keep-out areas (wordmark, subtitle, cat, top bar). */
  keepOutPadPx: 10,
};

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
