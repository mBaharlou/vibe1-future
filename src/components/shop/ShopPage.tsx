import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import forestSvg from "../../assets/forest-pattern.svg?raw";
import skySvg from "../../assets/sky-pattern.svg?raw";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SHOP } from "../../config/shop";
import type { PageData } from "../../data/pages";
import { productsIn, type ProductCategory } from "../../data/products";
import { useLocale } from "../../i18n";
import { useCart } from "../../lib/cart";
import { SiteFooter } from "../SiteFooter";
import { SmokeReveal } from "../SmokeReveal";
import { TopBar } from "../TopBar";
import { CartButton } from "./CartButton";
import { CartDrawer } from "./CartDrawer";
import { ProductCard } from "./ProductCard";
import { ShopBottomHero } from "./ShopBottomHero";

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

/** The page title's letters are filled like the home wordmark, but still: a forest for the Joint
 *  page, a cloudy sky for Vapes (.title-fill in index.css). */
const TITLE_FILLS: Record<ProductCategory, CSSProperties> = {
  joints: {
    "--title-pattern": svgUrl(forestSvg),
    "--title-base": "linear-gradient(180deg, #0b3d1f 0%, #1f6b34 45%, #5fae3e 100%)",
    "--title-scale": "0.9em",
    "--title-solid": "#1f6b34",
  } as CSSProperties,
  vapes: {
    "--title-pattern": svgUrl(skySvg),
    "--title-base": "linear-gradient(180deg, #2b6fd6 0%, #4f9cf5 45%, #a9d4ff 100%)",
    "--title-scale": "1.1em",
    "--title-solid": "#2b6fd6",
  } as CSSProperties,
};

/**
 * /joint and /vapes: the page header, the products on a two-row shelf that scrolls sideways, the
 * page's cat right under them, and the footer. Colours come from the route's theme (ThemeRoot).
 */
export function ShopPage({ page, category }: { page: PageData; category: ProductCategory }) {
  const { t, upper } = useLocale();
  const title = t(`pages.${page.key}.title`);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const closeCart = () => {
    setCartOpen(false);
    cart.targetRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    document.title = t("meta.pageTitle", { title });
  }, [t, title]);

  return (
    <>
      <TopBar home />
      <SmokeReveal />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-x-clip"
        style={{ color: "var(--t-text)" }}
      >
        <header
          className="relative mx-auto flex max-w-[1400px] flex-col items-center px-5 pb-6 text-center sm:px-10 sm:pb-8"
          style={{ paddingTop: "calc(var(--bar-h) + 64px)" }}
        >
          <h1
            ref={titleRef}
            tabIndex={-1}
            data-eyes-avoid=""
            className="title-fill w-fit font-black leading-[0.85] tracking-[-0.045em] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-8 rtl:leading-[1.15] rtl:tracking-normal"
            style={{ fontSize: "clamp(2.5rem, 9vw, 6rem)", outlineColor: "var(--t-accent)", ...TITLE_FILLS[category] }}
          >
            {upper(title)}
          </h1>
          <p data-eyes-avoid="" className="mt-4 w-fit max-w-xl text-lg" style={{ color: "var(--t-text-muted)" }}>
            {t(`pages.${page.key}.description`)}
          </p>
          <p
            data-eyes-avoid=""
            className="mt-3 w-fit text-xs font-semibold uppercase tracking-[0.2em] opacity-90 rtl:tracking-normal"
            style={{ color: "var(--t-text-muted)" }}
          >
            {t("shop.note")}
          </p>
        </header>

        <Shelf category={category} title={title} />

        <ShopBottomHero category={category} />
      </motion.main>
      <SiteFooter titleRef={titleRef} />

      <CartButton onOpen={() => setCartOpen(true)} />
      <AnimatePresence>{cartOpen && <CartDrawer key="cart" onClose={closeCart} />}</AnimatePresence>
    </>
  );
}

/**
 * The products on SHOP.shelf.rows rows (row by row: 1–10 on top, 11–20 below) that scroll
 * sideways together, with previous/next buttons, soft edges and a progress line under it.
 * Mirrored in RTL.
 */
function Shelf({ category, title }: { category: ProductCategory; title: string }) {
  const { t, num, dir } = useLocale();
  const reduce = useReducedMotion();
  const items = productsIn(category);
  const perRow = Math.ceil(items.length / SHOP.shelf.rows);
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ atStart: true, atEnd: false, progress: 0, visible: 1 });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // RTL scrollLeft runs from 0 down to -max; the distance travelled is the same either way.
    const pos = Math.abs(el.scrollLeft);
    setState({
      atStart: pos <= 2,
      atEnd: pos >= max - 2,
      progress: max > 0 ? pos / max : 0,
      visible: el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, dir]);

  const page = (step: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const sign = dir === "rtl" ? -1 : 1;
    el.scrollBy({ left: step * sign * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  const fits = state.visible >= 1;
  const arrow = (step: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => page(step)}
      disabled={disabled}
      aria-label={t(step === 1 ? "shop.shelf.next" : "shop.shelf.prev")}
      data-eyes-avoid=""
      data-cart-avoid=""
      className="shelf-arrow grid size-11 place-items-center rounded-full border outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-35"
      style={{ borderColor: "var(--t-border)", background: "var(--t-surface)", color: "var(--t-text)", outlineColor: "var(--t-accent)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={step === 1 ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
      </svg>
    </button>
  );

  return (
    <section aria-label={t("shop.gridLabel", { title })} className="relative mx-auto max-w-[1600px]">
      <div className="flex items-center justify-between gap-4 px-5 sm:px-10">
        <p data-eyes-avoid="" className="text-xs font-semibold uppercase tracking-[0.18em] rtl:tracking-normal" style={{ color: "var(--t-text-muted)" }}>
          {t("shop.shelf.count", { n: num(items.length) })}
        </p>
        {!fits && (
          <div className="flex gap-2">
            {arrow(-1, state.atStart)}
            {arrow(1, state.atEnd)}
          </div>
        )}
      </div>

      <ul
        ref={ref}
        onScroll={measure}
        data-at-start={state.atStart}
        data-at-end={state.atEnd}
        // overflow-y hidden: the cards' landing puff pokes out a little, and a shelf that could
        // scroll vertically would swallow the mouse wheel instead of scrolling the page.
        className="shelf mt-2 grid overflow-x-auto overflow-y-hidden overscroll-x-contain px-5 pb-8 pt-5 sm:px-10"
        style={{
          gridTemplateColumns: `repeat(${perRow}, ${SHOP.shelf.cardWidth})`,
          gridTemplateRows: `repeat(${SHOP.shelf.rows}, auto)`,
          gap: SHOP.shelf.gap,
        }}
      >
        {items.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} columns={perRow} />
        ))}
      </ul>

      {!fits && (
        <div aria-hidden="true" className="mx-5 h-1 overflow-hidden rounded-full sm:mx-10" style={{ background: "var(--t-border)" }}>
          <div
            className="shelf-progress h-full rounded-full"
            style={{
              width: `${state.visible * 100}%`,
              background: "var(--t-accent)",
              transform: `translateX(${(dir === "rtl" ? -1 : 1) * state.progress * (1 / state.visible - 1) * 100}%)`,
            }}
          />
        </div>
      )}
    </section>
  );
}
