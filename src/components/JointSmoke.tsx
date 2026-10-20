import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { useReducedMotion } from "framer-motion";
import { JOINT_SMOKE, SELECT } from "../config/home";

export type JointSmokeHandle = {
  /** A big soft puff that swells out from (x, y) over much of the screen, then clears. */
  burst: (x: number, y: number) => void;
};

type Props = {
  ref: Ref<JointSmokeHandle>;
  /** Lit-tip positions in client coordinates, in joint order (null while a tip isn't laid out). */
  getTips: () => ({ x: number; y: number } | null)[];
  /** Index into getTips() of the hovered joint; its smoke is a little thicker. */
  hovered: number | null;
};

type Puff = {
  x0: number;
  y0: number;
  age: number;
  life: number;
  r0: number;
  r1: number;
  alpha: number;
  sprite: number;
  /** Wisp: rise + curl. Burst: move outward by (dx, dy). */
  kind: "wisp" | "burst";
  rise: number;
  phase: number;
  dx: number;
  dy: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

// Same soft round puff as the cat smoke, made here so that code stays untouched.
function makeSprite(color: string) {
  const size = 96;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.5, `${color}cc`);
  g.addColorStop(1, `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

/**
 * One full-viewport canvas for all four joints: a thin wisp from every lit tip, and the burst
 * when a joint is chosen. The loop pauses while the tab is hidden. Reduced motion: no particles
 * (the joints show a faint static haze instead).
 */
export function JointSmoke({ ref, getTips, hovered }: Props) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ getTips, hovered, puffs: [] as Puff[] });
  live.current.getTips = getTips;
  live.current.hovered = hovered;

  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const side = Math.max(window.innerWidth, window.innerHeight);
      for (let i = 0; i < SELECT.burstPuffs; i++) {
        const angle = rand(0, Math.PI * 2);
        const reach = side * rand(0.05, 0.35);
        live.current.puffs.push({
          kind: "burst",
          x0: x,
          y0: y,
          dx: Math.cos(angle) * reach,
          dy: Math.sin(angle) * reach - side * 0.08,
          age: -rand(0, 120),
          life: SELECT.burstMs * rand(0.85, 1.25),
          r0: rand(12, 30),
          r1: side * SELECT.burstRadius * rand(0.45, 1),
          alpha: SELECT.burstOpacity * rand(0.6, 1),
          sprite: i % JOINT_SMOKE.colors.length,
          rise: 0,
          phase: 0,
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || reduce) return;
    const sprites = JOINT_SMOKE.colors.map(makeSprite);
    const nextEmit: number[] = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const state = live.current;
      const wisps = state.puffs.filter((p) => p.kind === "wisp").length;

      state.getTips().forEach((tip, i) => {
        if (!tip) return;
        const hot = state.hovered === i;
        if ((nextEmit[i] ?? 0) > now || wisps >= JOINT_SMOKE.maxParticles) return;
        nextEmit[i] = now + (hot ? JOINT_SMOKE.hoverEmitMs : JOINT_SMOKE.emitMs) * rand(0.7, 1.3);
        const [r0, r1] = JOINT_SMOKE.radius;
        state.puffs.push({
          kind: "wisp",
          x0: tip.x + rand(-1.5, 1.5),
          y0: tip.y + rand(-1.5, 1.5),
          age: 0,
          life: rand(...JOINT_SMOKE.lifeMs),
          r0: r0 * rand(0.8, 1.2),
          r1: r1 * rand(0.7, 1.1) * (hot ? 1.2 : 1),
          alpha: hot ? JOINT_SMOKE.hoverOpacity : JOINT_SMOKE.startOpacity,
          sprite: Math.floor(Math.random() * sprites.length),
          rise: rand(...JOINT_SMOKE.rise),
          phase: rand(0, Math.PI * 2),
          dx: rand(-10, 10),
          dy: 0,
        });
      });

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      state.puffs = state.puffs.filter((p) => (p.age += dt) < p.life);
      for (const p of state.puffs) {
        if (p.age < 0) continue;
        const t = p.age / p.life;
        let x: number, y: number, a: number;
        if (p.kind === "wisp") {
          // Slow rise with a soft curl that widens as it goes; fades in fast, out slowly.
          x = p.x0 + p.dx * t + Math.sin(p.phase + t * 4) * JOINT_SMOKE.curl * t;
          y = p.y0 - p.rise * easeOut(t);
          a = p.alpha * Math.min(1, t * 8) * (1 - t) ** 1.3;
        } else {
          const e = easeOut(t);
          x = p.x0 + p.dx * e;
          y = p.y0 + p.dy * e;
          // Swells in quickly, holds, then clears.
          a = p.alpha * Math.min(1, t * 6) * (t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45);
        }
        const r = p.r0 + (p.r1 - p.r0) * (p.kind === "wisp" ? t : easeOut(t));
        ctx.globalAlpha = Math.max(0, a);
        ctx.drawImage(sprites[p.sprite], x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  if (reduce) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[26] h-full w-full" />;
}
