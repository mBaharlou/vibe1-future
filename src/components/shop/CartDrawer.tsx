import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PRODUCT_IMAGES } from "../../config/shop";
import { useLocale } from "../../i18n";
import { useCart } from "../../lib/cart";
import { AddControl } from "./ProductCard";

const MOBILE = "(max-width: 639px)";
const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE).matches);
  useEffect(() => {
    const query = window.matchMedia(MOBILE);
    const onChange = () => setMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

/** The cart: a themed drawer from the end side (a bottom sheet on phones). Showcase only. */
export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { t, price, dir } = useLocale();
  const reduce = useReducedMotion();
  const mobile = useMobile();
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus trap.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
    else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
  };

  const from = mobile ? { y: "100%" } : { x: dir === "rtl" ? "-100%" : "100%" };
  const to = mobile ? { y: 0 } : { x: 0 };

  return (
    <div className="fixed inset-0 z-[75]">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onKeyDown={onKeyDown}
        className={`absolute flex flex-col shadow-[0_0_60px_-10px_rgba(0,0,0,0.5)] ${mobile ? "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl" : "inset-y-0 end-0 w-[min(420px,100vw)]"}`}
        style={{ background: "var(--t-surface)", color: "var(--t-text)", borderInlineStart: mobile ? undefined : "1px solid var(--t-border)" }}
        initial={reduce ? { opacity: 0 } : from}
        animate={reduce ? { opacity: 1 } : to}
        exit={reduce ? { opacity: 0 } : from}
        transition={reduce ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.4 }}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--t-border)" }}>
          <h2 id="cart-title" className="text-lg font-extrabold">
            {t("shop.cart.title")}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("shop.cart.close")}
            className="grid size-10 place-items-center rounded-full outline-none hover:bg-[color-mix(in_srgb,var(--t-text)_8%,transparent)] focus-visible:outline-[3px]"
            style={{ outlineColor: "var(--t-text)" }}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          {cart.lines.length === 0 ? (
            <p className="py-10 text-center" style={{ color: "var(--t-text-muted)" }}>
              {t("shop.cart.empty")}
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--t-border)" }}>
              {cart.lines.map(({ product, qty }) => {
                const image = PRODUCT_IMAGES[product.image];
                const name = t(product.nameKey);
                return (
                  <li key={product.id} className="flex items-center gap-3 py-3" style={{ borderColor: "var(--t-border)" }}>
                    <span
                      className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl"
                      style={{ background: "var(--t-bg)" }}
                    >
                      <picture>
                        <source srcSet={image.webp} type="image/webp" />
                        <img src={image.fallback} alt="" width={64} height={64} loading="lazy" className="size-16 object-cover" />
                      </picture>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{name}</p>
                      <p className="text-sm" style={{ color: "var(--t-text-muted)" }}>
                        {t("shop.cart.each", { price: price(product.price) })}
                      </p>
                    </div>
                    <AddControl compact name={name} qty={qty} onAdd={() => cart.add(product.id)} onSet={(n) => cart.setQty(product.id, n)} />
                    <button
                      type="button"
                      onClick={() => cart.remove(product.id)}
                      aria-label={t("shop.cart.remove", { name })}
                      className="grid size-9 shrink-0 place-items-center rounded-full outline-none hover:bg-[color-mix(in_srgb,var(--t-text)_8%,transparent)] focus-visible:outline-[3px]"
                      style={{ color: "var(--t-text-muted)", outlineColor: "var(--t-text)" }}
                    >
                      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="shrink-0 space-y-3 border-t px-5 py-4" style={{ borderColor: "var(--t-border)", paddingBottom: mobile ? "max(16px, env(safe-area-inset-bottom))" : undefined }}>
          <div className="flex items-center justify-between text-base font-bold">
            <span>{t("shop.cart.subtotal")}</span>
            <span className="tabular-nums" aria-live="polite">
              {price(cart.subtotal)}
            </span>
          </div>
          <button
            type="button"
            disabled
            className="h-12 w-full cursor-not-allowed rounded-full font-bold opacity-55"
            style={{ background: "var(--t-accent)", color: "var(--t-on-accent)" }}
          >
            {t("shop.cart.checkout")}
          </button>
          <button
            type="button"
            onClick={cart.clear}
            disabled={!cart.lines.length}
            className="h-10 w-full rounded-full text-sm font-semibold underline-offset-4 outline-none hover:underline focus-visible:outline-[3px] disabled:opacity-40 disabled:hover:no-underline"
            style={{ color: "var(--t-text-muted)", outlineColor: "var(--t-text)" }}
          >
            {t("shop.cart.clear")}
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
