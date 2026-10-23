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
  // products-hero: a black cat in glowing green leaves. A bright leaf green (#6CD247) that darkens
  // a little toward the bottom, near-white cards, a deep leaf green accent and the cat's black second.
  products: {
    scheme: "light",
    bg: "#6cd247",
    bgGradient: "linear-gradient(180deg, #6cd247 0%, #63c440 45%, #52ab35 100%)",
    surface: "#f6fcf2",
    text: "#0d2208",
    textMuted: "#163a10",
    accent: "#1f5f16",
    accent2: "#0e1a0c",
    onAccent: "#ffffff",
    onAccent2: "#e9f8e2",
    glow: "rgba(14, 50, 10, 0.32)",
    danger: "#8a1c12",
    smoke: "#eef6ea",
    border: "rgba(14, 40, 10, 0.14)",
    bar: "rgba(108, 210, 71, 0.86)",
    barText: "#0d2208",
    reveal: "radial-gradient(ellipse at 50% 55%, #9be27d 0%, #6cd247 55%, #52ab35 100%)",
  },
  // vapes-hero: a cat in a bucket hat on wine-red velvet, a gold sun, white clouds. Clean warm
  // white, the velvet's red (a touch brighter so it reads as red) as the accent, the sun's gold second.
  vapes: {
    scheme: "light",
    bg: "#fbf7f4",
    bgGradient: "radial-gradient(ellipse 120% 70% at 50% 0%, #ffffff 0%, #fbf7f4 45%, #f4ebe6 100%)",
    surface: "#ffffff",
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
    bar: "rgba(255, 255, 255, 0.84)",
    barText: "#2a1312",
    reveal: "radial-gradient(ellipse at 50% 55%, #ffffff 0%, #f6eeea 55%, #ead9d3 100%)",
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

/** Which route uses which theme. Home, /me, /contact and 404 have none yet. */
export const ROUTES: Record<string, ThemeName> = {
  "/products": "products",
  "/vapes": "vapes",
};

export const themeFor = (pathname: string): ThemeName | null => ROUTES[pathname.replace(/\/+$/, "") || "/"] ?? null;

/** The theme as CSS custom properties: bgGradient → --t-bg-gradient, onAccent2 → --t-on-accent2, … */
export const themeVars = (theme: Theme) =>
  Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--t-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, value]));
