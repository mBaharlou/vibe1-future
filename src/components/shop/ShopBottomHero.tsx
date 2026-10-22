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
 * The end of a shop page, everything on the bottom edge: the page's cat in the home cat's arch
 * frame, centred; the "Email me" form at the bottom start corner; "Back to top" at the bottom end
 * corner (mirrored in RTL). Under 768px: the form, then the cat, with "Back to top" in the corner
 * beside it.
 */
export function ShopBottomHero({ category, titleRef }: Props) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const appear = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } }
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, transition: { type: "spring" as const, bounce: 0, duration: 0.9 } };

  return (
    <section
      aria-labelledby="contact-title"
      className="relative mt-24 flex w-full flex-col items-center sm:mt-32 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end"
    >
      <style>{heroCss}</style>
      <motion.div
        {...appear}
        viewport={{ once: true, amount: 0.3 }}
        data-eyes-avoid=""
        data-cart-avoid=""
        className="relative mb-10 w-full max-w-sm px-6 md:mb-0 md:max-w-[360px] md:justify-self-start md:pb-8 md:ps-8 md:pe-6"
      >
        <ContactForm />
      </motion.div>

      {/* The cat stands on the bottom edge: nothing follows this section. */}
      <div data-cart-avoid="" className="relative" style={{ height: "var(--shop-hero-h)", aspectRatio: CAT.aspect }}>
        <Cat placement={{ height: 100, bottom: 0 }} photo={SHOP_HEROES[category]} alt={t(`shop.heroAlt.${category}`)} />
      </div>

      <div className="absolute bottom-4 end-4 z-30 md:static md:justify-self-end md:pb-6 md:pe-6">
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
