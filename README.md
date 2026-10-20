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
- `src/data/pages.ts`: routes for the 4 sub-pages (`/me`, `/products`, `/vapes`, `/contact`); the old `/page-1…4` redirect.
- `src/components/Hero.tsx`: the home poster. The joints' head origin, angles and size, the smoke, the sound and the eyes are all tuned in `src/config/home.ts`.
- `scripts/cutout-joint.mjs`: rebuilds `public/photo/joint-cutout.webp/.png` from `photos/joint1.jpg` (`node scripts/cutout-joint.mjs`).
- `src/components/TopBar.tsx`: the top bar with the language switcher, label and menu.
- `src/components/PageLayout.tsx`: the shared layout for `/page-1` … `/page-4`.
