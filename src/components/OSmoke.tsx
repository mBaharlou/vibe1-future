import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { O_SMOKE } from "../config/home";

// Smoke inside the counter (the hole) of the wordmark's "O". The wordmark itself is untouched:
// a small canvas sits exactly over the O and draws only inside an exact mask of the hole.
//
// The mask: a DOM Range over the "O" gives its box on screen; the O is drawn again offscreen with
// the same computed font, and a flood fill from the glyph's centre finds the enclosed empty area.
// Smoke is drawn, then cut to that mask (destination-in), so nothing reaches the stroke.
//
// Cycle: fill (gray smoke collects from the bottom of the hole like smoke in a jar: a wavy level
// rises steadily while it thickens, a few wisps curl above it) → full (packed, churning, pressing
// the edges) → release (every puff moves to a fixed full-page canvas, bursts out and rises off the
// top) → pause (empty) → again.

type Hole = {
  /** Canvas box, in px relative to the wrapper. */
  left: number;
  top: number;
  width: number;
  height: number;
  dpr: number;
  mask: HTMLCanvasElement;
  /** The hole's bounding ellipse, in canvas px. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

/** body: under the level · edge: billows along the level's top · wisp: thin curls above it. */
type Kind = "body" | "edge" | "wisp";
type Puff = { kind: Kind; x: number; y: number; vx: number; vy: number; r: number; age: number; life: number; sprite: number; phase: number };
type Escaping = { x: number; y: number; vx: number; vy: number; ay: number; r0: number; r1: number; alpha: number; sprite: number; phase: number; sway: number };

type Props = {
  /** Positioned wrapper the canvas is placed in (it must contain the wordmark). */
  wrapRef: RefObject<HTMLElement | null>;
  /** The element whose text holds the "O". */
  fillRef: RefObject<HTMLElement | null>;
  /** Re-measure when this changes (language / direction). */
  measureKey: string;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const PAD = 3;

/** Mixes a #rrggbb colour toward black (amount < 0) or white (amount > 0). */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const to = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * k));
  return `rgb(${c.join(",")})`;
}

// A puff with volume: a darker core, the colour, a lighter rim fading out.
function makeSprite(color: string) {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size * 0.46, size * 0.54, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, shade(color, -0.22));
  g.addColorStop(0.42, color);
  g.addColorStop(0.78, shade(color, 0.3));
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  // Soften the rim so overlapping puffs blend instead of showing rings.
  ctx.globalCompositeOperation = "destination-in";
  const a = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  a.addColorStop(0, "rgba(0,0,0,1)");
  a.addColorStop(0.55, "rgba(0,0,0,0.8)");
  a.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/** Finds the O's hole. Null if the glyph can't be matched (no "O", font not ready, or a leak). */
