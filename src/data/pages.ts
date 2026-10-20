import { DENIM } from "../config/home";

// The 4 sub-pages, in reading order (joint 1 → 4). Titles and descriptions live in
// src/locales/*.json under pages.<key>; color is the shared accent.
export type PageKey = "me" | "products" | "vapes" | "contact";

export type PageData = {
  id: number;
  key: PageKey;
  color: string;
  path: string;
  /** Old URL that redirects here. */
  legacyPath: string;
};

export const pages: PageData[] = [
  { id: 1, key: "me", color: DENIM.base, path: "/me", legacyPath: "/page-1" },
  { id: 2, key: "products", color: DENIM.base, path: "/products", legacyPath: "/page-2" },
  { id: 3, key: "vapes", color: DENIM.base, path: "/vapes", legacyPath: "/page-3" },
  { id: 4, key: "contact", color: DENIM.base, path: "/contact", legacyPath: "/page-4" },
];
