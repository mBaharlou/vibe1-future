# vibe1-future
all updates about ai, agents and vibe coding

Poster-style landing page built with Vite, React, TypeScript, Tailwind CSS, React Router, Framer Motion and i18next (English, Turkish, Persian with RTL).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where things live

- `public/photo/main-cat.jpg`: the hero cat. Crop, mouth position and every animation value live in `src/config/home.ts`.
- `src/locales/en.json`, `tr.json`, `fa.json`: every piece of text on the site (same keys in each; `TRANSLATIONS.md` lists them side by side).
- `src/data/pages.ts`: paths and colors for the 4 sub-pages.
- `src/components/Hero.tsx`: the home poster. Shard positions for wide and tall screens are in `src/config/home.ts`.
- `src/components/TopBar.tsx`: the top bar with the language switcher, label and menu.
- `src/components/PageLayout.tsx`: the shared layout for `/page-1` … `/page-4`.
