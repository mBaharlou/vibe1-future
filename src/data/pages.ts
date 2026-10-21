// The 4 sub-pages, in reading order (joint 1 → 4). Titles and descriptions live in
// src/locales/*.json under pages.<key>.
export type PageKey = "me" | "products" | "vapes" | "contact";

export type PageData = {
  id: number;
  key: PageKey;
  path: string;
  /** Old URL that redirects here. */
  legacyPath: string;
};

export const pages: PageData[] = [
  { id: 1, key: "me", path: "/me", legacyPath: "/page-1" },
  { id: 2, key: "products", path: "/products", legacyPath: "/page-2" },
  { id: 3, key: "vapes", path: "/vapes", legacyPath: "/page-3" },
  { id: 4, key: "contact", path: "/contact", legacyPath: "/page-4" },
];
