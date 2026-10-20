import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { EYES } from "../config/home";

type Point = { x: number; y: number };

type Props = {
  /** Areas the eyes stay out of (wordmark, subtitle, cat, top bar), in client coordinates. */
  getKeepOuts: () => DOMRect[];
  /** Tip of the hovered joint, if any: a nearby eye looks at it. */
  getFocus: () => Point | null;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const ALMOND = "M4 32 C 22 4, 78 4, 96 32 C 78 60, 22 60, 4 32 Z";
const VIEW = { w: 100, h: 64 };

type Eye = {
  pos: Point;
  /** Two sine layers per axis make a smooth, non-repeating path. */
  freq: number[];
  phase: number[];
  /** The share of the page width this eye roams. */
  span: [number, number];
  nextBlink: number;
};

/**
 * Two eyes drifting slowly around the free parts of the page, pupils on the cursor, blinking at
 * random. Purely decorative: pointer-events none, aria-hidden. Pauses while the tab is hidden.
 * Reduced motion: they stay put (pupils still follow, no blinking).
 */
export function WanderingEyes({ getKeepOuts, getFocus }: Props) {
  const reduce = useReducedMotion();
  const eyeRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const irisRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)];
  const lidRefs = [useRef<SVGRectElement>(null), useRef<SVGRectElement>(null)];
  const live = useRef({ getKeepOuts, getFocus });
  live.current = { getKeepOuts, getFocus };

  useEffect(() => {
    const [crossMin, crossMax] = EYES.crossS;
    const makeEye = (span: [number, number]): Eye => {
      const cross = rand(crossMin, crossMax);
      // One full sine period ≈ crossing twice, so crossing takes about `cross` seconds.
      const base = (Math.PI * 2) / (cross * 2);
      return {
        pos: { x: -1, y: -1 },
        freq: [base, base * rand(1.6, 2.3), base * rand(0.8, 1.2), base * rand(1.7, 2.4), base * rand(0.5, 0.8)],
        phase: Array.from({ length: 5 }, () => rand(0, Math.PI * 2)),
        span,
        nextBlink: performance.now() + rand(...EYES.blinkEveryS) * 1000,
      };
    };
    const eyes = [makeEye([0, 0.62]), makeEye([0.38, 1])];
    let pointer: Point | null = null;
    let raf = 0;
    let last = 0;

    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    const size = () => (window.innerWidth >= 640 ? EYES.sizePx[1] : EYES.sizePx[0]);

    // Push a point out of every keep-out rectangle (grown by the eye's half size), staying on screen.
    const avoid = (p: Point, half: Point, rects: DOMRect[], bounds: DOMRect) => {
      for (let pass = 0; pass < 3; pass++) {
        for (const r of rects) {
          const l = r.left - half.x, rt = r.right + half.x, t = r.top - half.y, b = r.bottom + half.y;
          if (p.x <= l || p.x >= rt || p.y <= t || p.y >= b) continue;
          const exits = [
            { d: p.x - l, x: l, y: p.y },
            { d: rt - p.x, x: rt, y: p.y },
            { d: p.y - t, x: p.x, y: t },
            { d: b - p.y, x: p.x, y: b },
          ]
            .filter((e) => e.x >= bounds.left && e.x <= bounds.right && e.y >= bounds.top && e.y <= bounds.bottom)
            .sort((a, z) => a.d - z.d);
          if (exits[0]) {
            p.x = exits[0].x;
            p.y = exits[0].y;
          }
        }
      }
      return p;
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const s = now / 1000;
      const w = size();
      const h = (w * VIEW.h) / VIEW.w;
      const half = { x: w / 2 + EYES.keepOutPadPx, y: h / 2 + EYES.keepOutPadPx };
      const rects = live.current.getKeepOuts();
      const barBottom = rects[0]?.bottom ?? 0;
      const bounds = new DOMRect(w / 2 + 6, barBottom + h / 2 + 6, window.innerWidth - w - 12, window.innerHeight - barBottom - h - 12);
      const focus = live.current.getFocus();

      eyes.forEach((eye, i) => {
        const el = eyeRefs[i].current;
        const iris = irisRefs[i].current;
        if (!el || !iris) return;
        const { freq: f, phase: ph } = eye;
        const t = reduce ? 0 : s;
        // Smooth pseudo-noise in 0…1 on each axis.
        const nx = 0.5 + 0.5 * (0.65 * Math.sin(f[0] * t + ph[0]) + 0.35 * Math.sin(f[1] * t + ph[1]));
        const ny = 0.5 + 0.5 * (0.65 * Math.sin(f[2] * t + ph[2]) + 0.35 * Math.sin(f[3] * t + ph[3]));
        const target = avoid(
          {
            x: bounds.left + (eye.span[0] + nx * (eye.span[1] - eye.span[0])) * bounds.width,
            y: bounds.top + ny * bounds.height,
          },
          half,
          rects,
          bounds,
        );
        if (eye.pos.x < 0 || reduce) eye.pos = target;
        else {
          const k = Math.min(1, dt * 1.6);
          eye.pos.x += (target.x - eye.pos.x) * k;
          eye.pos.y += (target.y - eye.pos.y) * k;
          // The smoothed position can lag into a keep-out while the target slides round it.
          avoid(eye.pos, half, rects, bounds);
        }
        const tilt = reduce ? 0 : Math.sin(f[4] * s + ph[4]) * EYES.tiltDeg;
        if (el.style.width !== `${w}px`) el.style.width = `${w}px`;
        el.style.transform = `translate3d(${eye.pos.x - w / 2}px, ${eye.pos.y - h / 2}px, 0) rotate(${tilt.toFixed(2)}deg)`;

        // Pupils: a hovered joint nearby, else the cursor / last tap, else an idle glance.
        const near = focus && Math.hypot(focus.x - eye.pos.x, focus.y - eye.pos.y) < EYES.lookAtJointPx ? focus : null;
        const look = near ?? pointer ?? { x: eye.pos.x + Math.sin(s * 0.7 + i) * 80, y: eye.pos.y + Math.cos(s * 0.5 + i) * 40 };
        const dx = look.x - eye.pos.x;
        const dy = look.y - eye.pos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 180) * EYES.irisTravel * (VIEW.w / 2);
        // Into the eye's own (tilted) frame; the vertical travel is flatter, like a real eye.
        const a = (-tilt * Math.PI) / 180;
        const ux = dx / dist, uy = dy / dist;
        const lx = (ux * Math.cos(a) - uy * Math.sin(a)) * reach;
        const ly = (ux * Math.sin(a) + uy * Math.cos(a)) * reach * 0.45;
        iris.setAttribute("transform", `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`);

        if (!reduce && now >= eye.nextBlink) {
          eye.nextBlink = now + rand(...EYES.blinkEveryS) * 1000;
          const lid = lidRefs[i].current;
          if (lid) {
            lid.style.transform = "scaleY(1)";
            setTimeout(() => (lid.style.transform = "scaleY(0)"), EYES.blinkMs / 2);
          }
        }
      });
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
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [reduce]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[30] overflow-hidden">
      {[0, 1].map((i) => (
        <div key={i} ref={eyeRefs[i]} className="wander-eye absolute left-0 top-0" style={{ width: EYES.sizePx[1] }}>
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="block h-auto w-full overflow-visible">
            <defs>
              <clipPath id={`eye-clip-${i}`}>
                <path d={ALMOND} />
              </clipPath>
            </defs>
            <g clipPath={`url(#eye-clip-${i})`}>
              <path d={ALMOND} fill="#fdfcfa" />
              <g ref={irisRefs[i]}>
                <circle cx="50" cy="32" r="17" fill="#3b2f26" />
                <circle cx="50" cy="32" r="17" fill="none" stroke="#1d1712" strokeWidth="2" />
                <circle cx="50" cy="32" r="8" fill="#0d0b09" />
                <circle cx="56" cy="26" r="3.6" fill="#fff" />
              </g>
              <rect ref={lidRefs[i]} className="wander-eye-lid" x="0" y="0" width={VIEW.w} height={VIEW.h} fill="#e3dfd9" />
            </g>
            <path d={ALMOND} fill="none" stroke="#1f1f1f" strokeWidth="2.6" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}
