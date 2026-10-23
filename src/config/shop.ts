// Every tunable value for the shop pages (/joint, /vapes) lives here.
import sizes from "../data/shop-image-sizes.json";
import { OWNER } from "./home";

/** Prices are in this currency, formatted for the current language (Intl.NumberFormat). */
export const CURRENCY = "USD";

/** The contact form's "email me directly" fallback (Contact page). */
export const CONTACT_EMAIL = OWNER.email;

/** Product photos (made by scripts/shop-images.mjs). */
export const PRODUCT_IMAGES = {
  "joint-a": { webp: "/products/joints/joint-a.webp", fallback: "/products/joints/joint-a.jpg", ...sizes["joint-a"] },
  "joint-b": { webp: "/products/joints/joint-b.webp", fallback: "/products/joints/joint-b.jpg", ...sizes["joint-b"] },
  "vape-a": { webp: "/products/vapes/vape-a.webp", fallback: "/products/vapes/vape-a.jpg", ...sizes["vape-a"] },
  "vape-b": { webp: "/products/vapes/vape-b.webp", fallback: "/products/vapes/vape-b.jpg", ...sizes["vape-b"] },
} as const;

export type ProductImage = keyof typeof PRODUCT_IMAGES;

/** The bottom hero cat of each shop page, framed like the home cat (Cat.tsx): zoom and focus. */
export const SHOP_HEROES = {
  joints: { src: "/products/joints/products-hero.jpg", webp: "/products/joints/products-hero.webp", zoom: 1, focus: { x: 50, y: 100 } },
  vapes: { src: "/products/vapes/vapes-hero.jpg", webp: "/products/vapes/vapes-hero.webp", zoom: 1, focus: { x: 50, y: 80 } },
};

export const SHOP = {
  /** Card entrance: rise, un-rotate, fade; per-card stagger within a row. */
  enter: { rise: 40, rotate: 3, staggerMs: 70, duration: 0.8 },
  /** Hover: 3D tilt toward the cursor. */
  tilt: { maxDeg: 8, perspective: 900, lift: 6, zoom: 1.06 },
  /** Fly-to-cart thumbnail. */
  flyMs: 600,
  popVolume: 0.2,
  /** The product shelf: this many rows, scrolling sideways; card width and the gap between cards. */
  shelf: { rows: 2, cardWidth: "clamp(150px, 14vw, 188px)", gap: "clamp(12px, 1.4vw, 18px)" },
  storageKey: "shop-cart",
  /** Bottom hero cat height (it stands on the footer). */
  heroHeight: "max(320px, min(66vh, 760px, 46vw))",
  heroHeightMobile: "min(56vh, 520px)",
  /** Contact form (the server checks the same limits, api/_lib/contact.ts). */
  contact: { nameMax: 100, messageMax: 2000, counterFrom: 1800 },
  /** Back to top: ignition, then the flight (the page scrolls up with it). */
  rocket: { igniteMs: 250, flyMs: 850, maxPuffs: 260 },
};