function measureHole(wrap: HTMLElement, fill: HTMLElement): Hole | null {
  const node = Array.from(fill.childNodes).find((n): n is Text => n instanceof Text && n.data.includes("O"));
  if (!node) return null;
  const at = node.data.indexOf("O");
  const range = document.createRange();
  range.setStart(node, at);
  range.setEnd(node, at + 1);
  const glyph = range.getBoundingClientRect();
  const box = wrap.getBoundingClientRect();
  if (!glyph.width || !glyph.height) return null;

  const cs = getComputedStyle(fill);
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  probe.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  const m = probe.measureText("O");
  // The range's box is the font's content area, so the baseline sits `ascent` below its top.
  const contentH = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
  const baseline = glyph.top + (glyph.height - contentH) / 2 + m.fontBoundingBoxAscent;
  const inkLeft = glyph.left - m.actualBoundingBoxLeft;
  const inkTop = baseline - m.actualBoundingBoxAscent;
  const inkRight = glyph.left + m.actualBoundingBoxRight;
  const inkBottom = baseline + m.actualBoundingBoxDescent;

  const left = Math.floor(inkLeft - PAD);
  const top = Math.floor(inkTop - PAD);
  const width = Math.ceil(inkRight + PAD) - left;
  const height = Math.ceil(inkBottom + PAD) - top;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.ceil(width * dpr);
  const h = Math.ceil(height * dpr);

  const mask = document.createElement("canvas");
  mask.width = w;
  mask.height = h;
  const ctx = mask.getContext("2d", { willReadFrequently: true })!;
  ctx.scale(dpr, dpr);
  ctx.font = probe.font;
  ctx.letterSpacing = probe.letterSpacing;
  ctx.fillStyle = "#000";
  ctx.fillText("O", glyph.left - left, baseline - top);
  const image = ctx.getImageData(0, 0, w, h);
  const alpha = (i: number) => image.data[i * 4 + 3];

  // Flood fill (4-way) the empty pixels connected to the glyph's centre.
  const sx = Math.round(((inkLeft + inkRight) / 2 - left) * dpr);
  const sy = Math.round(((inkTop + inkBottom) / 2 - top) * dpr);
  if (alpha(sy * w + sx) >= 128) return null;
  const inside = new Uint8Array(w * h);
  const stack = [sy * w + sx];
  inside[sy * w + sx] = 1;
  let minX = sx, maxX = sx, minY = sy, maxY = sy;
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    // Reaching the edge means the "hole" isn't enclosed: the glyph didn't match.
    if (x === 0 || y === 0 || x === w - 1 || y === h - 1) return null;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    for (const n of [i - 1, i + 1, i - w, i + w]) {
      if (!inside[n] && alpha(n) < 128) {
        inside[n] = 1;
        stack.push(n);
      }
    }
  }

  // Mask: opaque in the hole, easing off over the anti-aliased edge of the stroke.
  for (let i = 0; i < w * h; i++) {
    const d = image.data;
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 0;
    d[i * 4 + 3] = inside[i] ? 255 - alpha(i) : 0;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.putImageData(image, 0, 0);

  return {
    left: left - box.left,
    top: top - box.top,
    width,
    height,
    dpr,
    mask,
    cx: (minX + maxX + 1) / 2 / dpr,
    cy: (minY + maxY + 1) / 2 / dpr,
    rx: (maxX - minX + 1) / 2 / dpr,
    ry: (maxY - minY + 1) / 2 / dpr,
  };
}

/** Time that only runs while the tab is visible, so the cycle picks up where it left off. */
function pausableClock() {
  let base = 0;
  let since: number | null = document.hidden ? null : performance.now();
  return {
    now: () => base + (since === null ? 0 : performance.now() - since),
    pause() {
      if (since === null) return;
      base += performance.now() - since;
      since = null;
    },
    resume() {
      if (since === null) since = performance.now();
    },
  };
}

