import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../../i18n";
import { useCart } from "../../lib/cart";

/** Things the cart button must never cover (the bottom hero's email, back-to-top and cat). */
const AVOID = "[data-cart-avoid]";
const GAP = 14;
const BASE_BOTTOM = 20;
/** Keep clear of the top bar, the Ask-the-cat button and "← Home". */
const MIN_TOP = 140;

/**
 * The floating cart button at the bottom end corner of the shop pages: a bag with a count badge.
 * Hidden while the cart is empty, pops in on the first add, and rises out of the way of the
 * bottom hero section as it scrolls into view.
 */
export function CartButton({ onOpen }: { onOpen: () => void }) {
  const { t, num } = useLocale();
  const reduce = useReducedMotion();
  const cart = useCart();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lift, setLift] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const shown = cart.count > 0;

  // Find the lowest spot (moving up from the corner) that overlaps none of the AVOID areas.
  useEffect(() => {
    let raf = 0;
    const place = () => {
      raf = 0;
      const el = wrapRef.current;
      if (!el) return;
      const size = el.offsetWidth;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      // Its horizontal span doesn't move; only its height on screen.
      const left = rect.left;
      const right = rect.right;
      const boxes = Array.from(document.querySelectorAll(AVOID))
        .map((n) => n.getBoundingClientRect())
        .filter((r) => r.width && r.bottom > 0 && r.top < vh);
      let bottom = vh - BASE_BOTTOM;
      for (let pass = 0; pass < 6; pass++) {
        const hit = boxes.find((r) => r.left - GAP < right && r.right + GAP > left && r.top - GAP < bottom && r.bottom + GAP > bottom - size);
        if (!hit) break;
        bottom = hit.top - GAP;
      }
      setLift(Math.max(0, vh - BASE_BOTTOM - bottom));
      setBlocked(bottom - size < MIN_TOP);
    };
    const schedule = () => (raf ||= requestAnimationFrame(place));
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    // The things it avoids also slide in (entrance animations) without a scroll or resize.
    const recheck = setInterval(schedule, 400);
    return () => {
      clearInterval(recheck);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  const visible = shown && !blocked;

  return (
    <div
      ref={wrapRef}
      data-eyes-avoid={visible ? "" : undefined}
      className="fixed bottom-5 end-5 z-[57]"
      style={{ transform: `translateY(${-lift}px)`, transition: reduce ? "none" : "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <motion.button
        ref={cart.targetRef}
        type="button"
        aria-label={t("shop.cart.open", { n: num(cart.count) })}
        aria-hidden={!visible}
        tabIndex={visible ? undefined : -1}
        onClick={onOpen}
        className="relative grid size-14 place-items-center rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4"
        style={{
          background: "var(--t-accent)",
          color: "var(--t-on-accent)",
          outlineColor: "var(--t-text)",
          boxShadow: "0 12px 30px -10px var(--t-glow), 0 2px 6px rgba(0,0,0,0.2)",
          pointerEvents: visible ? "auto" : "none",
        }}
        initial={false}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: reduce ? 1 : 0.4, opacity: 0 }}
        transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 22 }}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.5 8h13l-1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.1a1.6 1.6 0 0 1-1.6-1.4z" />
          <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
        </svg>
        <motion.span
          key={cart.bump}
          aria-hidden="true"
          className="absolute -end-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-extrabold tabular-nums"
          style={{ background: "var(--t-accent2)", color: "var(--t-on-accent2)", boxShadow: "0 0 0 2px var(--t-bg)" }}
          initial={reduce || !cart.bump ? false : { scale: 1 }}
          animate={reduce ? undefined : { scale: [1, 1.35, 1] }}
          transition={{ duration: 0.36, ease: "easeOut" }}
        >
          {num(cart.count)}
        </motion.span>
      </motion.button>
    </div>
  );
}
