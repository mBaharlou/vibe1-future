import { motion, useReducedMotion } from "framer-motion";
import type { PageData } from "../data/pages";
import { HOVER } from "../config/home";

type Props = {
  id: string;
  page: PageData;
  /** Which half of the poster the shard sits in; the panel opens toward the centre. */
  side: "left" | "right";
  hint: string;
  onOpen: () => void;
};

export function ShardPreview({ id, page, side, hint, onOpen }: Props) {
  const reduce = useReducedMotion();
  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.92, x: side === "left" ? -10 : 10, y: 10 };

  return (
    <motion.div
      id={id}
      role="tooltip"
      onClick={onOpen}
      className="pointer-events-auto absolute bottom-[72%] z-30 w-56 max-w-[62vw] cursor-pointer rounded-xl border-l-4 bg-white/95 p-4 text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      style={{
        borderColor: page.color,
        [side === "left" ? "left" : "right"]: "55%",
        transformOrigin: side === "left" ? "bottom left" : "bottom right",
      }}
      initial={hidden}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ ...hidden, transition: { duration: 0.18, ease: "easeIn" } }}
      transition={{ duration: HOVER.previewMs / 1000, ease: "easeOut" }}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400">Preview</p>
      <h3 className="mt-1 text-lg font-black tracking-tight text-ink">{page.title}</h3>
      <p className="mt-1 text-sm leading-snug text-neutral-600">{page.description}</p>
      <p className="mt-3 text-xs font-medium" style={{ color: page.color }}>
        {hint} →
      </p>
    </motion.div>
  );
}
