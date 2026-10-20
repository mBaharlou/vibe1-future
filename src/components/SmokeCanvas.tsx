import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { MOUTH_ORIGIN, SMOKE } from "../config/home";

type Particle = {
  x0: number;
  y0: number;
  age: number;
  life: number;
  rise: number;
  drift: number;
  sway: number;
  swayFreq: number;
  phase: number;
  radius: number;
  sprite: number;
};

type Props = {
  /** Emit while true. */
  hovering: boolean;
  /** Changing this value starts a short burst (touch). */
  burstAt: number;
  catRef: RefObject<HTMLDivElement | null>;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

// A soft round puff, pre-rendered once per color so each frame is only drawImage calls.
function makeSprite(color: string) {
  const size = 128;
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

/** Smoke puffs rising from the cat's mouth. One rAF loop that stops when idle. */
export function SmokeCanvas({ hovering, burstAt, catRef }: Props) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kick = useRef<() => void>(() => {});
  const live = useRef({ hovering: false, burstUntil: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const sprites = SMOKE.colors.map(makeSprite);
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;
    let nextEmit = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const spawn = () => {
      const cat = catRef.current?.getBoundingClientRect();
      if (!cat) return;
      const box = canvas.getBoundingClientRect();
      const radius = cat.width * SMOKE.radius;
      particles.push({
        x0: cat.left - box.left + (cat.width * MOUTH_ORIGIN.x) / 100,
        y0: cat.top - box.top + (cat.height * MOUTH_ORIGIN.y) / 100,
        age: 0,
        life: rand(SMOKE.lifeMs[0], SMOKE.lifeMs[1]),
        rise: cat.height * SMOKE.rise * rand(0.8, 1.15),
        drift: radius * rand(-1.6, 1.6),
        sway: radius * rand(0.25, 0.6),
        swayFreq: rand(0.6, 1.3),
        phase: rand(0, Math.PI * 2),
        radius,
        sprite: Math.floor(Math.random() * sprites.length),
      });
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const emitting = live.current.hovering || now < live.current.burstUntil;
      if (emitting && now >= nextEmit && particles.length < SMOKE.maxParticles) {
        spawn();
        nextEmit = now + rand(SMOKE.emitEveryMs[0], SMOKE.emitEveryMs[1]);
      }

      ctx.clearRect(0, 0, width, height);
      particles = particles.filter((p) => (p.age += dt) < p.life);
      for (const p of particles) {
        const t = p.age / p.life;
        const x = p.x0 + p.drift * t + Math.sin(p.phase + t * Math.PI * 2 * p.swayFreq) * p.sway * t;
        const y = p.y0 - p.rise * easeOut(t);
        const size = 2 * p.radius * (SMOKE.scale[0] + (SMOKE.scale[1] - SMOKE.scale[0]) * easeOut(t));
        ctx.globalAlpha = SMOKE.startOpacity * (1 - t) * Math.min(1, t / 0.08);
        ctx.drawImage(sprites[p.sprite], x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      if (particles.length || emitting) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        last = 0;
      }
    };

    kick.current = () => {
      if (raf) return;
      nextEmit = 0;
      raf = requestAnimationFrame(frame);
    };

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      kick.current = () => {};
    };
  }, [catRef]);

  useEffect(() => {
    live.current.hovering = hovering && !reduce;
    if (live.current.hovering) kick.current();
  }, [hovering, reduce]);

  useEffect(() => {
    if (!burstAt || reduce) return;
    live.current.burstUntil = performance.now() + SMOKE.tapBurstMs;
    kick.current();
  }, [burstAt, reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-[-30%] z-[25] h-[130%] w-full"
    />
  );
}
