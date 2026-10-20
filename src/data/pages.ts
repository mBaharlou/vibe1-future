// Content for the 4 sub-pages. Edit titles, descriptions and colors here.
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
    color: "#E0643A",
    path: "/page-1",
  },
  {
    id: 2,
    title: "Page 2",
    description: "Placeholder: a short line about what lives on page two.",
    color: "#D4553A",
    path: "/page-2",
  },
  {
    id: 3,
    title: "Page 3",
    description: "Placeholder: a short line about what lives on page three.",
    color: "#DB5C33",
    path: "/page-3",
  },
  {
    id: 4,
    title: "Page 4",
    description: "Placeholder: a short line about what lives on page four.",
    color: "#C9452B",
    path: "/page-4",
  },
];

export const getPage = (id: number) => pages.find((p) => p.id === id);
