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
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

/** Which route uses which theme. Home, /me, /contact and 404 have none yet. */
export const ROUTES: Record<string, ThemeName> = {
  "/joint": "products",
  "/vapes": "vapes",
};

export const themeFor = (pathname: string): ThemeName | null => ROUTES[pathname.replace(/\/+$/, "") || "/"] ?? null;

/** The theme as CSS custom properties: bgGradient → --t-bg-gradient, onAccent2 → --t-on-accent2, … */
export const themeVars = (theme: Theme) =>
  Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--t-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value]));
