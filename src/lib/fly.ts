import { SHOP } from "../config/shop";

// Fly-to-cart: a small round thumbnail travels on a curve from the card to the cart button,
// shrinking as it goes, and lands with a tiny puff. Web Animations on a fixed element: transform
// and opacity only.

/** A soft puff of the theme's smoke colour at (x, y), removed when it has faded. */
export function puffAt(x: number, y: number, size = 54) {
  const el = document.createElement("span");
  el.className = "shop-land-puff";
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${x - size / 2}px`;
  el.style.top = `${y - size / 2}px`;
  el.style.width = el.style.height = `${size}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

export function flyToCart(from: HTMLElement, to: HTMLElement, src: string, onLand: () => void) {
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const size = 64;
  const start = { x: a.left + a.width / 2 - size / 2, y: a.top + a.height / 2 - size / 2 };
  const end = { x: b.left + b.width / 2 - size / 2, y: b.top + b.height / 2 - size / 2 };
  // Quadratic curve that arcs up over the straight line.
  const ctrl = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - Math.max(120, Math.abs(end.x - start.x) * 0.25) };

  const el = document.createElement("img");
  el.src = src;
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  el.className = "shop-fly";
  el.style.width = el.style.height = `${size}px`;
  document.body.appendChild(el);

  const steps = 18;
  const frames = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x;
    const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y;
    const scale = 1 - 0.6 * t;
    return { transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`, opacity: t > 0.9 ? 1 - (t - 0.9) * 6 : 1 };
  });
  const anim = el.animate(frames, { duration: SHOP.flyMs, easing: "cubic-bezier(0.45, 0, 0.25, 1)" });
  anim.onfinish = () => {
    el.remove();
    puffAt(b.left + b.width / 2, b.top + b.height / 2);
    onLand();
  };
}
