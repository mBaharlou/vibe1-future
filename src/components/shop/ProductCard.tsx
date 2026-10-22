import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { PRODUCT_IMAGES, SHOP } from "../../config/shop";
import type { Product } from "../../data/products";
import { useLocale } from "../../i18n";
import { useCart } from "../../lib/cart";
import { flyToCart } from "../../lib/fly";
import { playPop } from "../../lib/sound";

type Props = {
  product: Product;
  /** Position in the grid and its row length: the entrance staggers within each row. */
  index: number;
  columns: number;
};

const spring = { stiffness: 220, damping: 24, mass: 0.6 };

/**
 * A product card: rises in as it scrolls into view (with a puff of smoke as it lands), tilts toward
 * the cursor with a glare and a glow on hover, and has a "+" that turns into a quantity stepper.
 * Every colour comes from the page theme.
 */
export function ProductCard({ product, index, columns }: Props) {
  const { t, price } = useLocale();
  const reduce = useReducedMotion();
  const cart = useCart();
  const qty = cart.qtyOf(product.id);
  const image = PRODUCT_IMAGES[product.image];
  const name = t(product.nameKey);
  const [landed, setLanded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const accent2 = index % 2 === 1;
  // A long, flat cut-out (a tube lying down) stands diagonally so it fills the tall image area.
  const wide = image.cutout && image.width / image.height > 2;

  // Tilt toward the pointer, a lift, and a glare that follows it (all springs on transforms).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [0, 1], [SHOP.tilt.maxDeg, -SHOP.tilt.maxDeg]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-SHOP.tilt.maxDeg, SHOP.tilt.maxDeg]), spring);
  const lift = useSpring(useTransform(hover, [0, 1], [0, -SHOP.tilt.lift]), spring);
  const glareX = useSpring(useTransform(px, [0, 1], ["-40%", "40%"]), spring);
  const glareY = useSpring(useTransform(py, [0, 1], ["-40%", "40%"]), spring);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    hover.set(1);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    hover.set(0);
  };

  const onAdd = () => {
    cart.add(product.id);
    playPopSoon();
  };
  // The thumbnail flies to the cart; the pop and the badge bump happen when it lands.
  const playPopSoon = () => {
    const target = cart.targetRef.current;
    const img = imgRef.current;
    if (reduce || !target || !img) {
      cart.ping();
      playPop(SHOP.popVolume);
      return;
    }
    // Wait a frame: on the first add the cart button is only just popping in.
    requestAnimationFrame(() =>
      flyToCart(img, target, img.currentSrc || image.fallback, image.cutout, () => {
        cart.ping();
        playPop(SHOP.popVolume);
      }),
    );
  };

  const delay = reduce ? 0 : ((index % columns) * SHOP.enter.staggerMs) / 1000;

  return (
    <motion.li
      className="relative list-none"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: SHOP.enter.rise, rotate: SHOP.enter.rotate }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0.4, delay } : { type: "spring", bounce: 0, duration: SHOP.enter.duration, delay }}
      onAnimationComplete={() => setLanded(true)}
      style={{ perspective: SHOP.tilt.perspective }}
    >
      {landed && !reduce && <span aria-hidden="true" className="shop-card-puff" />}
      <motion.article
        className="shop-card group relative flex h-full flex-col rounded-[22px]"
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, y: reduce ? 0 : lift, transformStyle: "preserve-3d" }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        {/* Resting shadow, the deeper hover shadow and the accent glow: separate layers so only
            their opacity animates. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[22px]"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.12), 0 10px 30px -14px var(--t-glow)" }}
        />
        <span
          aria-hidden="true"
          className="shop-card-shadow pointer-events-none absolute inset-0 rounded-[22px]"
          style={{ boxShadow: "0 28px 60px -20px rgba(0,0,0,0.45), 0 18px 44px -18px var(--t-glow)" }}
        />
        <span
          aria-hidden="true"
          className="shop-card-glow pointer-events-none absolute -inset-px rounded-[23px]"
          style={{ boxShadow: `0 0 0 1.5px ${accent2 ? "var(--t-accent2)" : "var(--t-accent)"}, 0 0 34px -4px var(--t-glow)` }}
        />

        <div className="relative flex h-full flex-col overflow-hidden rounded-[22px] border" style={{ background: "var(--t-surface)", borderColor: "var(--t-border)" }}>
          {/* Image: a photo filling the area, or a cut-out on a backdrop of the theme's accents. */}
          <div className="relative aspect-[4/5] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: image.cutout
                  ? `radial-gradient(ellipse 80% 70% at 50% 45%, color-mix(in srgb, ${accent2 ? "var(--t-accent2)" : "var(--t-accent)"} 34%, var(--t-surface)) 0%, var(--t-surface) 72%)`
                  : "var(--t-surface)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
              style={{ background: accent2 ? "var(--t-accent2)" : "var(--t-accent)", mixBlendMode: image.cutout ? "normal" : "soft-light" }}
            />
            <picture className="absolute inset-0 block" style={wide ? { transform: "rotate(-32deg) scale(1.3)" } : undefined}>
              <source srcSet={image.webp} type="image/webp" />
              <img
                ref={imgRef}
                src={image.fallback}
                alt=""
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`shop-card-img relative h-full w-full select-none ${image.cutout ? "object-contain p-[12%]" : "object-cover"}`}
                style={image.cutout ? { filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.45))" } : undefined}
              />
            </picture>
            {product.tag && (
              <span
                className="absolute start-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm rtl:tracking-normal"
                style={accent2 ? { background: "var(--t-accent2)", color: "var(--t-on-accent2)" } : { background: "var(--t-accent)", color: "var(--t-on-accent)" }}
              >
                {t(`shop.tags.${product.tag}`)}
              </span>
            )}
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="shop-card-glare pointer-events-none absolute -inset-1/2"
                style={{
                  x: glareX,
                  y: glareY,
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 22%, transparent 42%)",
                }}
              />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1.5 px-5 pb-5 pt-4">
            <h3 className="text-lg font-extrabold leading-tight" style={{ color: "var(--t-text)" }}>
              {name}
            </h3>
            <p className="line-clamp-2 min-h-[2lh] text-sm leading-snug" style={{ color: "var(--t-text-muted)" }}>
              {t(product.taglineKey)}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
              <span className="text-lg font-bold tabular-nums" style={{ color: "var(--t-accent)" }}>
                {price(product.price)}
              </span>
              <AddControl name={name} qty={qty} onAdd={onAdd} onSet={(n) => cart.setQty(product.id, n)} />
            </div>
          </div>
        </div>
      </motion.article>
    </motion.li>
  );
}

