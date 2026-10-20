import { DENIM } from "../config/home";

// Content for the 4 sub-pages. Edit titles and descriptions here; color is the shared denim blue.
export type PageData = {
  id: number;
  title: string;
  description: string;
  color: string;
  path: string;
};

export const pages: PageData[] = [
  {
    id: 1,
    title: "Page 1",
    description: "Placeholder: a short line about what lives on page one.",
    color: DENIM.base,
    path: "/page-1",
  },
  {
    id: 2,
    title: "Page 2",
    description: "Placeholder: a short line about what lives on page two.",
    color: DENIM.base,
    path: "/page-2",
  },
  {
    id: 3,
    title: "Page 3",
    description: "Placeholder: a short line about what lives on page three.",
    color: DENIM.base,
    path: "/page-3",
  },
  {
    id: 4,
    title: "Page 4",
    description: "Placeholder: a short line about what lives on page four.",
    color: DENIM.base,
    path: "/page-4",
  },
];

export const getPage = (id: number) => pages.find((p) => p.id === id);

/** Home tab title (matches index.html). Sub-pages use "<title> · Claude". */
export const HOME_TITLE = "my vibe coding ai";
export const pageTitle = (title: string) => `${title} · Claude`;
