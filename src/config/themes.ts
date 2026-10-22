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
  // products-hero: a black cat in glowing green leaves. Near-black with a green tint, the photo's
  // leaf green as the accent, the cat's neon eye green as the second.
  products: {
    scheme: "dark",
    bg: "#06100a",
    bgGradient: "radial-gradient(ellipse 120% 70% at 50% 0%, #10301a 0%, #0a1a0f 42%, #06100a 100%)",
    surface: "#0c1a10",
    text: "#e9f5e6",
    textMuted: "#a3c4a0",
    accent: "#4ba347",
    accent2: "#6dc840",
    onAccent: "#04100a",
    onAccent2: "#04100a",
    glow: "rgba(75, 163, 71, 0.5)",
    danger: "#ff8f7d",
    smoke: "#d6e2d4",
    border: "rgba(109, 200, 64, 0.22)",
    bar: "rgba(6, 16, 10, 0.82)",
    barText: "#e9f5e6",
    reveal: "radial-gradient(ellipse at 50% 55%, #1b3a22 0%, #0b1a0f 55%, #06100a 100%)",
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
