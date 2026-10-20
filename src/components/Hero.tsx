import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pages } from "../data/pages";
import { LAYOUTS, TALL_BELOW } from "../config/home";
import { Cat } from "./Cat";
import { Haze } from "./Haze";
import { Shard } from "./Shard";
import { SmokeCanvas } from "./SmokeCanvas";
import { Sparkle } from "./Sparkle";

export function Hero() {
  const [active, setActive] = useState<number | null>(null);
  const [catHover, setCatHover] = useState(false);
  const [burstAt, setBurstAt] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0, kind: "wide" as keyof typeof LAYOUTS });
  const layout = LAYOUTS[frame.kind];

  // Pick the composition that suits the stage, then fit the largest frame of that ratio.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const kind = width / height < TALL_BELOW ? "tall" : "wide";
      const { ratio } = LAYOUTS[kind];
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

      <Haze thick={catHover} />

      {/* Stage: fills the remaining height; the frame sits bottom-centre inside it. */}
      <div ref={stageRef} className="relative min-h-[300px] flex-1">
        <div
          className="absolute bottom-0 left-1/2"
          style={{ width: frame.width, height: frame.height, transform: "translateX(-50%)" }}
        >
          {/* layout.shards is sorted left → right, so shard i opens pages[i]. Tab order follows. */}
          {layout.shards.map((shape, i) => {
            const page = pages[i];
            return (
              <Shard
                key={page.id}
                page={page}
                shape={shape}
                index={i}
                active={active === page.id}
                dimmed={active !== null && active !== page.id}
                onEnter={setActive}
                onLeave={(id) => setActive((cur) => (cur === id ? null : cur))}
              />
            );
          })}

          {layout.sparkles.map((s, i) => (
            <Sparkle
              key={i}
              spokes={i === 0 ? 10 : 12}
              className="absolute z-[15]"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%` }}
            />
          ))}

          <Cat
            ref={catRef}
            height={layout.cat}
            onHoverChange={setCatHover}
            onTap={() => setBurstAt(Date.now())}
          />

          <SmokeCanvas hovering={catHover} burstAt={burstAt} catRef={catRef} />
        </div>
      </div>
    </motion.main>
  );
}
