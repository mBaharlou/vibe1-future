import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = { spokes?: number; className?: string; style?: CSSProperties };

/** Thin gray starburst used as decoration beside the figure. */
export function Sparkle({ spokes = 10, className, style }: Props) {
  const reduce = useReducedMotion();
  const lines = Array.from({ length: spokes }, (_, i) => {
    const angle = (i / spokes) * Math.PI * 2;
    const length = i % 2 === 0 ? 46 : 30;
    return {
      x1: Math.cos(angle) * 7,
      y1: Math.sin(angle) * 7,
      x2: Math.cos(angle) * length,
      y2: Math.sin(angle) * length,
    };
  });

  return (
    <motion.svg
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      className={className}
      style={style}
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 60, ease: "linear", repeat: Infinity }}
    >
      {lines.map((l, i) => (
        <line key={i} {...l} stroke="#9c9c9c" strokeWidth={2.4} strokeLinecap="round" />
      ))}
    </motion.svg>
  );
}
