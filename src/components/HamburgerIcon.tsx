import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { HAMBURGER } from "../config/home";

const SLATS = [
  { id: "top", length: 100 },
  { id: "mid", length: 70 },
  { id: "bot", length: 85 },
] as const;

/**
 * Three 3D slats (charcoal front, denim back). Tilts toward a nearby cursor; on open the slats
 * flip one after another like a split-flap board, then fold into an X. Pure CSS 3D; the only
 * script is the smoothed tilt. Never mirrored in RTL.
 */
export function HamburgerIcon({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  const tiltRef = useRef<HTMLSpanElement>(null);

  // Magnetic tilt: the target follows the pointer within tiltRadiusPx; a rAF loop eases toward it
  // and stops once settled.
  useEffect(() => {
    const el = tiltRef.current;
    if (!el || reduce) return;
    const target = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      now.x += (target.x - now.x) * HAMBURGER.tiltSmoothing;
      now.y += (target.y - now.y) * HAMBURGER.tiltSmoothing;
      el.style.transform = `rotateX(${now.x.toFixed(2)}deg) rotateY(${now.y.toFixed(2)}deg)`;
      const settled = Math.abs(target.x - now.x) < 0.02 && Math.abs(target.y - now.y) < 0.02;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const box = el.getBoundingClientRect();
      const dx = e.clientX - (box.left + box.width / 2);
      const dy = e.clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy);
      const r = HAMBURGER.tiltRadiusPx;
      // Strongest at mid-distance, fading to 0 at the edge of the radius.
      const pull = dist > r ? 0 : Math.min(1, dist / (r * 0.35)) * (1 - dist / r) * 1.6;
      const nx = dist ? dx / dist : 0;
      const ny = dist ? dy / dist : 0;
      target.y = nx * HAMBURGER.tiltDeg * Math.min(1, pull);
      target.x = -ny * HAMBURGER.tiltDeg * Math.min(1, pull);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <span
      aria-hidden="true"
      className="ham"
      data-open={open}
      style={{ "--ham-persp": `${HAMBURGER.perspectivePx}px`, "--ham-stagger": `${HAMBURGER.flipStaggerMs}ms` } as CSSProperties}
    >
      <span className="ham-3d">
        <span className="ham-press">
          <span ref={tiltRef} className="ham-tilt">
            <span className="ham-wobble">
              {SLATS.map((slat, i) => (
                <span
                  key={slat.id}
                  className={`ham-slat ham-slat-${slat.id}`}
                  style={{ "--len": `${slat.length}%`, "--i": i, "--ri": SLATS.length - 1 - i } as CSSProperties}
                >
                  <span className="ham-flip">
                    <span className="ham-face ham-face-front" />
                    <span className="ham-face ham-face-back" />
                  </span>
                </span>
              ))}
            </span>
          </span>
        </span>
      </span>
      {/* Reduced motion: a plain crossfade between ≡ and ✕. */}
      <span className="ham-flat">
        <svg viewBox="0 0 20 14" className="ham-flat-bars">
          <path d="M1 1h18M1 7h13M1 13h16" />
        </svg>
        <svg viewBox="0 0 20 14" className="ham-flat-x">
          <path d="M4 1l12 12M16 1L4 13" />
        </svg>
      </span>
    </span>
  );
}
