import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CAT } from "../../config/home";
import { SHOP, SHOP_HEROES } from "../../config/shop";
import type { ProductCategory } from "../../data/products";
import { useLocale } from "../../i18n";
import { launchRocket } from "../../lib/rocket";
import { Cat } from "../Cat";
import { ContactForm } from "./ContactForm";

type Props = {
  category: ProductCategory;
  /** The page title: "Back to top" moves focus there. */
  titleRef: RefObject<HTMLHeadingElement | null>;
};

const heroCss = `:root{--shop-hero-h:${SHOP.heroHeightMobile}}@media (min-width:768px){:root{--shop-hero-h:${SHOP.heroHeight}}}`;

/**
 * The end of a shop page: the "Email me" form on a card that floats a little above the ground,
 * centred, and right under it the page's cat in the home cat's arch frame, standing on the bottom
 * edge. "Back to top" sits in the bottom end corner (mirrored in RTL).
 */
export function ShopBottomHero({ category, titleRef }: Props) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const appear = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } }
    : { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { type: "spring" as const, bounce: 0, duration: 0.9 } };

  return (
    <section aria-labelledby="contact-title" className="relative mt-24 flex w-full flex-col items-center sm:mt-32">
      <style>{heroCss}</style>
      <motion.div {...appear} viewport={{ once: true, amount: 0.3 }} className="relative z-10 mb-12 w-full max-w-[440px] px-5 sm:mb-16">
        {/* Hovering just off the ground: a slow bob, with the shadow below it breathing along. */}
        <div className={reduce ? "" : "contact-float"}>
          <div
            data-eyes-avoid=""
            data-cart-avoid=""
            className="contact-card glass relative rounded-[26px] border px-6 pb-7 pt-6 sm:px-8 sm:pb-8 sm:pt-7"
            style={{
              background: "var(--t-surface)",
              borderColor: "var(--t-border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 22px 48px -20px rgba(0,0,0,0.35), 0 36px 70px -36px var(--t-glow)",
            }}
          >
            <ContactForm />
          </div>
        </div>
        <span aria-hidden="true" className={`contact-ground pointer-events-none absolute inset-x-12 -bottom-6 h-5 rounded-[50%] ${reduce ? "" : "contact-ground-anim"}`} />
      </motion.div>

      {/* The cat stands on the bottom edge: nothing follows this section. */}
      <div data-cart-avoid="" className="relative" style={{ height: "var(--shop-hero-h)", aspectRatio: CAT.aspect }}>
        <Cat placement={{ height: 100, bottom: 0 }} photo={SHOP_HEROES[category]} alt={t(`shop.heroAlt.${category}`)} />
      </div>

      <div className="absolute bottom-4 end-4 z-30 sm:bottom-6 sm:end-6">
        <BackToTop titleRef={titleRef} />
      </div>
    </section>
  );
}

/**
 * A plain outline circle with an up arrow. Clicking launches it like a rocket (src/lib/rocket.ts)
 * while the page scrolls up with it; it quietly fades back in the next time this section shows.
 */
function BackToTop({ titleRef }: { titleRef: RefObject<HTMLHeadingElement | null> }) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [launched, setLaunched] = useState(false);
  const away = useRef(false);

  // Back in place once the section has left the screen and comes into view again.
  useEffect(() => {
    const el = ref.current?.closest("section");
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
      className="top-btn grid size-12 place-items-center rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4"
      style={{ outlineColor: "var(--t-accent)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
