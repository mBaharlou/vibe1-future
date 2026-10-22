import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLocation } from "react-router";
import { EYE_CRY, EYES } from "../config/home";

type Vec = { x: number; y: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const ALMOND = "M4 32 C 22 4, 78 4, 96 32 C 78 60, 22 60, 4 32 Z";
const VIEW = { w: 100, h: 64 };
const AVOID = "[data-eyes-avoid]";
/** Never catch an eye through these (they sit above the eyes layer). */
const ABOVE = "[data-topbar], [role=dialog], .ask-cat";
/** A click on something interactive is never a catch, even with an eye floating over it. */
const INTERACTIVE = "a[href], button, input, textarea, select, label, summary, [role=button], [role=option], [contenteditable], [tabindex]:not([tabindex='-1'])";
const GRAVITY = 900;

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
  /** Crying since (loop clock, ms), or -1. */
  cryAt: number;
  tearsShed: number;
  /** Loop-clock times: can be caught again / dash ends / surprise ends. */
  catchableAt: number;
  escapeUntil: number;
  surpriseUntil: number;
  /** Current drawn scale and sob offset, also used for the hit test and the tears. */
  scale: number;
  shake: number;
};

/** well: swelling on the lower lid · fall: dropping, stretching · drop: a splash droplet. */
type Tear = { eye: number; kind: "well" | "fall" | "drop"; x: number; y: number; dx: number; vx: number; vy: number; r: number; age: number; fallTo: number };

const countFor = (width: number) => (width < 640 ? EYES.mobileCount : EYES.count);
const widthOf = (i: number, mobile: boolean) => EYES.sizes[i % EYES.sizes.length] * (mobile ? EYES.mobileScale : 1);

