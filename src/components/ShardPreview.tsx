import { motion, useReducedMotion } from "framer-motion";
import type { PageData } from "../data/pages";
import { HOVER } from "../config/home";

type Props = {
  id: string;
  page: PageData;
  /** Which half of the poster the shard sits in; the label aligns to its outer edge so it stays on screen. */
  side: "left" | "right";
  hint: string;
  onOpen: () => void;
};

/** Compact label that pops up just above a shard. */
export function ShardPreview({ id, page, side, hint, onOpen }: Props) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 };

  return (
    <motion.div
      id={id}
      role="tooltip"
      onClick={onOpen}
      className="pointer-events-auto absolute bottom-[calc(100%+10px)] z-30 w-max max-w-[60vw] cursor-pointer rounded-lg border-l-4 bg-white/95 px-3 py-2 text-left shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      style={{
        borderColor: page.color,
        [side === "left" ? "left" : "right"]: 0,
        transformOrigin: side === "left" ? "bottom left" : "bottom right",
      }}
      initial={hidden}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ ...hidden, transition: { duration: 0.18, ease: "easeIn" } }}
      transition={{ duration: HOVER.previewMs / 1000, ease: "easeOut" }}
    >
      <p className="text-sm font-black tracking-tight text-ink">{page.title}</p>
      <p className="text-[11px] font-medium" style={{ color: page.color }}>
        {hint}
      </p>
    </motion.div>
  );
}
