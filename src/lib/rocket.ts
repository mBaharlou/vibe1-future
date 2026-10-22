import { SHOP } from "../config/shop";

// "Back to top" as a rocket launch. A copy of the button is lifted onto a fixed layer at the same
// spot (the real one stays hidden until the bottom section comes back into view):
//   1. ignition: it trembles and smoke puffs out from below it;
//   2. lift-off: it accelerates straight up the screen, leaving a thick smoke trail, while the page
//      scrolls to the top in step with it (both arrive together, ease-in);
//   3. a last puff at the top, then `onTop` (focus the page title).
// The smoke is drawn on a temporary full-screen canvas (pointer-events: none), removed when the
// last puff has faded.

type Puff = { x: number; y: number; vx: number; vy: number; r0: number; r1: number; age: number; life: number; alpha: number; sprite: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** #rrggbb mixed toward black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const to = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * k)).join(",")})`;
}

// A soft, round puff: solid in the middle, fading out to nothing (overlapping puffs build up a
// thick trail without showing rings).
function makeSprite(color: string) {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const rgb = color.slice(4, -1);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.35, `rgba(${rgb},0.85)`);
  g.addColorStop(0.7, `rgba(${rgb},0.3)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export function launchRocket(button: HTMLElement, onTop: () => void) {
  const rect = button.getBoundingClientRect();
  const smoke = getComputedStyle(document.documentElement).getPropertyValue("--t-smoke").trim() || "#9a9590";
  const sprites = [makeSprite(shade(smoke, 0)), makeSprite(shade(smoke, -0.12)), makeSprite(shade(smoke, 0.15))];

  // The rocket: a copy of the button on its own fixed layer.
  const rocket = button.cloneNode(true) as HTMLElement;
  rocket.removeAttribute("id");
  rocket.setAttribute("aria-hidden", "true");
  rocket.tabIndex = -1;
  Object.assign(rocket.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    zIndex: "81",
    pointerEvents: "none",
    visibility: "visible",
    opacity: "1",
    willChange: "transform",
  });
  document.body.appendChild(rocket);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "80", pointerEvents: "none" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const { igniteMs, flyMs, maxPuffs } = SHOP.rocket;
  const startScroll = window.scrollY;
  // Fly until the button is just past the top edge.
  const distance = rect.bottom + 24;
  const cx = rect.left + rect.width / 2;
  let puffs: Puff[] = [];
  let arrived = false;
  let last = performance.now();
  const t0 = last;

  const emit = (x: number, y: number, count: number, kind: "ignite" | "trail" | "final") => {
    for (let i = 0; i < count && puffs.length < maxPuffs; i++) {
      const base = rect.width * (kind === "final" ? 0.7 : kind === "ignite" ? 0.45 : 0.62);
      puffs.push({
        x: x + rand(-rect.width * 0.18, rect.width * 0.18),
        y,
        vx: rand(-1, 1) * (kind === "final" ? 110 : kind === "ignite" ? 60 : 45),
        // Smoke pushed down and out of the nozzle; the trail drifts slowly behind.
        vy: kind === "final" ? rand(-40, 30) : kind === "ignite" ? rand(30, 90) : rand(40, 120),
        r0: base * rand(0.6, 1),
        r1: base * rand(3.5, 6),
        age: 0,
        life: kind === "trail" ? rand(1200, 1900) : rand(800, 1300),
        alpha: kind === "trail" ? rand(0.45, 0.65) : rand(0.5, 0.7),
        sprite: Math.floor(Math.random() * sprites.length),
      });
    }
  };

  const frame = (now: number) => {
    const dt = Math.min(now - last, 40);
    last = now;
    const el = now - t0;

    if (!arrived) {
      if (el < igniteMs) {
        // Ignition: a tremble and the first smoke from below.
        const shake = Math.sin(el * 0.25) * 1.5;
        rocket.style.transform = `translate(${shake.toFixed(2)}px, 0)`;
        emit(cx, rect.bottom - 4, 3, "ignite");
      } else {
        const t = Math.min(1, (el - igniteMs) / flyMs);
        const e = t * t * (1.4 - 0.4 * t); // accelerating, still reaching 1 at t = 1
        const y = -e * distance;
        rocket.style.transform = `translate(0, ${y.toFixed(1)}px)`;
        window.scrollTo({ top: startScroll * (1 - e), behavior: "instant" });
        // The trail, a little thicker as it speeds up.
        emit(cx, rect.bottom + y - 2, 5 + Math.round(t * 4), "trail");
        if (t >= 1) {
          arrived = true;
          rocket.remove();
          window.scrollTo({ top: 0, behavior: "instant" });
          emit(cx, 18, 12, "final");
          onTop();
        }
      }
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    puffs = puffs.filter((p) => (p.age += dt) < p.life);
    for (const p of puffs) {
      const q = p.age / p.life;
      const s = p.age / 1000;
      const x = p.x + p.vx * s * (1 - q * 0.5);
      const y = p.y + p.vy * s * (1 - q * 0.6);
      const size = 2 * (p.r0 + (p.r1 - p.r0) * (1 - (1 - q) ** 2));
      ctx.globalAlpha = p.alpha * (1 - q) ** 1.2 * Math.min(1, q / 0.08 + 0.3);
      ctx.drawImage(sprites[p.sprite], x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    if (!arrived || puffs.length) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
