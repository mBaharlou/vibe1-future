// Page themes, sampled from each page's hero cat photo (scripts/sample-palette.mjs). A themed
// route gets data-theme="<name>" and these values as --t-* custom properties on <html>, so the
// page, the top bar, the cart and everything else on it can use them. Routes without a theme
// keep the site's original look. Adding one is a single entry in THEMES plus its path in ROUTES.

export type Theme = {
  /** "dark" or "light": which way the page leans (eyes, scrollbars, smoke blending). */
  scheme: "dark" | "light";
  bg: string;
  bgGradient: string;
  /** Cards, drawers, panels. */
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  /** Text and icons on `accent` / on `accent2`. */
  onAccent: string;
  onAccent2: string;
  glow: string;
  /** Form errors. */
  danger: string;
  smoke: string;
  border: string;
  /** Top bar background and text, so it fits the page. */
  bar: string;
  barText: string;
  /** The haze a page opens through (SmokeReveal). */
  reveal: string;
};

export const THEMES = {
  // products-hero: a black cat in glowing green leaves. A calm, premium take on it: soft green light
  // behind frosted-glass cards, deep emerald for actions and a warm gold for tags and highlights.
  products: {
    scheme: "light",
    bg: "#e6f1e7",
    // Pools of leaf green, mint and a little sun-gold behind frosted-glass cards.
    bgGradient:
      "radial-gradient(60% 50% at 10% 8%, rgba(74, 222, 128, 0.38) 0%, transparent 62%), " +
      "radial-gradient(50% 45% at 92% 6%, rgba(250, 204, 21, 0.26) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 88% 92%, rgba(16, 185, 129, 0.34) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 6% 94%, rgba(132, 204, 22, 0.3) 0%, transparent 62%), " +
      "linear-gradient(160deg, #eef6ee 0%, #e6f2e8 50%, #dcebdf 100%)",
    surface: "rgba(255, 255, 255, 0.62)",
    text: "#14231c",
    textMuted: "#4b5c52",
    accent: "#1e4d3a",
    accent2: "#b8873b",
    onAccent: "#ffffff",
    onAccent2: "#1a1408",
    glow: "rgba(30, 77, 58, 0.28)",
    danger: "#a3261c",
    smoke: "#8f9a90",
    border: "rgba(20, 35, 28, 0.1)",
    bar: "rgba(255, 255, 255, 0.45)",
    barText: "#14231c",
    reveal: "radial-gradient(ellipse at 50% 55%, #ffffff 0%, #eef1e9 55%, #dbe4d3 100%)",
  },
  // vapes-hero: a cat in a bucket hat on wine-red velvet, a gold sun, white clouds. A pastel sky
  // behind frosted-glass cards, the velvet's red (a touch brighter so it reads as red) as the accent,
  // the sun's gold second.
  vapes: {
    scheme: "light",
    bg: "#f4f6ff",
    // Sky blue and lilac up top, rose and peach below, behind frosted-glass cards.
    bgGradient:
      "radial-gradient(60% 50% at 10% 8%, rgba(147, 197, 253, 0.55) 0%, transparent 62%), " +
      "radial-gradient(50% 45% at 92% 6%, rgba(196, 181, 253, 0.45) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 88% 92%, rgba(253, 164, 175, 0.45) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 6% 94%, rgba(254, 215, 170, 0.5) 0%, transparent 62%), " +
      "linear-gradient(160deg, #f3f7ff 0%, #fdf4f6 55%, #f7f1ff 100%)",
    surface: "rgba(255, 255, 255, 0.62)",
    text: "#2a1312",
    textMuted: "#6e4b48",
    accent: "#8e2630",
    accent2: "#ffdd51",
    onAccent: "#ffffff",
    onAccent2: "#3a1816",
    glow: "rgba(142, 38, 48, 0.32)",
    danger: "#b3261e",
    smoke: "#9a9590",
    border: "rgba(83, 32, 36, 0.12)",
    bar: "rgba(255, 255, 255, 0.45)",
    barText: "#2a1312",
    reveal: "radial-gradient(ellipse at 50% 55%, #ffffff 0%, #f6eeea 55%, #ead9d3 100%)",
  },
  // /me and /contact: the site's own pastel backdrop (lilac, sky, blush, mint) with the denim blue
  // sampled from the home cat's sky as the accent, and a warm honey for highlights.
  studio: {
    scheme: "light",
    bg: "#f1f1fb",
    bgGradient:
      "radial-gradient(60% 50% at 10% 8%, rgba(167, 139, 250, 0.42) 0%, transparent 62%), " +
      "radial-gradient(50% 45% at 92% 6%, rgba(125, 211, 252, 0.48) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 88% 92%, rgba(251, 207, 232, 0.55) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 6% 94%, rgba(167, 243, 208, 0.45) 0%, transparent 62%), " +
      "linear-gradient(160deg, #eef0ff 0%, #f6f1ff 45%, #eefaf8 100%)",
    surface: "rgba(255, 255, 255, 0.62)",
    text: "#151a2c",
    textMuted: "#4c5571",
    accent: "#2d6280",
    accent2: "#e7a93c",
    onAccent: "#ffffff",
    onAccent2: "#2a1c05",
    glow: "rgba(45, 98, 128, 0.28)",
    danger: "#b3261e",
    smoke: "#9aa0b2",
    border: "rgba(21, 26, 44, 0.1)",
    bar: "rgba(255, 255, 255, 0.45)",
    barText: "#151a2c",
    reveal: "radial-gradient(ellipse at 50% 55%, #ffffff 0%, #eeeefb 55%, #dcdcf0 100%)",
  },
  // /contact: the studio palette after dark. Deep night navy with the denim and a little violet
  // glowing in the corners, frosted cards, the denim brightened into a sky blue so it reads on dark,
  // and the honey kept as the second accent.
  night: {
    scheme: "dark",
    bg: "#0a0f1d",
    bgGradient:
      "radial-gradient(60% 50% at 8% 6%, rgba(45, 98, 128, 0.6) 0%, transparent 62%), " +
      "radial-gradient(50% 45% at 94% 8%, rgba(124, 58, 237, 0.3) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 90% 94%, rgba(20, 184, 166, 0.2) 0%, transparent 62%), " +
      "radial-gradient(55% 50% at 6% 96%, rgba(59, 130, 246, 0.22) 0%, transparent 62%), " +
      "linear-gradient(160deg, #0b1122 0%, #0a0f1d 50%, #0d0b1f 100%)",
    surface: "rgba(255, 255, 255, 0.06)",
    text: "#eaf0fb",
    textMuted: "#9aa6c2",
    accent: "#7cc4e8",
    accent2: "#f4b860",
    onAccent: "#08131f",
    onAccent2: "#241603",
    glow: "rgba(124, 196, 232, 0.22)",
    danger: "#ff8a80",
    smoke: "#5f6a86",
    border: "rgba(255, 255, 255, 0.1)",
    bar: "rgba(10, 15, 29, 0.55)",
    barText: "#eaf0fb",
    reveal: "radial-gradient(ellipse at 50% 55%, #1b2440 0%, #0f1528 55%, #080c18 100%)",
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

/** Which route uses which theme. Home and 404 have none. */
export const ROUTES: Record<string, ThemeName> = {
  "/joint": "products",
  "/vapes": "vapes",
  "/me": "studio",
  "/contact": "night",
};

export const themeFor = (pathname: string): ThemeName | null => ROUTES[pathname.replace(/\/+$/, "") || "/"] ?? null;

/** The theme as CSS custom properties: bgGradient → --t-bg-gradient, onAccent2 → --t-on-accent2, … */
export const themeVars = (theme: Theme) =>
  Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--t-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value]));
