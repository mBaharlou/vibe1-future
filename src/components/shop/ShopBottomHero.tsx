import { useEffect, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CAT } from "../../config/home";
import { CONTACT_EMAIL, SHOP, SHOP_HEROES } from "../../config/shop";
import type { ProductCategory } from "../../data/products";
import { useLocale } from "../../i18n";
import { Cat } from "../Cat";

type Props = {
  category: ProductCategory;
  /** The page title: "Back to top" moves focus there. */
  titleRef: RefObject<HTMLHeadingElement | null>;
};

/**
 * The end of a shop page: the page's cat in the home cat's arch frame, centred and standing on the
 * very bottom edge, "Email me" on its start side and "Back to top" on its end side (mirrored in
 * RTL). Under 768px: email, then back to top, then the cat.
 */
export function ShopBottomHero({ category, titleRef }: Props) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const appear = (from: number) =>
    reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, x: from },
          whileInView: { opacity: 1, x: 0 },
          transition: { type: "spring" as const, bounce: 0, duration: 0.9 },
        };

  return (
    <section
      aria-label={t("shop.email.title")}
      className="relative mx-auto mt-24 flex w-full max-w-[1400px] flex-col items-center gap-10 px-5 sm:mt-32 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-end md:gap-6 lg:gap-8"
    >
      <motion.div {...appear(-40)} viewport={{ once: true, amount: 0.4 }} className="w-full md:mb-[18vh] md:justify-self-end md:self-end">
        <EmailCard />
      </motion.div>

      {/* The cat stands on the bottom edge: nothing follows this section. */}
      <div
        data-cart-avoid=""
        className="relative order-last md:order-none"
        style={{ height: `var(--shop-hero-h)`, aspectRatio: CAT.aspect }}
      >
        <style>{`:root{--shop-hero-h:${SHOP.heroHeightMobile}}@media (min-width:768px){:root{--shop-hero-h:${SHOP.heroHeight}}}`}</style>
        <Cat placement={{ height: 100, bottom: 0 }} photo={SHOP_HEROES[category]} alt={t(`shop.heroAlt.${category}`)} />
      </div>

      <motion.div {...appear(40)} viewport={{ once: true, amount: 0.4 }} className="md:mb-[18vh] md:justify-self-start md:self-end">
        <BackToTop titleRef={titleRef} />
      </motion.div>
    </section>
  );
}

function EmailCard() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      // Older browsers / blocked clipboard: select-and-copy fallback.
      const area = document.createElement("textarea");
      area.value = CONTACT_EMAIL;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), SHOP.copiedMs);
  };

  return (
    <div
      data-eyes-avoid=""
      data-cart-avoid=""
      className="mx-auto w-full max-w-sm rounded-[22px] border p-6 text-center md:mx-0 md:p-5 md:text-start lg:p-6"
      style={{ background: "color-mix(in srgb, var(--t-surface) 88%, transparent)", borderColor: "var(--t-border)", boxShadow: "0 18px 50px -24px var(--t-glow)" }}
    >
      <h2 className="text-2xl font-black tracking-tight md:text-xl lg:text-2xl rtl:tracking-normal" style={{ color: "var(--t-text)" }}>
        {t("shop.email.title")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--t-text-muted)" }}>
        {t("shop.email.line")}
      </p>
      <p dir="ltr" className="mt-4 select-all break-all font-semibold md:text-sm lg:text-base" style={{ color: "var(--t-accent)" }}>
        {CONTACT_EMAIL}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold outline-none transition-transform hover:-translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-2"
          style={{ background: "var(--t-accent)", color: "var(--t-on-accent)", outlineColor: "var(--t-text)" }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
            <path d="M4.5 7l7.5 6 7.5-6" />
          </svg>
          {t("shop.email.button")}
        </a>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? t("shop.email.copied") : t("shop.email.copyLabel")}
          className="inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2"
          style={{ borderColor: "var(--t-accent)", color: "var(--t-text)", outlineColor: "var(--t-text)" }}
        >
          {copied ? t("shop.email.copied") : t("shop.email.copy")}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? t("shop.email.copied") : ""}
        </span>
      </div>
    </div>
  );
}

function BackToTop({ titleRef }: { titleRef: RefObject<HTMLHeadingElement | null> }) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    titleRef.current?.focus({ preventScroll: true });
  };
  return (
    <button
      type="button"
      onClick={toTop}
      data-eyes-avoid=""
      data-cart-avoid=""
      className="shop-top group flex flex-col items-center gap-2 rounded-3xl p-2 outline-none focus-visible:outline-[3px]"
      style={{ outlineColor: "var(--t-text)" }}
    >
      <span
        className="relative grid size-16 place-items-center rounded-full border"
        style={{ background: "var(--t-surface)", borderColor: "var(--t-accent)", color: "var(--t-accent)", boxShadow: "0 14px 36px -16px var(--t-glow)" }}
      >
        <span aria-hidden="true" className="shop-top-wisp" />
        <span aria-hidden="true" className="shop-top-wisp" />
        <svg aria-hidden="true" viewBox="0 0 24 24" className="shop-top-arrow relative size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
        </svg>
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--t-text)" }}>
        {t("shop.top")}
      </span>
    </button>
  );
}
