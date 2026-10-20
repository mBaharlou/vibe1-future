import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pages } from "../data/pages";
import { HeroFigure } from "./HeroFigure";
import { Shard, type ShardShape } from "./Shard";
import { Sparkle } from "./Sparkle";

type Layout = {
  /** Frame width / height. */
  ratio: number;
  /** Figure height as % of the frame. */
  figure: number;
  shards: Record<number, ShardShape>;
  sparkles: { left: number; top: number; width: number }[];
};

// Two compositions: a wide 5:4 poster and a tall 4:5 one for phones.
// Each shard's inner corner tucks behind the hood so they read as one burst.
const layouts: Record<"wide" | "tall", Layout> = {
  wide: {
    ratio: 1.25,
    figure: 82,
    shards: {
      1: { left: 18, top: 4, width: 26, rotate: -6, points: "2,22 34,2 62,30 98,70 80,98 30,64", side: "left" },
      2: { left: 10, top: 36, width: 28, rotate: 10, points: "0,58 26,20 70,8 100,30 86,64 30,96", side: "left" },
      3: { left: 54, top: 0, width: 28, rotate: 8, points: "96,18 62,0 34,34 4,74 26,100 74,60", side: "right" },
      4: { left: 64, top: 34, width: 27, rotate: -12, points: "100,52 70,14 26,4 0,36 18,70 76,96", side: "right" },
    },
    sparkles: [
      { left: 2, top: 50, width: 6 },
      { left: 92, top: 44, width: 5 },
    ],
  },
  tall: {
    ratio: 0.8,
    figure: 62,
    shards: {
      1: { left: 8, top: 18, width: 36, rotate: -6, points: "2,22 34,2 62,30 98,70 80,98 30,64", side: "left" },
      2: { left: 0, top: 44, width: 34, rotate: 10, points: "0,58 26,20 70,8 100,30 86,64 30,96", side: "left" },
      3: { left: 54, top: 12, width: 38, rotate: 8, points: "96,18 62,0 34,34 4,74 26,100 74,60", side: "right" },
      4: { left: 66, top: 40, width: 34, rotate: -12, points: "100,52 70,14 26,4 0,36 18,70 76,96", side: "right" },
    },
    sparkles: [
      { left: 4, top: 76, width: 9 },
      { left: 86, top: 72, width: 8 },
    ],
  },
};

export function Hero() {
  const [active, setActive] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0, kind: "wide" as keyof typeof layouts });
  const layout = layouts[frame.kind];

  // Pick the composition that suits the stage, then fit the largest frame of that ratio.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const kind = width / height < 0.95 ? "tall" : "wide";
      const { ratio } = layouts[kind];
      const w = Math.min(width, height * ratio);
      setFrame({ width: w, height: w / ratio, kind });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 42%, #f4f4f4 0%, #f4f4f4 38%, #e9e9e9 100%)" }}
      // Tapping empty space closes an open preview on touch screens.
      onPointerDown={(e) => {
        if (!(e.target as Element).closest("[data-shard]")) setActive(null);
      }}
    >
      <span className="absolute right-4 top-4 text-xs font-medium text-neutral-400 sm:right-8 sm:top-6">
        1/10
      </span>

      <header className="relative px-4 pt-10 text-center sm:pt-12">
        <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-neutral-800 sm:text-xs">
          Graphic design prompts for
        </p>
        <h1
          className="mt-2 font-black leading-[0.82] tracking-[-0.045em] text-ink"
          style={{ fontSize: "clamp(3.5rem, min(20.5vw, 30svh), 24rem)" }}
        >
          CLAUDE
        </h1>
        <p className="mt-3 text-sm text-neutral-500 sm:text-base">
          Instantly level up your work using Claude.ai!
        </p>
      </header>

      {/* Stage: fills the remaining height; the 5:4 frame sits bottom-centre inside it. */}
      <div ref={stageRef} className="relative min-h-[300px] flex-1">
        <div
          className="absolute bottom-0 left-1/2"
          style={{ width: frame.width, height: frame.height, transform: "translateX(-50%)" }}
        >
          {pages.map((page) => (
            <Shard
              key={page.id}
              page={page}
              shape={layout.shards[page.id]}
              active={active === page.id}
              dimmed={active !== null && active !== page.id}
              onEnter={setActive}
              onLeave={(id) => setActive((cur) => (cur === id ? null : cur))}
            />
          ))}

          {layout.sparkles.map((s, i) => (
            <Sparkle
              key={i}
              spokes={i === 0 ? 10 : 12}
              className="absolute z-[15]"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%` }}
            />
          ))}

          <div
            className="pointer-events-none absolute bottom-0 left-1/2 z-20 aspect-[4/5]"
            style={{ height: `${layout.figure}%`, transform: "translate(-50%, 3%)" }}
          >
            <HeroFigure />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
