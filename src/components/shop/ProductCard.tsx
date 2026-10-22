import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type Ref } from "react";
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

/** Products gets the minimal editorial card; Vapes keeps the lit, tilting card. */
export function ProductCard(props: Props) {
  return props.product.category === "joints" ? <EditorialCard {...props} /> : <GlowCard {...props} />;
}

/** "+" → stepper, and the fly-to-cart from the card's photo (the pop and badge bump on landing). */
function useAddToCart(product: Product) {
  const reduce = useReducedMotion();
  const cart = useCart();
  const imgRef = useRef<HTMLImageElement>(null);
  const image = PRODUCT_IMAGES[product.image];
  const land = () => {
    cart.ping();
    playPop(SHOP.popVolume);
  };
  const add = () => {
    cart.add(product.id);
    const target = cart.targetRef.current;
    const img = imgRef.current;
    if (reduce || !target || !img) return land();
    // Wait a frame: on the first add the cart button is only just popping in.
    requestAnimationFrame(() => flyToCart(img, target, img.currentSrc || image.fallback, land));
  };
  return { imgRef, qty: cart.qtyOf(product.id), add, setQty: (n: number) => cart.setQty(product.id, n) };
}

/** The entrance every card shares: rise, un-rotate and fade in (staggered per row), then a puff. */
function Entrance({ index, columns, children }: { index: number; columns: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const [landed, setLanded] = useState(false);
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
      {children}
    </motion.li>
  );
}

function Photo({ product, imgRef, className = "" }: { product: Product; imgRef: Ref<HTMLImageElement>; className?: string }) {
  const image = PRODUCT_IMAGES[product.image];
  return (
    <picture className="absolute inset-0 block">
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
        className={`relative h-full w-full select-none object-cover ${className}`}
      />
    </picture>
  );
}

/**
 * Products: no card box and no light. The photo sits on the page in a thin offset frame (a print
 * with a shifted mat) that slides into line on hover while the photo zooms; under it an index, the
 * tag, the name (underlined on hover), the tagline, a hairline, then price and "+".
 */
function EditorialCard({ product, index, columns }: Props) {
  const { t, price, num } = useLocale();
  const { imgRef, qty, add, setQty } = useAddToCart(product);
  const name = t(product.nameKey);
  const number = num(index + 1).padStart(2, num(0));
  return (
    <Entrance index={index} columns={columns}>
      <article className="ed-card group relative">
        <div className="relative">
          <span aria-hidden="true" className="ed-frame pointer-events-none absolute inset-0 rounded-2xl border" style={{ borderColor: "var(--t-accent)" }} />
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl" style={{ background: "var(--t-bg)" }}>
            <Photo product={product} imgRef={imgRef} className="ed-img" />
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-baseline gap-3 text-xs">
            <span className="font-mono tabular-nums" style={{ color: "var(--t-text-muted)" }}>
              {number}
            </span>
            {product.tag && (
              <span className="font-bold uppercase tracking-[0.14em] rtl:tracking-normal" style={{ color: "var(--t-accent)" }}>
                {t(`shop.tags.${product.tag}`)}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-lg font-extrabold leading-tight" style={{ color: "var(--t-text)" }}>
            <span className="ed-name relative">{name}</span>
          </h3>
          <p className="mt-1.5 line-clamp-2 min-h-[2lh] text-sm leading-snug" style={{ color: "var(--t-text-muted)" }}>
            {t(product.taglineKey)}
          </p>
          <hr className="my-4 border-0 border-t" style={{ borderColor: "var(--t-border)" }} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold tabular-nums" style={{ color: "var(--t-text)" }}>
              {price(product.price)}
            </span>
            <AddControl name={name} qty={qty} onAdd={add} onSet={setQty} />
          </div>
        </div>
      </article>
    </Entrance>
  );
}

/**
 * Vapes: a card that tilts toward the cursor with a glare and a glow on hover. Every colour comes
 * from the page theme.
 */
function GlowCard({ product, index, columns }: Props) {
  const { t, price } = useLocale();
  const reduce = useReducedMotion();
  const { imgRef, qty, add, setQty } = useAddToCart(product);
  const name = t(product.nameKey);
  const accent2 = index % 2 === 1;

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

  return (
    <Entrance index={index} columns={columns}>
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
          <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--t-surface)" }}>
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
              style={{ background: accent2 ? "var(--t-accent2)" : "var(--t-accent)", mixBlendMode: "soft-light" }}
            />
            <Photo product={product} imgRef={imgRef} className="shop-card-img" />
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
              <AddControl name={name} qty={qty} onAdd={add} onSet={setQty} />
            </div>
          </div>
        </div>
      </motion.article>
    </Entrance>
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
