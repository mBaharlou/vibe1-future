import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PageData } from "../data/pages";
import { COLOR_DRIFT, DWELL_MS, FLOAT, GLOW, HOVER, INTRO, type ShardGeometry } from "../config/home";
import { shiftLightness } from "../lib/color";
import { ShardPreview } from "./ShardPreview";
import { useShardTransition } from "./ShardTransition";

type Props = {
  page: PageData;
  shape: ShardGeometry;
  /** Position in the left → right order; used to offset ambient loops. */
  index: number;
  active: boolean;
  dimmed: boolean;
  onEnter: (id: number) => void;
  onLeave: (id: number) => void;
};

// Spread a 0–1 value per shard so the four loops never line up.
const spread = (index: number, salt: number) => ((index * 0.618 + salt) % 1 + 1) % 1;

export function Shard({ page, shape, index, active, dimmed, onEnter, onLeave }: Props) {
  const reduce = useReducedMotion();
  const startTransition = useShardTransition();
  const polygonRef = useRef<SVGPolygonElement>(null);
  const [hovering, setHovering] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const side = shape.left + shape.width / 2 < 50 ? "left" : "right";
  const previewId = `shard-preview-${page.id}`;

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO.fadeMs + index * INTRO.staggerMs);
    return () => clearTimeout(t);
  }, [index]);

  const open = useCallback(() => {
    const polygon = polygonRef.current;
    const matrix = polygon?.getScreenCTM();
    if (!polygon || !matrix) return;
    const points = Array.from(polygon.points, (p) => {
      const screen = new DOMPoint(p.x, p.y).matrixTransform(matrix);
      return { x: screen.x, y: screen.y };
    });
    startTransition({ color: page.color, path: page.path, points });
  }, [page, startTransition]);

  // Dwell: hovering for DWELL_MS enters the page. Keyboard focus never auto-navigates.
  useEffect(() => {
    if (!hovering) return;
    const t = setTimeout(open, DWELL_MS);
    return () => clearTimeout(t);
  }, [hovering, open]);

  const vars = {
    "--c": page.color,
    "--c-light": shiftLightness(page.color, COLOR_DRIFT.lightness),
    "--c-dark": shiftLightness(page.color, -COLOR_DRIFT.lightness),
    "--drift-s": `${COLOR_DRIFT.seconds}s`,
    "--drift-delay": `${-spread(index, 0.1) * COLOR_DRIFT.seconds}s`,
    "--float-px": `${FLOAT.px}px`,
    "--float-s": `${FLOAT.minS + spread(index, 0.3) * (FLOAT.maxS - FLOAT.minS)}s`,
    "--float-delay": `${-spread(index, 0.5) * FLOAT.maxS}s`,
    "--glow-min": GLOW.min,
    "--glow-max": GLOW.max,
    "--glow-static": GLOW.staticOpacity,
    "--glow-scale": GLOW.scale,
    "--breathe-s": `${GLOW.minS + spread(index, 0.7) * (GLOW.maxS - GLOW.minS)}s`,
    "--breathe-delay": `${-spread(index, 0.9) * GLOW.maxS}s`,
  } as CSSProperties;

  const glow = (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" style={{ filter: `blur(${GLOW.blurPx}px)` }}>
      <polygon points={shape.points} className="shard-drift" />
    </svg>
  );

  return (
    <div
      className="pointer-events-none absolute aspect-square"
      style={{ left: `${shape.left}%`, top: `${shape.top}%`, width: `${shape.width}%` }}
    >
      <motion.a
        href={page.path}
        aria-label={`Open Page ${page.id}`}
        aria-describedby={active ? previewId : undefined}
        className="pointer-events-none relative z-10 block h-full w-full rounded-lg outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        style={{ rotate: shape.rotate, ...vars }}
        initial={{ opacity: 0 }}
        animate={{ opacity: dimmed ? HOVER.dimOpacity : 1, scale: active && !reduce ? HOVER.scale : 1 }}
        transition={{
          opacity: introDone
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: INTRO.fadeMs / 1000, ease: "easeOut", delay: (index * INTRO.staggerMs) / 1000 },
          scale: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "touch") return;
          setHovering(true);
          onEnter(page.id);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "touch") return;
          setHovering(false);
          onLeave(page.id);
        }}
        onFocus={() => onEnter(page.id)}
        onBlur={() => onLeave(page.id)}
        onClick={(e) => {
          // Click, tap and Enter skip the dwell.
          e.preventDefault();
          open();
        }}
      >
        <div className="shard-float relative h-full w-full">
          {/* Ambient glow breathes; it pauses and hands over to the brighter glow while active. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: active ? 0 : 1 }}
          >
            <div className="shard-breathe h-full w-full" data-paused={active}>
              {glow}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: active ? GLOW.active : 0 }}
          >
            {glow}
          </div>

          <svg viewBox="0 0 100 100" aria-hidden="true" className="relative h-full w-full overflow-visible">
            <polygon
              ref={polygonRef}
              points={shape.points}
              className="shard-drift"
              // Transparent stroke widens the hit area beyond the painted edge.
              stroke="transparent"
              strokeWidth={16}
              strokeLinejoin="round"
              style={{ pointerEvents: "visible", cursor: "pointer" }}
            />
            {/* Dwell progress: draws around the outline, rewinds if the pointer leaves early. */}
            <motion.polygon
              points={shape.points}
              fill="none"
              stroke="#1f1f1f"
              strokeWidth={2.2}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={reduce ? undefined : "1 2"}
              style={{ pointerEvents: "none" }}
              initial={reduce ? { opacity: 0 } : { strokeDashoffset: 1 }}
              animate={reduce ? { opacity: hovering ? 1 : 0 } : { strokeDashoffset: hovering ? 0 : 1 }}
              transition={
                reduce
                  ? { duration: 0.3 }
                  : hovering
                    ? { duration: DWELL_MS / 1000, ease: "linear" }
                    : { duration: HOVER.rewindMs / 1000, ease: "easeOut" }
              }
            />
          </svg>
        </div>
      </motion.a>

      <AnimatePresence>
        {active && (
          <ShardPreview
            id={previewId}
            page={page}
            side={side}
            hint={hovering ? "Keep hovering to enter, or click" : "Press Enter to open"}
            onOpen={open}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
