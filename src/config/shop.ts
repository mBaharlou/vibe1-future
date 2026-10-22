// Every tunable value for the shop pages (/products, /vapes) lives here.
import sizes from "../data/shop-image-sizes.json";

/** Prices are in this currency, formatted for the current language (Intl.NumberFormat). */
export const CURRENCY = "USD";

/** The "Email me" section at the bottom of the shop pages. */
export const CONTACT_EMAIL = "mmdbaharlou@gmail.com";

/** Product photos (made by scripts/shop-images.mjs). `cutout`: shown cut out on a backdrop of the
 *  theme's accents instead of filling the image area. */
export const PRODUCT_IMAGES = {
  "joint-a": { webp: "/products/joints/joint-a-cutout.webp", fallback: "/products/joints/joint-a-cutout.png", ...sizes["joint-a-cutout"], cutout: true },
  "joint-b": { webp: "/products/joints/joint-b-cutout.webp", fallback: "/products/joints/joint-b-cutout.png", ...sizes["joint-b-cutout"], cutout: true },
  "vape-a": { webp: "/products/vapes/vape-a.webp", fallback: "/products/vapes/vape-a.jpg", ...sizes["vape-a"], cutout: false },
  "vape-b": { webp: "/products/vapes/vape-b.webp", fallback: "/products/vapes/vape-b.jpg", ...sizes["vape-b"], cutout: false },
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
  /** Grid breakpoints (px): 1 column below the first, then 2, 3, 4. */
  columnsFrom: [560, 960, 1360] as const,
  storageKey: "shop-cart",
  /** Bottom hero cat height; on tablets the width cap keeps room for the email and back-to-top beside it. */
  heroHeight: "max(320px, min(66vh, 760px, 46vw))",
  heroHeightMobile: "min(56vh, 520px)",
  /** "Copied!" shows this long. */
  copiedMs: 1800,
};
