// The 4 sub-pages, in reading order (joint 1 → 4). Titles and descriptions live in
// src/locales/*.json under pages.<key>.
import type { ProductCategory } from "./products";

export type PageKey = "me" | "products" | "vapes" | "contact";

export type PageData = {
  id: number;
  key: PageKey;
  path: string;
  /** Old URLs that redirect here. */
  legacyPaths: string[];
  /** Shop pages: which products they show (src/components/shop/ShopPage.tsx). */
  shop?: ProductCategory;
};

export const pages: PageData[] = [
  { id: 1, key: "me", path: "/me", legacyPaths: ["/page-1"] },
  { id: 2, key: "products", path: "/joint", legacyPaths: ["/page-2", "/products"], shop: "joints" },
  { id: 3, key: "vapes", path: "/vapes", legacyPaths: ["/page-3"], shop: "vapes" },
  { id: 4, key: "contact", path: "/contact", legacyPaths: ["/page-4"] },
];
