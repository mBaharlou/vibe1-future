// Every tunable value for the home page lives here.

// ── Cat ──────────────────────────────────────────────────────────────
export const CAT = {
  src: "/photo/main-cat.jpg",
  webp: "/photo/main-cat.webp",
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
  length: 72,
  /** The cat is sized to fit a fan of joints this long (the original length), so shorter joints
   *  don't make the cat bigger. */
  fitLength: 92,
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
  hover: { scale: 1.05, dimOpacity: 0.72 },
  /** Ember at the tip once lit. */
  ember: { color: "255, 150, 60" },
};

/** Lighting a joint: a lighter flame at the tip, flint sparks, then it catches and smokes. */
export const LIGHT = {
  /** Hover / keyboard focus. */
  ms: 2000,
  /** Click / tap / Enter: the same sequence, faster. */
  clickMs: 700,
  /** After catching on hover: let the ember and first puff show before the transition. */
  holdAfterLightMs: 450,
  /** Click path: the transition starts this soon after catching (stays inside the click's
   *  activation window for window.open). */
  clickHoldMs: 120,
  /** Flame height, as a multiple of the joint's thickness. */
  flameScale: 2.4,
  /** The pointer must travel this far on the page before hover can light a joint. */
  armPx: 12,
  /** Sparks per flint click. */
  sparks: 7,
  /** The tip glows up over the lighting time, to this opacity. */
  preGlow: 0.55,
};

/** Smoke from a lit joint (one shared canvas). Matches the cat smoke, much lighter. */
export const JOINT_SMOKE = {
  emitMs: 150,
  lifeMs: [2600, 3800] as const,
  /** Puff radius in px at the start and end of its life. */
  radius: [3, 14] as const,
  rise: [60, 110] as const,
  curl: 9,
  opacity: 0.32,
  /** The first thick puff when a joint catches. */
  firstPuffs: 7,
  maxParticles: 90,
  colors: ["#f5f2ee", "#e8e5e1", "#d9d6d2"],
};

/** Going to the page: the ember flares, a big soft puff swells over the page, then the page opens. */
export const SELECT = {
  flareMs: 260,
  burstMs: 900,
  burstPuffs: 18,
  /** Largest puff radius, as a share of the larger viewport side. */
  burstRadius: 0.55,
  burstOpacity: 0.7,
  /** The page opens this long after the transition starts. */
  openAfterMs: 380,
  /** New tab / page: the haze clears off it. */
  revealMs: 700,
};

/** Synthesized lighter (Web Audio). public/sounds/lighter.mp3, if present, is used instead. */
export const SOUND = {
  volume: 0.35,
  /** Mix inside the lighter. */
  flint: 0.9,
  hiss: 0.16,
  flame: 0.55,
  /** Flint strikes before it catches (random in this range). */
  strikes: [1, 3] as const,
  /** Short, quiet exhale under the final smoke burst. */
  exhale: 0.18,
  exhaleMs: 520,
  /** Fade when a lighting is cancelled. */
  cancelFadeMs: 120,
  storageKey: "muted",
  overrideSrc: "/sounds/lighter.mp3",
};

// ── Eyes (every page) ────────────────────────────────────────────────
export const EYES = {
  count: 3,
  /** Under 640px wide: the same three, a bit smaller. */
  mobileCount: 3,
  mobileScale: 0.82,
  /** Width variants in px, cycled through the eyes. */
  sizes: [36, 44, 54] as const,
  /** Iris tints, cycled; all warm browns within the palette. */
  irises: ["#3b2f26", "#4a3524", "#2e3a3f", "#55402c", "#3a2d33", "#40382a"],
  /** Wander: seconds for the drift to roughly cross its region; WANDER_SPEED scales it. */
  crossS: [15, 25] as const,
  wanderSpeed: 1,
  /** Spring pulling an eye toward its wander point (1/s²). */
  spring: 5,
  /** Repulsion from the cursor: within `repelRadius` px, ∝ 1/d², capped at `repelCap`×. */
  repelRadius: 180,
  repelStrength: 2600,
  repelCap: 6,
  /** Sideways dodge from a fast-approaching cursor, per px/s of its speed. */
  dodge: 2.2,
  /** Velocity kept per frame at 60fps, and a speed cap (px/s). */
  damping: 0.88,
  maxSpeed: 900,
  /** Eyes keep this many of their own widths apart. */
  separation: 1.25,
  separationStrength: 1800,
  /** Scared: wider eye, smaller pupil. */
  fleeScale: 1.1,
  fleePupil: 0.62,
  tiltDeg: 8,
  /** How far the iris can move, as a share of the eye's half width. */
  irisTravel: 0.42,
  blinkMs: 120,
  blinkEveryS: [3, 7] as const,
  /** Extra room kept around [data-eyes-avoid] areas. */
  keepOutPadPx: 10,
};

