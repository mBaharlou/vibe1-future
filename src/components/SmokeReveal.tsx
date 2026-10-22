import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SELECT } from "../config/home";

/** A page opening in its new tab: a soft haze (white-grey, or the page theme's) blurs and fades off it. */
export function SmokeReveal() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65]"
      style={{ background: "var(--t-reveal, radial-gradient(ellipse at 50% 55%, #fbfaf8 0%, #ecebe8 55%, #dedbd6 100%))" }}
      initial={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)", scale: 1 }}
      animate={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(28px)", scale: 1.12 }}
      // Ease in-out, so the haze visibly hangs for a moment before it clears.
      transition={{ duration: SELECT.revealMs / 1000, ease: [0.45, 0, 0.25, 1] }}
      onAnimationComplete={() => setDone(true)}
    />
  );
}
