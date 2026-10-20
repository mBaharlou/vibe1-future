import { DENIM } from "../config/home";

// The 4 sub-pages. Titles and descriptions live in src/locales/*.json under pages.<key>;
// color is the shared denim blue.
export type PageKey = "p1" | "p2" | "p3" | "p4";

export type PageData = {
  id: number;
  key: PageKey;
  color: string;
  path: string;
};

export const pages: PageData[] = [
  { id: 1, key: "p1", color: DENIM.base, path: "/page-1" },
  { id: 2, key: "p2", color: DENIM.base, path: "/page-2" },
  { id: 3, key: "p3", color: DENIM.base, path: "/page-3" },
  { id: 4, key: "p4", color: DENIM.base, path: "/page-4" },
];
