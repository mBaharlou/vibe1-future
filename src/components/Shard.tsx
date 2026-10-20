import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PageData } from "../data/pages";
import { ShardPreview } from "./ShardPreview";
import { useShardTransition } from "./ShardTransition";

export type ShardShape = {
  /** Position and size as % of the hero frame (width % sets both sides of a square box). */
  left: number;
  top: number;
  width: number;
  rotate: number;
  /** Polygon points in a 0–100 box. */
  points: string;
  side: "left" | "right";
};

type Props = {
  page: PageData;
  shape: ShardShape;
  active: boolean;
  dimmed: boolean;
  onEnter: (id: number) => void;
  onLeave: (id: number) => void;
};

export function Shard({ page, shape, active, dimmed, onEnter, onLeave }: Props) {
  const reduce = useReducedMotion();
  const startTransition = useShardTransition();
  const polygonRef = useRef<SVGPolygonElement>(null);
  const tap = useRef({ touch: false, wasActive: false });
  const [touch, setTouch] = useState(false);
  const previewId = `shard-preview-${page.id}`;

  const open = () => {
    const polygon = polygonRef.current;
    const matrix = polygon?.getScreenCTM();
    if (!polygon || !matrix) return;
    const points = Array.from(polygon.points, (p) => {
      const screen = new DOMPoint(p.x, p.y).matrixTransform(matrix);
      return { x: screen.x, y: screen.y };
    });
    startTransition({ color: page.color, path: page.path, points });
  };

  return (
    <div
      data-shard
      className="pointer-events-none absolute aspect-square"
      style={{ left: `${shape.left}%`, top: `${shape.top}%`, width: `${shape.width}%` }}
    >
      <motion.a
        href={page.path}
        aria-label={`Open Page ${page.id}`}
        aria-describedby={active ? previewId : undefined}
        className="pointer-events-none relative z-10 block h-full w-full rounded-lg outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        style={{ rotate: shape.rotate }}
        animate={{
          scale: active && !reduce ? 1.15 : 1,
          opacity: dimmed ? 0.4 : 1,
          filter: active
            ? "brightness(1.12) drop-shadow(0px 14px 18px rgba(0,0,0,0.28))"
            : "brightness(1) drop-shadow(0px 0px 0px rgba(0,0,0,0))",
        }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 22 }}
        onPointerDown={(e) => {
          tap.current = { touch: e.pointerType === "touch", wasActive: active };
          setTouch(e.pointerType === "touch");
        }}
        onPointerEnter={(e) => e.pointerType !== "touch" && onEnter(page.id)}
        onPointerLeave={(e) => e.pointerType !== "touch" && onLeave(page.id)}
        onFocus={() => onEnter(page.id)}
        onBlur={() => onLeave(page.id)}
        onClick={(e) => {
          e.preventDefault();
          // Touch: first tap opens the preview, second tap navigates.
          // e.detail is 0 for keyboard activation, which always navigates.
          const { touch: isTouch, wasActive } = tap.current;
          tap.current = { touch: false, wasActive: false };
          if (isTouch && e.detail !== 0 && !wasActive) {
            onEnter(page.id);
            return;
          }
          open();
        }}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true" className="h-full w-full overflow-visible">
          <polygon
            ref={polygonRef}
            points={shape.points}
            fill={page.color}
            // Transparent stroke widens the hit area beyond the painted edge.
            stroke="transparent"
            strokeWidth={16}
            strokeLinejoin="round"
            style={{ pointerEvents: "visible", cursor: "pointer" }}
          />
        </svg>
      </motion.a>

      <AnimatePresence>
        {active && (
          <ShardPreview id={previewId} page={page} side={shape.side} touch={touch} onOpen={open} />
        )}
      </AnimatePresence>
    </div>
  );
}
