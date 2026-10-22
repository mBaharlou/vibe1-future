import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SHOP } from "../../config/shop";
import type { PageData } from "../../data/pages";
import { productsIn, type ProductCategory } from "../../data/products";
import { useLocale } from "../../i18n";
import { useCart } from "../../lib/cart";
import { SmokeReveal } from "../SmokeReveal";
import { TopBar } from "../TopBar";
import { CartButton } from "./CartButton";
import { CartDrawer } from "./CartDrawer";
import { ProductCard } from "./ProductCard";
import { ShopBottomHero } from "./ShopBottomHero";

/** How many cards a grid row holds right now (matches the grid's breakpoints). */
function useColumns() {
  const count = () => 1 + SHOP.columnsFrom.filter((px) => window.matchMedia(`(min-width: ${px}px)`).matches).length;
  const [columns, setColumns] = useState(count);
  useEffect(() => {
    const queries = SHOP.columnsFrom.map((px) => window.matchMedia(`(min-width: ${px}px)`));
    const onChange = () => setColumns(count());
    queries.forEach((q) => q.addEventListener("change", onChange));
    return () => queries.forEach((q) => q.removeEventListener("change", onChange));
  }, []);
  return columns;
}

/**
 * /products and /vapes: the page header, a grid of 12 product cards, and the bottom hero with the
 * page's cat, "Email me" and "Back to top". Colours come from the route's theme (ThemeRoot).
 */
export function ShopPage({ page, category }: { page: PageData; category: ProductCategory }) {
  const { t, upper } = useLocale();
  const title = t(`pages.${page.key}.title`);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const columns = useColumns();
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const closeCart = () => {
    setCartOpen(false);
    cart.targetRef.current?.focus({ preventScroll: true });
  };
  const items = productsIn(category);

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
        className="relative min-h-svh overflow-x-clip"
        style={{ background: "var(--t-bg-gradient)", color: "var(--t-text)" }}
      >
        <header className="relative mx-auto max-w-[1400px] px-5 pb-10 sm:px-10 sm:pb-14" style={{ paddingTop: "calc(var(--bar-h) + 84px)" }}>
          <h1
            ref={titleRef}
            tabIndex={-1}
            data-eyes-avoid=""
            className="w-fit font-black leading-[0.85] tracking-[-0.045em] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-8 rtl:leading-[1.15] rtl:tracking-normal"
            style={{ fontSize: "clamp(3rem, 14vw, 9rem)", color: "var(--t-text)", outlineColor: "var(--t-accent)" }}
          >
            {upper(title)}
          </h1>
          <p data-eyes-avoid="" className="mt-5 w-fit max-w-xl text-lg" style={{ color: "var(--t-text-muted)" }}>
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

        <ul
          aria-label={t("shop.gridLabel", { title })}
          // 4 columns from 1100px, 3 from 820px, 2 from 520px: 12 cards always fill whole rows.
          className={`mx-auto grid max-w-[1400px] grid-cols-1 px-5 min-[520px]:grid-cols-2 min-[820px]:grid-cols-3 min-[1100px]:grid-cols-4 sm:px-10 ${
            category === "joints" ? "gap-x-8 gap-y-14" : "gap-6 sm:gap-7"
          }`}
        >
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} columns={columns} />
          ))}
        </ul>

        <ShopBottomHero category={category} titleRef={titleRef} />
      </motion.main>

      <CartButton onOpen={() => setCartOpen(true)} />
      <AnimatePresence>{cartOpen && <CartDrawer key="cart" onClose={closeCart} />}</AnimatePresence>
    </>
  );
}
