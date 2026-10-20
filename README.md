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
- `src/components/Hero.tsx`: the home poster and the joint lighting. Head origin, angles, lighting times, smoke, sound and the wordmark fill are tuned in `src/config/home.ts`.
- `src/components/Eyes.tsx`: the eyes on every page. Anything marked `data-eyes-avoid` is kept clear; physics values are in `EYES` in `src/config/home.ts`.
- `src/assets/joint-pattern.svg`: the flower-power tile inside the "JOINT" letters.
- `scripts/cutout-joint.mjs`: rebuilds `public/photo/joint-cutout.webp/.png` from `photos/joint1.jpg` (`node scripts/cutout-joint.mjs`).
- `src/components/TopBar.tsx`: the top bar: sound toggle, language switcher, name/GitHub link and menu.
- `src/components/PageLayout.tsx`: the shared layout for `/me`, `/products`, `/vapes` and `/contact`.