function drawTear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, stretch: number, alpha: number) {
  // A drop: round bottom, pointed top, pulled longer as it falls.
  const top = y - r * 2.1 * stretch;
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(x, top, x, y + r);
  g.addColorStop(0, "#c9ecff");
  g.addColorStop(1, "#5fb0ec");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.bezierCurveTo(x + r * 0.55, y - r * 1.1 * stretch, x + r, y - r * 0.45, x + r, y);
  ctx.arc(x, y, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * 0.45, x - r * 0.55, y - r * 1.1 * stretch, x, top);
  ctx.fill();
  ctx.strokeStyle = "rgba(40, 110, 170, 0.45)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Eyes drifting around every page. Mounted once beside the routes, so they carry on across
 * in-tab navigation. They wander on smooth random paths, watch the cursor, flee from it like
 * matching magnetic poles (dodging sideways from a fast approach), keep apart from each other and
 * out of anything marked data-eyes-avoid, and blink at random. Click or tap right on one and it's
 * caught: it cries for a moment (drooping lid, falling tears, a little sob), then dashes away.
 * One rAF loop, transforms only, paused while the tab is hidden. Reduced motion: fixed in place,
 * pupils still follow; a caught eye shows a still tear instead of falling ones.
 */
export function Eyes() {
  const reduce = useReducedMotion();
  const location = useLocation();
  const [count, setCount] = useState(() => countFor(window.innerWidth));
  const eyeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const irisRefs = useRef<(SVGGElement | null)[]>([]);
  const pupilRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lidRefs = useRef<(SVGRectElement | null)[]>([]);
  const wetRefs = useRef<(SVGGElement | null)[]>([]);
  const tearCanvasRef = useRef<HTMLCanvasElement>(null);
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
        cryAt: -1,
        tearsShed: 0,
        catchableAt: 0,
        escapeUntil: 0,
        surpriseUntil: 0,
        scale: 1,
        shake: 0,
      };
    });
    // Loop time (ms): only advances while frames run, so crying pauses with a hidden tab.
    let clock = 0;
    let tears: Tear[] = [];
    let tearsDrawn = false;

    // ── Cursor / touch ──
    let cursor: Vec | null = null; // repels while set
    let look: Vec | null = null; // pupils follow
    let hover: Vec | null = null; // a mouse or pen over the page (for the pointer cursor)
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
      hover = e.pointerType === "touch" ? null : p;
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
      cursor = hover = null;
      cursorVel = { x: 0, y: 0 };
    };

    // ── Catching: hit-test the eyes' current outlines on pointerdown (the layer itself stays
    //    pointer-events: none). A hit is swallowed so nothing underneath reacts to it. ──
    const hitScale = (e: Eye) => e.scale * EYE_CRY.catchHitScale;
    const isOver = (e: Eye, p: Vec) => {
      if (e.pos.x < 0) return false;
      const rx = (e.w / 2) * hitScale(e);
      const ry = ((e.w * VIEW.h) / VIEW.w / 2) * hitScale(e);
      return ((p.x - e.pos.x - e.shake) / rx) ** 2 + ((p.y - e.pos.y) / ry) ** 2 <= 1;
    };
    const catchable = (e: Eye) => e.cryAt < 0 && clock >= e.catchableAt;
    const eyeAt = (p: Vec) => {
      const under = document.elementFromPoint(p.x, p.y);
      if (under?.closest(ABOVE) || under?.closest(INTERACTIVE)) return -1;
      return eyes.findIndex((e) => catchable(e) && isOver(e, p));
    };
    let swallowClick = false;
    const onCatch = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const i = eyeAt({ x: e.clientX, y: e.clientY });
      if (i < 0) return;
      e.preventDefault();
      e.stopPropagation();
      swallowClick = true;
      const eye = eyes[i];
      eye.cryAt = clock;
      eye.tearsShed = 0;
      eye.vel = { x: 0, y: 0 };
      eye.fear = 0;
      eye.scared = false;
      const lid = lidRefs.current[i];
      if (lid) lid.style.transform = "scaleY(0.5)";
      start();
    };
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("pointerdown", onCatch, { capture: true });
    window.addEventListener("click", onClick, { capture: true });
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
      setTimeout(() => (lid.style.transform = eyes[i]?.cryAt >= 0 ? "scaleY(0.5)" : "scaleY(0)"), EYES.blinkMs / 2);
    };

    // Done crying: a blink, wide-eyed surprise, then a dash away from the cursor.
    const stopCrying = (e: Eye, i: number) => {
      e.cryAt = -1;
      e.catchableAt = clock + EYE_CRY.catchCooldownMs;
      const lid = lidRefs.current[i];
      if (lid) lid.style.transform = "scaleY(0)";
      tears = tears.filter((t) => t.eye !== i || t.kind !== "well");
      if (reduce) return;
      blink(i);
      e.surpriseUntil = clock + EYE_CRY.surpriseMs;
      e.escapeUntil = clock + EYE_CRY.surpriseMs + EYE_CRY.escapeMs;
    };
    const dash = (e: Eye) => {
      const from = cursor ?? look;
      let dx = from ? e.pos.x - from.x : rand(-1, 1);
      let dy = from ? e.pos.y - from.y : rand(-1, 1);
      const len = Math.hypot(dx, dy) || 1;
      // Toward the open side of the screen if the cursor pins it to an edge.
      const B = boundsFor(e);
      dx /= len;
      dy /= len;
      if ((e.pos.x <= B.l + 2 && dx < 0) || (e.pos.x >= B.r - 2 && dx > 0)) dx = -dx;
      if ((e.pos.y <= B.t + 2 && dy < 0) || (e.pos.y >= B.b - 2 && dy > 0)) dy = -dy;
      const speed = EYES.maxSpeed * EYE_CRY.escapeBoost;
      e.vel = { x: dx * speed, y: dy * speed };
    };

    // ── Tears: a small full-screen canvas in the eyes layer, drawn in the same loop ──
    const tearCanvas = tearCanvasRef.current;
    const tctx = tearCanvas?.getContext("2d") ?? null;
    const sizeTears = () => {
      if (!tearCanvas || !tctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tearCanvas.width = Math.round(window.innerWidth * dpr);
      tearCanvas.height = Math.round(window.innerHeight * dpr);
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tearsDrawn = true;
    };
    sizeTears();
    window.addEventListener("resize", sizeTears);

    const lidPoint = (e: Eye) => ({ x: e.pos.x + e.shake, y: e.pos.y + ((e.w * VIEW.h) / VIEW.w / 2) * e.scale * 0.72 });
    const tearRadius = (e: Eye) => Math.max(2.4, e.w * 0.065);
    const shed = (e: Eye, i: number) => {
      tears.push({ eye: i, kind: "well", x: 0, y: 0, dx: rand(-0.24, 0.24) * e.w, vx: 0, vy: 0, r: tearRadius(e) * rand(0.85, 1.15), age: 0, fallTo: 0 });
    };

    const stepTears = (dt: number) => {
      const next: Tear[] = [];
      for (const t of tears) {
        t.age += dt * 1000;
        const e = eyes[t.eye];
        if (t.kind === "well") {
          const at = lidPoint(e);
          t.x = at.x + t.dx;
          t.y = at.y;
          // Swells for a moment on the lower lid, then lets go (never in reduced motion).
          if (!reduce && t.age > 280) {
            t.kind = "fall";
            t.vy = 20;
            t.fallTo = t.y + rand(...EYE_CRY.fallPx);
          }
          next.push(t);
        } else if (t.kind === "fall") {
          t.vy += GRAVITY * dt;
          t.y += t.vy * dt;
          if (t.y < t.fallTo) next.push(t);
          else {
            // Splash: a few tiny droplets.
            for (let k = 0; k < 4; k++) {
              next.push({ ...t, kind: "drop", vx: rand(-70, 70), vy: rand(-150, -50), r: t.r * rand(0.28, 0.42), age: 0 });
            }
          }
        } else {
          t.vy += GRAVITY * dt;
          t.x += t.vx * dt;
          t.y += t.vy * dt;
          if (t.age < 320) next.push(t);
        }
      }
      tears = next;
    };

    const drawTears = () => {
      if (!tctx) return;
      if (!tears.length && !tearsDrawn) return;
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      tearsDrawn = tears.length > 0;
      for (const t of tears) {
        if (t.kind === "well") drawTear(tctx, t.x, t.y, t.r * Math.min(1, reduce ? 1 : t.age / 280), 1, 0.95);
        else if (t.kind === "fall") drawTear(tctx, t.x, t.y, t.r, 1 + Math.min(0.6, t.vy / 650), 0.95);
        else {
          tctx.globalAlpha = 0.85 * (1 - t.age / 320);
          tctx.fillStyle = "#7cc3f3";
          tctx.beginPath();
          tctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
          tctx.fill();
        }
      }
      tctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = 0;
    let pointerShown = false;
    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      clock += dt * 1000;
      const s = reduce ? 0 : now / 1000;
      if (zonesDirty.current) rescan();
      const R = EYES.repelRadius;
      // A slow cursor is less scary (that's how you sneak up on one).
      const cursorSpeed = now - lastMove > 120 ? 0 : Math.hypot(cursorVel.x, cursorVel.y);
      const calm = EYE_CRY.calmFloor + (1 - EYE_CRY.calmFloor) * Math.min(1, cursorSpeed / EYE_CRY.calmSpeed);
      const crying = eyes.findIndex((e) => e.cryAt >= 0);

      eyes.forEach((e, i) => {
        // Crying: stays put, sobbing, sheds its tears over the first part of the cry.
        if (e.cryAt >= 0) {
          const t = clock - e.cryAt;
          if (t >= EYE_CRY.cryMs) stopCrying(e, i);
          else {
            const tearsDue = reduce ? 1 : Math.min(EYE_CRY.tearCount, 1 + Math.floor((t / (EYE_CRY.cryMs * 0.75)) * EYE_CRY.tearCount));
            while (e.tearsShed < tearsDue) (shed(e, i), e.tearsShed++);
            const sob = t % EYE_CRY.sobEveryMs;
            e.shake = reduce || sob > 160 ? 0 : Math.sin((sob / 160) * Math.PI * 4) * EYE_CRY.sobPx;
            e.fear = 0;
            return;
          }
        }
        e.shake = 0;
        const target = wanderPoint(e, s);
        if (e.pos.x < 0 || reduce) {
          e.pos = { ...target };
          e.vel = { x: 0, y: 0 };
        } else {
          // Spring toward the wander point.
          const acc = { x: (target.x - e.pos.x) * EYES.spring, y: (target.y - e.pos.y) * EYES.spring };
          let fleeing = false;
          const escaping = clock < e.escapeUntil;
          if (escaping && clock >= e.surpriseUntil && e.surpriseUntil > 0) {
            // The dash starts the moment the surprise ends.
            dash(e);
            e.surpriseUntil = 0;
          }
          if (cursor && !escaping) {
            const dx = e.pos.x - cursor.x, dy = e.pos.y - cursor.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            if (d < R) {
              fleeing = true;
              const n = { x: dx / d, y: dy / d };
              // Like poles: ∝ 1/d², capped, fading to zero at the edge of the radius.
              const push = EYES.repelStrength * Math.min(EYES.repelCap, (R / d) ** 2) * (1 - d / R) * calm;
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
          if (clock < e.surpriseUntil) (acc.x = 0), (acc.y = 0), (e.vel = { x: 0, y: 0 });
          e.vel.x = (e.vel.x + acc.x * dt) * EYES.damping ** (dt * 60);
          e.vel.y = (e.vel.y + acc.y * dt) * EYES.damping ** (dt * 60);
          const limit = escaping ? EYES.maxSpeed * EYE_CRY.escapeBoost : EYES.maxSpeed;
          const sp = Math.hypot(e.vel.x, e.vel.y);
          if (sp > limit) {
            e.vel.x *= limit / sp;
            e.vel.y *= limit / sp;
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
      // and the keep-outs are solved together over a few rounds (one can undo the other). A crying
      // eye holds its place; the others make room.
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
            const aHolds = a.cryAt >= 0, oHolds = o.cryAt >= 0;
            const pa = oHolds && !aHolds ? min - d : aHolds ? 0 : (min - d) / 2;
            const po = aHolds && !oHolds ? min - d : oHolds ? 0 : (min - d) / 2;
            a.pos.x += (dx / d) * pa;
            a.pos.y += (dy / d) * pa;
            o.pos.x -= (dx / d) * po;
            o.pos.y -= (dy / d) * po;
          }
        }
        eyes.forEach((e, i) => {
          if (e.cryAt >= 0) return (stuckAt[i] = false);
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
        const sad = e.cryAt >= 0;
        const h = (e.w * VIEW.h) / VIEW.w;
        const tilt = reduce || sad ? 0 : Math.sin(e.freq[4] * s + e.phase[4]) * EYES.tiltDeg;
        const surprise = clock < e.surpriseUntil ? EYE_CRY.surpriseScale : 1;
        e.scale = sad ? EYE_CRY.sadScale : Math.max(surprise, 1 + (EYES.fleeScale - 1) * e.fear);
        el.style.transform = `translate3d(${(e.pos.x + e.shake - e.w / 2).toFixed(1)}px, ${(e.pos.y - h / 2).toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg) scale(${e.scale.toFixed(3)})`;
        // Text it can't get away from (a page full of it on a phone): fade back instead of covering it.
        el.style.opacity = stuck ? "0.35" : "1";
        const wet = wetRefs.current[i];
        if (wet) wet.style.opacity = sad ? "1" : "0";

        // Pupils: a crying eye looks down; the others look at it; else the cursor / last touch,
        // else an idle glance.
        const at = sad
          ? { x: e.pos.x, y: e.pos.y + 400 }
          : crying >= 0
            ? eyes[crying].pos
            : (look ?? { x: e.pos.x + Math.sin(s * 0.7 + i) * 80, y: e.pos.y + Math.cos(s * 0.5 + i) * 40 });
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

        if (!reduce && !sad && now >= e.nextBlink) {
          e.nextBlink = now + rand(...EYES.blinkEveryS) * 1000;
          blink(i);
        }
      });

      stepTears(dt);
      drawTears();

      // A mouse over a catchable eye gets the pointer cursor.
      const showPointer = !!hover && eyeAt(hover) >= 0;
      if (showPointer !== pointerShown) {
        pointerShown = showPointer;
        document.documentElement.classList.toggle("eye-catchable", showPointer);
      }
      raf = requestAnimationFrame(frame);
    };

    function start() {
      if (raf || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
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
      document.documentElement.classList.remove("eye-catchable");
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", sizeTears);
      window.removeEventListener("pointerdown", onCatch, { capture: true });
      window.removeEventListener("click", onClick, { capture: true });
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
      <canvas ref={tearCanvasRef} className="absolute inset-0 h-full w-full" />
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
              {/* Crying: a wet shine pooling on the lower lid. */}
              <g
                ref={(el) => {
                  wetRefs.current[i] = el;
                }}
                className="wander-eye-wet"
              >
                <path d="M12 42 C 30 58, 70 58, 88 42 L 88 64 L 12 64 Z" fill="#8fd0ff" fillOpacity="0.45" />
                <path d="M20 45 C 36 55, 64 55, 80 45" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
                <ellipse cx="38" cy="24" rx="7" ry="3.2" fill="#fff" fillOpacity="0.7" transform="rotate(-18 38 24)" />
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