export function OSmoke({ wrapRef, fillRef, measureKey }: Props) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const wrap = wrapRef.current;
    const fill = fillRef.current;
    const ctx = canvas?.getContext("2d");
    const octx = overlay?.getContext("2d");
    if (!canvas || !overlay || !wrap || !fill || !ctx || !octx) return;

    const fast = new URLSearchParams(window.location.search).get("smokeFast") === "1";
    const timing = fast ? O_SMOKE.fast : O_SMOKE;
    const fullAt = timing.fillMs;
    const releaseAt = fullAt + timing.fullMs;
    const pauseAt = releaseAt + timing.releaseMs;
    const cycle = pauseAt + timing.pauseMs;

    const sprites = O_SMOKE.colors.map(makeSprite);
    const [light, dark] = [O_SMOKE.colors[2], O_SMOKE.colors[1]];
    const clock = pausableClock();
    let hole: Hole | null = null;
    let puffs: Puff[] = [];
    let escaping: Escaping[] = [];
    let raf = 0;
    let wake: ReturnType<typeof setTimeout> | undefined;
    let last = 0;
    let lastCycle = -1;
    let released = false;
    let overlayDirty = false;

    const place = () => {
      hole = measureHole(wrap, fill);
      puffs = [];
      if (!hole) {
        canvas.style.display = "none";
        return;
      }
      canvas.style.display = "block";
      canvas.style.left = `${hole.left}px`;
      canvas.style.top = `${hole.top}px`;
      canvas.style.width = `${hole.width}px`;
      canvas.style.height = `${hole.height}px`;
      canvas.width = Math.ceil(hole.width * hole.dpr);
      canvas.height = Math.ceil(hole.height * hole.dpr);
      if (reduce) drawStatic();
      else kick();
    };

    const sizeOverlay = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      overlay.width = Math.round(window.innerWidth * dpr);
      overlay.height = Math.round(window.innerHeight * dpr);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Clip whatever was drawn to the hole.
    const clip = (h: Hole) => {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(h.mask, 0, 0, h.width, h.height);
      ctx.globalCompositeOperation = "source-over";
    };

    // ── The level: how far up the hole the smoke has collected, with a soft moving wave on top ──
    const bottomOf = (h: Hole) => h.cy + h.ry;
    const levelY = (h: Hole, level: number, x: number, time: number, calm: number) => {
      const nx = (x - h.cx) / h.rx;
      const wave = h.ry * calm * (0.07 * Math.sin(nx * 2.4 + time * 0.0012) + 0.04 * Math.sin(nx * 5.1 - time * 0.0019 + 1.3));
      return bottomOf(h) - level * 2 * h.ry + wave;
    };

    // The dense part under the level: a gradient body, darker toward the bottom.
    const drawBody = (h: Hole, level: number, density: number, time: number, calm: number) => {
      if (density <= 0.002) return;
      const top = bottomOf(h) - level * 2 * h.ry;
      ctx.beginPath();
      ctx.moveTo(0, h.height);
      for (let x = 0; x <= h.width; x += 3) ctx.lineTo(x, levelY(h, level, x, time, calm) + h.ry * 0.05);
      ctx.lineTo(h.width, h.height);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, top, 0, bottomOf(h));
      g.addColorStop(0, light);
      g.addColorStop(1, dark);
      ctx.globalAlpha = Math.min(1, 0.55 * density + 0.1);
      ctx.fillStyle = g;
      ctx.fill();
    };

    const spawn = (h: Hole, kind: Kind, level: number, time: number): Puff => {
      const x = h.cx + rand(-0.9, 0.9) * h.rx;
      const edge = levelY(h, level, x, time, 1);
      const y =
        kind === "body" ? rand(Math.max(edge, h.cy - h.ry), bottomOf(h)) : kind === "edge" ? edge + rand(-0.04, 0.08) * h.ry : rand(h.cy - h.ry, Math.min(edge, bottomOf(h)) - h.ry * 0.05);
      const r = h.rx * (kind === "body" ? rand(0.32, 0.55) : kind === "edge" ? rand(0.22, 0.36) : rand(0.12, 0.2));
      return {
        kind,
        x,
        y,
        vx: rand(-1, 1) * h.rx * 0.25,
        vy: rand(-1, 1) * h.ry * 0.1,
        r,
        age: 0,
        life: kind === "wisp" ? rand(2200, 3800) : rand(3000, 5500),
        sprite: kind === "wisp" ? 2 : Math.floor(Math.random() * sprites.length),
        phase: rand(0, Math.PI * 2),
      };
    };

    // Curl + a slow swirl; body puffs stay under the level, edge puffs ride it, wisps drift above.
    const step = (h: Hole, dt: number, time: number, level: number, speed: number, press: number) => {
      const s = dt / 1000;
      for (const p of puffs) {
        p.age += dt;
        const nx = (p.x - h.cx) / h.rx;
        const ny = (p.y - h.cy) / h.ry;
        const curl = Math.sin(ny * 2.3 + time * 0.0007 + p.phase) + Math.cos(nx * 1.9 - time * 0.0005);
        const angle = curl * Math.PI;
        const swirl = p.kind === "wisp" ? 1.2 : 0.6;
        let ax = Math.cos(angle) * h.rx * 0.9 - ny * h.rx * swirl;
        let ay = Math.sin(angle) * h.ry * 0.6 + nx * h.ry * swirl * 0.6;
        const edge = levelY(h, level, p.x, time, 1);
        if (p.kind === "body" && p.y < edge) ay += (edge - p.y) * 18;
        if (p.kind === "edge") ay += (edge - p.y) * 10;
        if (p.kind === "wisp" && p.y > edge - h.ry * 0.05) ay -= h.ry * 3;
        const e = nx * nx + ny * ny;
        // Soft wall; while "full" the wall sits further out so the smoke presses against the stroke.
        const wall = 0.6 + press * 0.35;
        if (e > wall) {
          ax -= nx * (e - wall) * h.rx * 14;
          ay -= ny * (e - wall) * h.ry * 14;
        } else if (press) {
          ax += nx * h.rx * press * 1.2;
          ay += ny * h.ry * press * 1.2;
        }
        p.vx = (p.vx + ax * s * speed) * 0.95;
        p.vy = (p.vy + ay * s * speed) * 0.95;
        p.x += p.vx * s * speed;
        p.y += p.vy * s * speed;
      }
    };

    const drawPuffs = (opacity: number, swell: number) => {
      for (const p of puffs) {
        const t = p.age / p.life;
        // Fade in, hold, fade out; a replacement takes its place.
        const life = Math.max(0, Math.min(1, t / 0.15, (1 - t) / 0.25));
        if (p.kind === "wisp") {
          // A thin curl: a stretched puff turned along its motion.
          const len = p.r * 3.2;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx) + Math.sin(p.phase + p.age * 0.002) * 0.6);
          ctx.globalAlpha = 0.55 * life;
          ctx.drawImage(sprites[p.sprite], -len / 2, -p.r * 0.45, len, p.r * 0.9);
          ctx.restore();
          continue;
        }
        const size = 2 * p.r * swell * (0.9 + 0.25 * t);
        ctx.globalAlpha = Math.min(1, opacity * life * (p.kind === "edge" ? 0.8 : 1));
        ctx.drawImage(sprites[p.sprite], p.x - size / 2, p.y - size / 2, size, size);
      }
    };

    const drawStatic = () => {
      const h = hole;
      if (!h) return;
      ctx.setTransform(h.dpr, 0, 0, h.dpr, 0, 0);
      ctx.clearRect(0, 0, h.width, h.height);
      drawBody(h, 1.1, O_SMOKE.staticHaze, 0, 0);
      clip(h);
    };

    // Everything in the O leaves at once: onto the page canvas, outward, up and away.
    const release = (h: Hole) => {
      const at = canvas.getBoundingClientRect();
      const from = puffs.filter((p) => p.kind !== "wisp");
      escaping = Array.from({ length: O_SMOKE.maxParticles }, (_, i) => {
        const src = from[i];
        const a = rand(0, Math.PI * 2);
        const d = Math.sqrt(Math.random()) * 0.85;
        const x = src ? src.x : h.cx + Math.cos(a) * h.rx * d;
        const y = src ? src.y : h.cy + Math.sin(a) * h.ry * d;
        const dx = (x - h.cx) / h.rx;
        const dy = (y - h.cy) / h.ry;
        const r0 = h.rx * rand(0.4, 0.75);
        return {
          x: at.left + x,
          y: at.top + y,
          // A burst out of the O, then rising.
          // (Gentle rise: the wordmark sits near the top, so a fast one would be gone in a second.)
          vx: (dx + rand(-0.6, 0.6)) * rand(90, 220),
          vy: dy * rand(50, 120) - rand(15, 45),
          ay: -rand(30, 65),
          r0,
          r1: r0 * rand(2.4, 3.8),
          alpha: rand(0.5, 0.85),
          sprite: Math.floor(Math.random() * sprites.length),
          phase: rand(0, Math.PI * 2),
          sway: rand(8, 22),
        };
      });
      puffs = [];
    };

    const drawEscaping = (q: number) => {
      octx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (q >= 1) {
        escaping = [];
        overlayDirty = false;
        return;
      }
      overlayDirty = true;
      const t = (q * timing.releaseMs) / 1000;
      const fade = (1 - q) ** 1.2;
      for (const e of escaping) {
        // The outward burst slows; the rise keeps going.
        const burst = 1 - Math.exp(-t * 2.2);
        const x = e.x + (e.vx / 2.2) * burst + Math.sin(e.phase + t * 2.2) * e.sway * q;
        const y = e.y + (e.vy / 2.2) * burst + 0.5 * e.ay * t * t;
        const size = 2 * (e.r0 + (e.r1 - e.r0) * (1 - (1 - q) ** 2));
        if (y + size < 0) continue;
        octx.globalAlpha = e.alpha * fade;
        octx.drawImage(sprites[e.sprite], x - size / 2, y - size / 2, size, size);
      }
      octx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(now - last, 50) : 16;
      last = now;
      const h = hole;
      if (!h) return;
      const total = clock.now();
      const at = total % cycle;
      const n = Math.floor(total / cycle);
      if (n !== lastCycle) {
        lastCycle = n;
        released = false;
        puffs = [];
      }

      ctx.setTransform(h.dpr, 0, 0, h.dpr, 0, 0);
      ctx.clearRect(0, 0, h.width, h.height);

      if (at < releaseAt) {
        const filling = at < fullAt;
        const p = filling ? at / fullAt : 1;
        // The level rises steadily from the bottom (linear); the smoke under it thickens (ease-in),
        // starting already visible so the first seconds show smoke, not an empty hole.
        const level = filling ? 0.1 + 0.9 * p : 1.15;
        const density = filling ? 0.5 + 0.5 * p ** 1.6 : 1;
        const pulse = filling ? 0 : Math.sin(((at - fullAt) / timing.fullMs) * Math.PI * 6);
        const calm = filling ? 1 - 0.6 * p : 0.4;

        const max = O_SMOKE.maxParticles;
        const want = {
          body: Math.round(4 + level * (max * 0.6)),
          edge: filling ? Math.round(5 + 4 * p) : 0,
          wisp: filling ? Math.round(5 - 3 * p) : 0,
        };
        puffs = puffs.filter((q) => q.age < q.life);
        for (const kind of ["body", "edge", "wisp"] as const) {
          let have = puffs.filter((q) => q.kind === kind).length;
          while (have++ < want[kind]) puffs.push(spawn(h, kind, level, total));
        }
        step(h, dt, total, level, filling ? 1 : 2.6, filling ? 0 : 1);
        drawBody(h, level, density, total, calm);
        drawPuffs(0.35 + 0.45 * density, filling ? 1 : 1.1 + 0.05 * pulse);
        clip(h);
      } else if (at < pauseAt) {
        if (!released) {
          released = true;
          release(h);
        }
        const q = (at - releaseAt) / timing.releaseMs;
        // The last of the smoke leaves the hole in the first moment of the release.
        const left = Math.max(0, 1 - q / 0.1);
        if (left > 0) {
          drawBody(h, 1.15 * left, left, total, 0.4);
          clip(h);
        }
        drawEscaping(q);
      } else {
        if (overlayDirty) drawEscaping(1);
        // Empty: nothing to draw until the next fill starts.
        last = 0;
        wake = setTimeout(kick, cycle - at);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    function kick() {
      clearTimeout(wake);
      if (raf || reduce || document.hidden || !hole) return;
      raf = requestAnimationFrame(frame);
    }

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(wake);
      last = 0;
    };

    const onVisibility = () => {
      if (document.hidden) {
        clock.pause();
        stop();
      } else {
        clock.resume();
        kick();
      }
    };

    sizeOverlay();
    place();
    const observer = new ResizeObserver(place);
    observer.observe(wrap);
    const onResize = () => {
      sizeOverlay();
      place();
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    let alive = true;
    void document.fonts.ready.then(() => alive && place());

    return () => {
      alive = false;
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [wrapRef, fillRef, measureKey, reduce]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute" style={{ display: "none" }} />
      {createPortal(
        <canvas ref={overlayRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[62] h-full w-full" />,
        document.body,
      )}
    </>
  );
}
