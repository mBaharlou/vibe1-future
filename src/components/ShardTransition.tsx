import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router";

type Point = { x: number; y: number };
type Start = { color: string; path: string; points: Point[] };

const StartContext = createContext<(start: Start) => void>(() => {});

/** Returns a function that floods the screen from a shard's outline, then navigates. */
export const useShardTransition = () => useContext(StartContext);

const toPolygon = (points: Point[]) =>
  `polygon(${points.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(", ")})`;

// Scale the shard around its centre until every edge clears every viewport corner.
// Keeping the same vertex count lets clip-path interpolate smoothly.
function grow(points: Point[]): Point[] {
  const c = {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
  const w = window.innerWidth;
  const h = window.innerHeight;
  const far = Math.max(
    Math.hypot(c.x, c.y),
    Math.hypot(w - c.x, c.y),
    Math.hypot(c.x, h - c.y),
    Math.hypot(w - c.x, h - c.y),
  );
  let inner = Infinity;
  points.forEach((a, i) => {
    const b = points[(i + 1) % points.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const dist = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / len;
    inner = Math.min(inner, dist);
  });
  const k = (far / Math.max(inner, 1)) * 1.1;
  return points.map((p) => ({ x: c.x + (p.x - c.x) * k, y: c.y + (p.y - c.y) * k }));
}

export function ShardTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<(Start & { key: number }) | null>(null);

  const start = useCallback(
    (next: Start) => setActive((cur) => cur ?? { ...next, key: Date.now() }),
    [],
  );

  const variants = useMemo(() => {
    if (!active) return undefined;
    if (reduce) {
      return { from: { opacity: 0 }, to: { opacity: 1 }, out: { opacity: 0 } };
    }
    return {
      from: { clipPath: toPolygon(active.points) },
      to: { clipPath: toPolygon(grow(active.points)) },
      out: { opacity: 0 },
    };
  }, [active, reduce]);

  return (
    <StartContext.Provider value={start}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.key}
            aria-hidden="true"
            className="fixed inset-0 z-50"
            style={{ background: active.color }}
            variants={variants}
            initial="from"
            animate="to"
            exit="out"
            transition={
              reduce
                ? { duration: 0.25 }
                : { duration: 0.65, ease: [0.65, 0, 0.35, 1], opacity: { duration: 0.5 } }
            }
            onAnimationComplete={(definition) => {
              if (definition !== "to") return;
              navigate(active.path);
              setActive(null);
            }}
          />
        )}
      </AnimatePresence>
    </StartContext.Provider>
  );
}
