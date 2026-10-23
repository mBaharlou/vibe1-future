import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { useReducedMotion } from "framer-motion";
import { JOINT_SMOKE, LIGHT, SELECT } from "../config/home";

export type JointSmokeHandle = {
  /** A big soft puff that swells out from (x, y) over much of the screen, then clears. */
  burst: (x: number, y: number) => void;
  /** The first thick puff when a joint catches. */
  firstPuff: (x: number, y: number) => void;
  /** A tiny wisp when a flame goes out (lighting cancelled). */
  wisp: (x: number, y: number) => void;
  /** Flint sparks flying off the lighter. */
  sparks: (x: number, y: number) => void;
};

type Props = {
  ref: Ref<JointSmokeHandle>;
  /** Tips of the lit joints, in client coordinates (null for an unlit joint). */
  getLitTips: () => ({ x: number; y: number } | null)[];
};

type Particle = {
  kind: "wisp" | "burst" | "spark";
  x0: number;
  y0: number;
  age: number;
  life: number;
  r0: number;
  r1: number;
  alpha: number;
  sprite: number;
  rise: number;
  phase: number;
  dx: number;
  dy: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const SPARK_SPRITE = -1;

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
 * One full-viewport canvas for the joints: smoke from every lit tip, the first puff, the
 * cancel wisp, lighter sparks and the page-transition burst. The loop pauses while the tab is
 * hidden. Reduced motion: no particles.
 */
export function JointSmoke({ ref, getLitTips }: Props) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ getLitTips, particles: [] as Particle[] });
  live.current.getLitTips = getLitTips;

  const wisp = (x: number, y: number, scale = 1, alpha = JOINT_SMOKE.opacity): Particle => {
    const [r0, r1] = JOINT_SMOKE.radius;
    return {
      kind: "wisp",
      x0: x + rand(-1.5, 1.5),
      y0: y + rand(-1.5, 1.5),
      age: 0,
      life: rand(...JOINT_SMOKE.lifeMs),
      r0: r0 * rand(0.8, 1.2) * scale,
      r1: r1 * rand(0.7, 1.1) * scale,
      alpha,
      sprite: Math.floor(Math.random() * JOINT_SMOKE.colors.length),
      rise: rand(...JOINT_SMOKE.rise),
      phase: rand(0, Math.PI * 2),
      dx: rand(-10, 10),
      dy: 0,
    };
  };

  useImperativeHandle(ref, () => ({
    burst(x, y) {
      const side = Math.max(window.innerWidth, window.innerHeight);
      for (let i = 0; i < SELECT.burstPuffs; i++) {
        const angle = rand(0, Math.PI * 2);
        const reach = side * rand(0.05, 0.35);
        live.current.particles.push({
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
    firstPuff(x, y) {
      for (let i = 0; i < JOINT_SMOKE.firstPuffs; i++) {
        const p = wisp(x, y, rand(1.6, 2.6), Math.min(0.6, JOINT_SMOKE.opacity * 1.8));
        p.age = -i * 45;
        p.rise *= 1.3;
        live.current.particles.push(p);
      }
    },
    wisp(x, y) {
      for (let i = 0; i < 3; i++) {
        const p = wisp(x, y, 0.7, JOINT_SMOKE.opacity * 0.8);
        p.age = -i * 60;
        p.life *= 0.6;
        live.current.particles.push(p);
      }
    },
    sparks(x, y) {
      for (let i = 0; i < LIGHT.sparks; i++) {
        const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const speed = rand(40, 120);
        live.current.particles.push({
          kind: "spark",
          x0: x,
          y0: y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          age: 0,
          life: rand(180, 380),
          r0: rand(0.8, 1.6),
          r1: 0.4,
          alpha: 1,
          sprite: SPARK_SPRITE,
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
      const wisps = state.particles.filter((p) => p.kind === "wisp").length;
      state.getLitTips().forEach((tip, i) => {
        if (!tip || (nextEmit[i] ?? 0) > now || wisps >= JOINT_SMOKE.maxParticles) return;
        nextEmit[i] = now + JOINT_SMOKE.emitMs * rand(0.7, 1.3);
        state.particles.push(wisp(tip.x, tip.y));
      });

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      state.particles = state.particles.filter((p) => (p.age += dt) < p.life);
      for (const p of state.particles) {
        if (p.age < 0) continue;
        const t = p.age / p.life;
        if (p.kind === "spark") {
          // Bright speck flung off the flint, falling and fading.
          const s = p.age / 1000;
          const x = p.x0 + p.dx * s;
          const y = p.y0 + p.dy * s + 260 * s * s;
          ctx.globalAlpha = 1 - t;
          ctx.fillStyle = t < 0.4 ? "#fff3c4" : "#ffb347";
          ctx.beginPath();
          ctx.arc(x, y, p.r0 + (p.r1 - p.r0) * t, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
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
