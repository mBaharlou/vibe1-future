import { useState } from "react";

/** The foreground figure: /hero.png if present, otherwise a gray hooded silhouette. */
export function HeroFigure() {
  const [hasImage, setHasImage] = useState(true);

  if (hasImage) {
    return (
      <img
        src="/hero.png"
        alt="Hooded figure"
        onError={() => setHasImage(false)}
        className="h-full w-full object-contain object-bottom select-none"
        draggable={false}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="Hooded figure placeholder"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d8d8d" />
          <stop offset="100%" stopColor="#5f5f5f" />
        </linearGradient>
        <radialGradient id="face" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#2b2b2b" />
          <stop offset="100%" stopColor="#3f3f3f" />
        </radialGradient>
      </defs>
      <path
        d="M200 30 C128 30 92 92 92 160 C92 206 108 236 124 256 C66 276 28 322 14 400 L0 500 L400 500 L386 400 C372 322 334 276 276 256 C292 236 308 206 308 160 C308 92 272 30 200 30 Z"
        fill="url(#hood)"
      />
      <ellipse cx="200" cy="172" rx="56" ry="72" fill="url(#face)" />
      <path d="M200 262 L200 500" stroke="#555" strokeWidth="3" opacity="0.5" />
    </svg>
  );
}