/** Catch an eye (click / tap right on it) and it cries, then dashes off. */
export const EYE_CRY = {
  /** CRY_MS: how long a caught eye cries. */
  cryMs: 2000,
  /** CATCH_HIT_SCALE: the hit area is the eye's outline grown by this much. */
  catchHitScale: 1.15,
  /** CATCH_COOLDOWN_MS: after crying, the same eye can't be caught again for this long. */
  catchCooldownMs: 3000,
  /** TEAR_COUNT: teardrops per cry. */
  tearCount: 4,
  /** ESCAPE_BOOST: the dash away afterwards, as a multiple of EYES.maxSpeed, for `escapeMs`. */
  escapeBoost: 2,
  escapeMs: 600,
  /** The eye shrinks while crying, then widens in surprise before it dashes. */
  sadScale: 0.9,
  surpriseScale: 1.15,
  surpriseMs: 280,
  /** Sob: a quick ±sobPx horizontal tremble every sobEveryMs. */
  sobPx: 2,
  sobEveryMs: 400,
  /** Tears fall this far (random in range, px) before they splash. */
  fallPx: [60, 100] as const,
  /** A slow cursor scares the eyes less, so a careful approach can catch one: below `calmSpeed`
   *  px/s the repulsion eases down toward `calmFloor` of its full strength. */
  calmSpeed: 520,
  calmFloor: 0.15,
};

// ── Home wordmark (WELCOME) fill ─────────────────────────────────────────────
/** Rainbow + flower-power pattern clipped to the letters. Pattern scale is in em (follows the
 *  font size, so the look is the same at every screen size). */
export const WORDMARK = {
  patternScale: 1.35,
  driftS: 50,
  hueS: 26,
};

/** Gray smoke that collects in the O's hole from the bottom up, packs it, then bursts out and drifts
 *  off the top of the page, on a loop. ?smokeFast=1 in the URL squeezes the whole cycle into `fast`
 *  (≈20s) for testing. */
export const O_SMOKE = {
  fillMs: 210000,
  fullMs: 1500,
  releaseMs: 3500,
  pauseMs: 2000,
  fast: { fillMs: 13500, fullMs: 1500, releaseMs: 3200, pauseMs: 1800 },
  /** Puffs inside the O when it is full, and the most the release can have in flight. */
  maxParticles: 70,
  /** Real smoke grays (they must contrast with the off-white page showing through the hole):
   *  mid, dark (the bottom of the body), light (the top of the body and the wisps). */
  colors: ["#9a9590", "#7d7873", "#b8b3ad"],
  /** Reduced motion: a faint, still haze in the hole instead of the cycle. */
  staticHaze: 0.35,
};

// ── Top bar, menu and language switcher ─────────────────────────────
export const BAR = {
  heightPx: 56,
  mobileHeightPx: 48,
  /** Breakpoint (px) where the bar switches to its desktop height. */
  desktopFromPx: 640,
  /** Below navInlineFromPx the page links get their own row of this height under the bar. */
  navRowPx: 36,
  navInlineFromPx: 900,
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

// ── "Ask the cat" (every page) ───────────────────────────────────────
export const ASK_CAT = {
  /** Round avatar under the top bar, in px. */
  size: 52,
  mobileSize: 44,
  /** The cat's face cropped from CAT.src: object-position (%), then a zoom around `origin` (% of the avatar). */
  face: { x: 42, y: 92, zoom: 2.3, origin: { x: 42, y: 50 } },
  /** Desktop panel; under 640px it is a full-height bottom sheet instead. */
  panel: { width: 380, height: 560, gapPx: 10 },
  maxChars: 1000,
  /** The character counter shows from here on. */
  counterFrom: 800,
  /** sessionStorage: the conversation survives navigation and refresh in this tab. */
  storageKey: "ask-cat-chat",
};

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