/** "+" that morphs into [ − n + ] once the product is in the cart, and back at 0. */
export function AddControl({ name, qty, onAdd, onSet, compact = false }: { name: string; qty: number; onAdd: () => void; onSet: (qty: number) => void; compact?: boolean }) {
  const { t, num } = useLocale();
  const reduce = useReducedMotion();
  const plusRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const wasInCart = useRef(qty > 0);
  const inCart = qty > 0;

  // Keyboard users stay on the control when it changes shape.
  useEffect(() => {
    if (inCart === wasInCart.current) return;
    const focused = document.activeElement;
    const ours = focused === plusRef.current || focused?.closest("[data-stepper]") || focused === document.body;
    wasInCart.current = inCart;
    if (!ours) return;
    (inCart ? moreRef.current : plusRef.current)?.focus({ preventScroll: true });
  }, [inCart]);

  const size = compact ? "size-9" : "size-11";
  const button = `grid ${size} shrink-0 place-items-center rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2`;
  const style = { background: "var(--t-accent)", color: "var(--t-on-accent)", outlineColor: "var(--t-text)" };

  return (
    <motion.div layout={!reduce} transition={{ type: "spring", bounce: 0, duration: 0.35 }} className="rounded-full" style={{ background: "var(--t-accent)" }}>
      {inCart ? (
        <div data-stepper="" role="group" aria-label={t("shop.quantity", { name })} className="flex items-center">
          <button type="button" aria-label={t("shop.decrease", { name })} onClick={() => onSet(qty - 1)} className={button} style={style}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3.5 8h9" />
            </svg>
          </button>
          <span className="min-w-6 text-center text-sm font-bold tabular-nums" style={{ color: "var(--t-on-accent)" }} aria-live="polite">
            {num(qty)}
          </span>
          <button ref={moreRef} type="button" aria-label={t("shop.increase", { name })} onClick={onAdd} className={button} style={style}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
          </button>
        </div>
      ) : (
        <button ref={plusRef} type="button" aria-label={t("shop.add", { name })} onClick={onAdd} className={button} style={style}>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M8 3.5v9M3.5 8h9" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}
