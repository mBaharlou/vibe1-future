# vibe1-future
all updates about ai, agents and vibe coding

Poster-style landing page built with Vite, React, TypeScript, Tailwind CSS, React Router and Framer Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where things live

- `public/photo/main-cat.jpg`: the hero cat. Crop, mouth position and every animation value live in `src/config/home.ts`.
- `src/data/pages.ts`: titles, descriptions, colors and paths for the 4 sub-pages.
- `src/components/Hero.tsx`: the home poster, plus shard positions for wide and tall screens.
- `src/components/PageLayout.tsx`: the shared layout for `/page-1` … `/page-4`.
