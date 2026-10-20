import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocation } from "react-router";
import { EYES } from "../config/home";

type Vec = { x: number; y: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const ALMOND = "M4 32 C 22 4, 78 4, 96 32 C 78 60, 22 60, 4 32 Z";
const VIEW = { w: 100, h: 64 };
const AVOID = "[data-eyes-avoid]";

type Eye = {
  pos: Vec;
  vel: Vec;
  w: number;
  freq: number[];
  phase: number[];
  /** Share of the page width this eye roams, so they spread out. */
  span: [number, number];
  fear: number;
  scared: boolean;
  nextBlink: number;
};

const countFor = (width: number) => (width < 640 ? EYES.mobileCount : EYES.count);
const widthOf = (i: number, mobile: boolean) => EYES.sizes[i % EYES.sizes.length] * (mobile ? EYES.mobileScale : 1);

/**
 * Eyes drifting around every page. Mounted once beside the routes, so they carry on across
 * in-tab navigation. They wander on smooth random paths, watch the cursor, flee from it like
 * matching magnetic poles (dodging sideways from a fast approach), keep apart from each other and
 * out of anything marked data-eyes-avoid, and blink at random. One rAF loop, transforms only,
 * paused while the tab is hidden. Reduced motion: fixed in place, pupils still follow.
 */
export function Eyes() {
  const reduce = useReducedMotion();
  const location = useLocation();
  const [count, setCount] = useState(() => countFor(window.innerWidth));
  const eyeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const irisRefs = useRef<(SVGGElement | null)[]>([]);
  const pupilRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lidRefs = useRef<(SVGRectElement | null)[]>([]);
  const zonesDirty = useRef(true);

  useEffect(() => {
    const onResize = () => setCount(countFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A new route brings its own keep-out areas.
  useEffect(() => {
    zonesDirty.current = true;
  }, [location.pathname]);

  useEffect(() => {
    const mobile = window.innerWidth < 640;
    const [crossMin, crossMax] = EYES.crossS;
    const eyes: Eye[] = Array.from({ length: count }, (_, i) => {
      const cross = rand(crossMin, crossMax) / EYES.wanderSpeed;
      const base = (Math.PI * 2) / (cross * 2);
      const band = 1 / count;
      return {
        pos: { x: -1, y: -1 },
        vel: { x: 0, y: 0 },
        w: widthOf(i, mobile),
        freq: [base, base * rand(1.6, 2.3), base * rand(0.8, 1.2), base * rand(1.7, 2.4), base * rand(0.5, 0.8)],
        phase: Array.from({ length: 5 }, () => rand(0, Math.PI * 2)),
        span: [Math.max(0, i * band - band * 0.6), Math.min(1, (i + 1) * band + band * 0.6)],
        fear: 0,
        scared: false,
        nextBlink: performance.now() + rand(...EYES.blinkEveryS) * 1000,
      };
    });

    // ── Cursor / touch ──
    let cursor: Vec | null = null; // repels while set
    let look: Vec | null = null; // pupils follow
    let cursorVel: Vec = { x: 0, y: 0 };
    let lastMove = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const p = { x: e.clientX, y: e.clientY };
      if (look && lastMove) {
        const dt = Math.max(8, now - lastMove) / 1000;
        cursorVel = { x: cursorVel.x * 0.5 + ((p.x - look.x) / dt) * 0.5, y: cursorVel.y * 0.5 + ((p.y - look.y) / dt) * 0.5 };
      }
      lastMove = now;
      look = p;
      // Touch repels only while the finger is down.
      if (e.pointerType !== "touch" || e.buttons) cursor = p;
    };
    const onDown = (e: PointerEvent) => {
      look = cursor = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") cursor = null;
    };
    const onLeave = () => {
      cursor = null;
      cursorVel = { x: 0, y: 0 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // ── Keep-out areas: [data-eyes-avoid], re-measured when they resize, scroll, appear or animate ──
    let zones: DOMRect[] = [];
    let barBottom = 0;
    const resizes = new ResizeObserver(() => (zonesDirty.current = true));
    const watched = new Set<Element>();
    const rescan = () => {
      zonesDirty.current = false;
      const els = Array.from(document.querySelectorAll(AVOID));
      for (const el of els) if (!watched.has(el)) (watched.add(el), resizes.observe(el));
      for (const el of watched) if (!el.isConnected) (watched.delete(el), resizes.unobserve(el));
      zones = els.map((el) => el.getBoundingClientRect()).filter((r) => r.width && r.height);
      barBottom = document.querySelector("[data-topbar]")?.getBoundingClientRect().bottom ?? 0;
    };
    const mutations = new MutationObserver(() => (zonesDirty.current = true));
    mutations.observe(document.body, { childList: true, subtree: true });
    const markDirty = () => (zonesDirty.current = true);
    window.addEventListener("scroll", markDirty, { passive: true, capture: true });
    // Joints sway and slide in; a slow refresh keeps their areas current.
    const refresh = setInterval(markDirty, 250);

    const inflate = (r: DOMRect, e: Eye) => {
      const hx = e.w / 2 + EYES.keepOutPadPx;
      const hy = (e.w * VIEW.h) / VIEW.w / 2 + EYES.keepOutPadPx;
      return { l: r.left - hx, r: r.right + hx, t: r.top - hy, b: r.bottom + hy };
    };
    const boundsFor = (e: Eye) => {
      const h = (e.w * VIEW.h) / VIEW.w;
      return { l: e.w / 2 + 4, r: window.innerWidth - e.w / 2 - 4, t: barBottom + h / 2 + 4, b: window.innerHeight - h / 2 - 4 };
    };
    // Move p to the nearest spot that is outside every keep-out and on screen. Exits are searched
    // across neighbouring areas too (leaving one paragraph can land in the next). Returns true when
    // there is no such spot (a phone screen full of text).
    const pushOut = (p: Vec, e: Eye, vel?: Vec) => {
      const B = boundsFor(e);
      const boxes = zones.map((z) => inflate(z, e));
      const blocking = (q: Vec) => boxes.find((k) => q.x > k.l && q.x < k.r && q.y > k.t && q.y < k.b);
      const onScreen = (q: Vec) => q.x >= B.l && q.x <= B.r && q.y >= B.t && q.y <= B.b;
      if (!blocking(p)) return false;
      let frontier: Vec[] = [{ ...p }];
      let best: Vec | null = null;
      let bestD = Infinity;
      for (let depth = 0; depth < 4 && frontier.length; depth++) {
        const next: Vec[] = [];
        for (const q of frontier) {
          const k = blocking(q);
          if (!k) {
            const d = Math.hypot(q.x - p.x, q.y - p.y);
            if (d < bestD) (best = q), (bestD = d);
            continue;
          }
          for (const x of [{ x: k.l - 0.5, y: q.y }, { x: k.r + 0.5, y: q.y }, { x: q.x, y: k.t - 0.5 }, { x: q.x, y: k.b + 0.5 }]) {
            if (onScreen(x) && Math.hypot(x.x - p.x, x.y - p.y) < bestD) next.push(x);
          }
        }
        frontier = next;
      }
      if (!best) return true;
      // Slide along the edge: drop the part of the velocity that points back in.
      if (vel) {
        const dx = best.x - p.x, dy = best.y - p.y, len = Math.hypot(dx, dy) || 1;
        const into = (vel.x * dx + vel.y * dy) / len;
        if (into < 0) (vel.x -= (into * dx) / len), (vel.y -= (into * dy) / len);
      }
      p.x = best.x;
      p.y = best.y;
      return false;
    };

    const wanderPoint = (e: Eye, s: number) => {
      const B = boundsFor(e);
      const f = e.freq, ph = e.phase;
      const nx = 0.5 + 0.5 * (0.65 * Math.sin(f[0] * s + ph[0]) + 0.35 * Math.sin(f[1] * s + ph[1]));
      const ny = 0.5 + 0.5 * (0.65 * Math.sin(f[2] * s + ph[2]) + 0.35 * Math.sin(f[3] * s + ph[3]));
      const p = { x: B.l + (e.span[0] + nx * (e.span[1] - e.span[0])) * (B.r - B.l), y: B.t + ny * (B.b - B.t) };
      pushOut(p, e);
      return p;
    };

    const blink = (i: number) => {
      const lid = lidRefs.current[i];
      if (!lid) return;
      lid.style.transform = "scaleY(1)";
      setTimeout(() => (lid.style.transform = "scaleY(0)"), EYES.blinkMs / 2);
    };

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const s = reduce ? 0 : now / 1000;
      if (zonesDirty.current) rescan();
      const R = EYES.repelRadius;

      eyes.forEach((e, i) => {
        const target = wanderPoint(e, s);
        if (e.pos.x < 0 || reduce) {
          e.pos = { ...target };
          e.vel = { x: 0, y: 0 };
        } else {
          // Spring toward the wander point.
          const acc = { x: (target.x - e.pos.x) * EYES.spring, y: (target.y - e.pos.y) * EYES.spring };
          let fleeing = false;
          if (cursor) {
            const dx = e.pos.x - cursor.x, dy = e.pos.y - cursor.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            if (d < R) {
              fleeing = true;
              const n = { x: dx / d, y: dy / d };
              // Like poles: ∝ 1/d², capped, fading to zero at the edge of the radius.
              const push = EYES.repelStrength * Math.min(EYES.repelCap, (R / d) ** 2) * (1 - d / R);
              acc.x += n.x * push;
              acc.y += n.y * push;
              // A fast approach: dodge sideways, off the cursor's path.
              const speed = Math.hypot(cursorVel.x, cursorVel.y);
              const toward = cursorVel.x * n.x + cursorVel.y * n.y;
              if (speed > 1 && toward > 0) {
                const u = { x: cursorVel.x / speed, y: cursorVel.y / speed };
                let side = { x: n.x - (n.x * u.x + n.y * u.y) * u.x, y: n.y - (n.x * u.x + n.y * u.y) * u.y };
                const len = Math.hypot(side.x, side.y);
                side = len > 0.05 ? { x: side.x / len, y: side.y / len } : { x: -u.y, y: u.x };
                const dodge = EYES.dodge * toward * (1 - d / R);
                acc.x += side.x * dodge;
                acc.y += side.y * dodge;
              }
            }
          }
          // Separation: never overlap another eye.
          eyes.forEach((o, j) => {
            if (j === i || o.pos.x < 0) return;
            const dx = e.pos.x - o.pos.x, dy = e.pos.y - o.pos.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            const min = ((e.w + o.w) / 2) * EYES.separation;
            if (d < min) {
              const push = EYES.separationStrength * (1 - d / min);
              acc.x += (dx / d) * push;
              acc.y += (dy / d) * push;
            }
          });
          e.vel.x = (e.vel.x + acc.x * dt) * EYES.damping ** (dt * 60);
          e.vel.y = (e.vel.y + acc.y * dt) * EYES.damping ** (dt * 60);
          const sp = Math.hypot(e.vel.x, e.vel.y);
          if (sp > EYES.maxSpeed) {
            e.vel.x *= EYES.maxSpeed / sp;
            e.vel.y *= EYES.maxSpeed / sp;
          }
          e.pos.x += e.vel.x * dt;
          e.pos.y += e.vel.y * dt;
          // Viewport edges: clamp and slide along them, never stick.
          const B = boundsFor(e);
          if (e.pos.x < B.l) (e.pos.x = B.l), (e.vel.x = Math.max(0, e.vel.x));
          if (e.pos.x > B.r) (e.pos.x = B.r), (e.vel.x = Math.min(0, e.vel.x));
          if (e.pos.y < B.t) (e.pos.y = B.t), (e.vel.y = Math.max(0, e.vel.y));
          if (e.pos.y > B.b) (e.pos.y = B.b), (e.vel.y = Math.min(0, e.vel.y));
          // Scared: widens, pupil shrinks; a blink on the first hit.
          if (fleeing && !e.scared && e.fear < 0.3) blink(i);
          e.scared = fleeing;
          e.fear += ((fleeing ? 1 : 0) - e.fear) * Math.min(1, dt * (fleeing ? 10 : 2.5));
        }
      });

      // The separation force is soft; when space is tight, push touching eyes apart outright. That
      // and the keep-outs are solved together over a few rounds (one can undo the other).
      const stuckAt: boolean[] = [];
      for (let round = 0; round < 4; round++) {
        let moved = false;
        for (let i = 0; i < eyes.length; i++) {
          for (let j = i + 1; j < eyes.length; j++) {
            const a = eyes[i], o = eyes[j];
            const dx = a.pos.x - o.pos.x, dy = a.pos.y - o.pos.y;
            const d = Math.max(0.01, Math.hypot(dx, dy));
            // 1.22: room for the tilt (up to 8°) and the scared scale (1.1), so even the boxes never touch.
            const min = ((a.w + o.w) / 2) * 1.22;
            if (d >= min) continue;
            moved = true;
            const push = (min - d) / 2;
            a.pos.x += (dx / d) * push;
            a.pos.y += (dy / d) * push;
            o.pos.x -= (dx / d) * push;
            o.pos.y -= (dy / d) * push;
          }
        }
        eyes.forEach((e, i) => {
          const B = boundsFor(e);
          e.pos.x = Math.min(B.r, Math.max(B.l, e.pos.x));
          e.pos.y = Math.min(B.b, Math.max(B.t, e.pos.y));
          stuckAt[i] = pushOut(e.pos, e, e.vel);
        });
        if (!moved) break;
      }

      eyes.forEach((e, i) => {
        const stuck = stuckAt[i];

        const el = eyeRefs.current[i];
        const iris = irisRefs.current[i];
        const pupil = pupilRefs.current[i];
        if (!el || !iris || !pupil) return;
        const h = (e.w * VIEW.h) / VIEW.w;
        const tilt = reduce ? 0 : Math.sin(e.freq[4] * s + e.phase[4]) * EYES.tiltDeg;
        const scale = 1 + (EYES.fleeScale - 1) * e.fear;
        el.style.transform = `translate3d(${(e.pos.x - e.w / 2).toFixed(1)}px, ${(e.pos.y - h / 2).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        // Text it can't get away from (a page full of it on a phone): fade back instead of covering it.
        el.style.opacity = stuck ? "0.35" : "1";

        // Pupils: the cursor / last touch, else an idle glance.
        const at = look ?? { x: e.pos.x + Math.sin(s * 0.7 + i) * 80, y: e.pos.y + Math.cos(s * 0.5 + i) * 40 };
        const dx = at.x - e.pos.x, dy = at.y - e.pos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / 180) * EYES.irisTravel * (VIEW.w / 2);
        const a = (-tilt * Math.PI) / 180;
        const ux = dx / dist, uy = dy / dist;
        const lx = (ux * Math.cos(a) - uy * Math.sin(a)) * reach;
        const ly = (ux * Math.sin(a) + uy * Math.cos(a)) * reach * 0.45;
        iris.setAttribute("transform", `translate(${lx.toFixed(2)} ${ly.toFixed(2)})`);
        const ps = 1 - (1 - EYES.fleePupil) * e.fear;
        pupil.setAttribute("transform", `translate(50 32) scale(${ps.toFixed(3)}) translate(-50 -32)`);

        if (!reduce && now >= e.nextBlink) {
          e.nextBlink = now + rand(...EYES.blinkEveryS) * 1000;
          blink(i);
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
      clearInterval(refresh);
      resizes.disconnect();
      mutations.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", markDirty, { capture: true });
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [count, reduce]);

  const mobile = window.innerWidth < 640;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[30] overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={`${count}-${i}`}
          ref={(el) => {
            eyeRefs.current[i] = el;
          }}
          className="wander-eye absolute left-0 top-0"
          style={{ width: widthOf(i, mobile), transform: "translate3d(-200px, -200px, 0)" }}
        >
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="block h-auto w-full overflow-visible">
            <defs>
              <clipPath id={`eye-clip-${i}`}>
                <path d={ALMOND} />
              </clipPath>
            </defs>
            <g clipPath={`url(#eye-clip-${i})`}>
              <path d={ALMOND} fill="#fdfcfa" />
              <g
                ref={(el) => {
                  irisRefs.current[i] = el;
                }}
              >
                <circle cx="50" cy="32" r="17" fill={EYES.irises[i % EYES.irises.length]} />
                <circle cx="50" cy="32" r="17" fill="none" stroke="#1d1712" strokeWidth="2" />
                <circle
                  ref={(el) => {
                    pupilRefs.current[i] = el;
                  }}
                  cx="50"
                  cy="32"
                  r="8"
                  fill="#0d0b09"
                />
                <circle cx="56" cy="26" r="3.6" fill="#fff" />
              </g>
              <rect
                ref={(el) => {
                  lidRefs.current[i] = el;
                }}
                className="wander-eye-lid"
                x="0"
                y="0"
                width={VIEW.w}
                height={VIEW.h}
                fill="#e3dfd9"
              />
            </g>
            <path d={ALMOND} fill="none" stroke="#1f1f1f" strokeWidth="2.6" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}
