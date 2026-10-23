import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocale } from "../i18n";
import { launchRocket } from "../lib/rocket";

/**
 * A plain outline circle with an up arrow. Clicking launches it like a rocket (src/lib/rocket.ts)
 * while the page scrolls up with it; it quietly fades back in the next time the footer shows.
 * Focus then moves to `titleRef` (the page title).
 */
export function BackToTop({ titleRef }: { titleRef: RefObject<HTMLElement | null> }) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const away = useRef(false);

  // Back in place once the footer has left the screen and comes into view again.
  useEffect(() => {
    const el = ref.current?.closest("footer, section");
    if (!el || !launched) return;
    away.current = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) away.current = true;
      else if (away.current) setLaunched(false);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [launched]);

  const focusTitle = () => titleRef.current?.focus({ preventScroll: true });

  const onClick = () => {
    const button = ref.current;
    if (reduce || !button) {
      window.scrollTo({ top: 0, behavior: "instant" });
      focusTitle();
      return;
    }
    if (launched) return;
    launchRocket(button, focusTitle);
    setLaunched(true);
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={t("shop.top")}
      data-launched={launched}
      data-eyes-avoid=""
      data-cart-avoid=""
      className="top-btn grid size-12 shrink-0 place-items-center rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4"
      style={{ outlineColor: "var(--t-accent)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
