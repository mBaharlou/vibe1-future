import { LANG_SWITCH } from "../config/home";

// Small smoke wisps for the language switcher. A fixed full-width canvas across the top of the
// viewport (pointer-events: none) so coordinates are plain client coordinates. The rAF loop only
// runs while particles are alive. Visually it follows the cat smoke, but smaller and subtler.

type Wisp = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  start: number;
  life: number;
  r0: number;
  r1: number;
  alpha: number;
  sprite: number;
  /** Condense: fade in then out while gathering. Dissolve: fade out while drifting. */
  kind: "condense" | "dissolve";
  sway: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const CANVAS_HEIGHT = 140;

function makeSprite(color: string) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.55, `${color}aa`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export function createWisps(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const sprites = LANG_SWITCH.colors.map(makeSprite);
  let wisps: Wisp[] = [];
  let raf = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const frame = (now: number) => {
    ctx.clearRect(0, 0, window.innerWidth, CANVAS_HEIGHT);
    wisps = wisps.filter((w) => now < w.start + w.life);
    for (const w of wisps) {
      const t = (now - w.start) / w.life;
      if (t < 0) continue;
      const e = easeOut(t);
      const x = w.from.x + (w.to.x - w.from.x) * e + Math.sin(t * Math.PI * 2) * w.sway;
      const y = w.from.y + (w.to.y - w.from.y) * e;
      const r = w.r0 + (w.r1 - w.r0) * e;
      ctx.globalAlpha = w.kind === "condense" ? w.alpha * Math.sin(Math.PI * t) : w.alpha * (1 - t) ** 1.4;
      ctx.drawImage(sprites[w.sprite], x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    raf = wisps.length ? requestAnimationFrame(frame) : 0;
  };
  const run = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const spot = (box: DOMRect) => ({ x: rand(box.left + 4, box.right - 4), y: rand(box.top + box.height * 0.3, box.bottom - box.height * 0.3) });
  const base = (delay: number, life: number) => ({
    start: performance.now() + delay,
    life,
    sprite: Math.floor(Math.random() * sprites.length),
  });
  const [rMin, rMax] = LANG_SWITCH.particleRadius;

  return {
    /** Wisps drift in from around the element and gather onto it. */
    condense(el: Element, delay = 0) {
      const box = el.getBoundingClientRect();
      for (let i = 0; i < LANG_SWITCH.particles; i++) {
        const to = spot(box);
        const angle = rand(0, Math.PI * 2);
        const dist = rand(14, 30);
        wisps.push({
          ...base(delay + rand(0, 90), LANG_SWITCH.condenseMs * rand(0.7, 0.95)),
          kind: "condense",
          from: { x: to.x + Math.cos(angle) * dist, y: to.y + Math.sin(angle) * dist * 0.6 + 6 },
          to,
          r0: rand(rMin, rMax) * 1.6,
          r1: rand(rMin, rMax) * 0.7,
          alpha: rand(0.35, 0.6),
          sway: rand(-2, 2),
        });
      }
      run();
    },
    /** The element breaks up into wisps that rise and fade. */
    dissolve(el: Element, delay = 0) {
      const box = el.getBoundingClientRect();
      for (let i = 0; i < LANG_SWITCH.particles; i++) {
        const from = spot(box);
        wisps.push({
          ...base(delay + rand(0, 140), LANG_SWITCH.dissolveMs * rand(0.7, 1)),
          kind: "dissolve",
          from,
          to: { x: from.x + rand(-8, 8), y: from.y - rand(12, 26) },
          r0: rand(rMin, rMax) * 0.8,
          r1: rand(rMin, rMax) * 2,
          alpha: rand(0.3, 0.55),
          sway: rand(-3, 3),
        });
      }
      run();
    },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}

export const WISP_CANVAS_HEIGHT = CANVAS_HEIGHT;
