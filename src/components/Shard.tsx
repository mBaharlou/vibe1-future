import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PageData } from "../data/pages";
import {
  BLOCKED_PULSE,
  COLOR_DRIFT,
  DENIM,
  DWELL_MS,
  FLOAT,
  GLOW,
  HOVER,
  INTRO,
  RIPPLE,
  SHARD,
  type ShardPlacement,
} from "../config/home";
import { useLocale } from "../i18n";
import { shiftLightness } from "../lib/color";
import { NEW_TAB, openInNewTab } from "../lib/tabs";
import { ShardPreview } from "./ShardPreview";

type Props = {
  page: PageData;
  placement: ShardPlacement;
  /** Shared width as % of the hero frame. */
  width: number;
  /** Position in the left → right order; used to offset ambient loops. */
  index: number;
  active: boolean;
  dimmed: boolean;
  /** False until the pointer has really moved on this page; stops a resting pointer from dwelling on load. */
  armed: boolean;
  /** Changes whenever this tab loses focus (a page tab opened); drops the dwell. */
  resetKey: number;
  onEnter: (id: number) => void;
  onLeave: (id: number) => void;
};

// dwelling: ring drawing · opened: page opened, ring back at 0 until the pointer leaves ·
// blocked: dwell done but the pop-up was blocked, ring stays full until the pointer leaves.
type Phase = "idle" | "dwelling" | "opened" | "blocked";

// Spread a 0–1 value per shard so the four loops never line up.
const spread = (index: number, salt: number) => ((index * 0.618 + salt) % 1 + 1) % 1;
const viewBox = `0 0 100 ${100 * SHARD.aspect}`;

export function Shard({ page, placement, width, index, active, dimmed, armed, resetKey, onEnter, onLeave }: Props) {
  const reduce = useReducedMotion();
  const { t } = useLocale();
  const title = t(`pages.${page.key}.title`);
  const [phase, setPhase] = useState<Phase>("idle");
  const [ripples, setRipples] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const pointerInside = useRef(false);
  // After a reset with the pointer still resting here, wait for a fresh enter before dwelling again.
  const waitForLeave = useRef(false);
  const ringFull = phase === "dwelling" || phase === "blocked";
  const side = placement.cx < 50 ? "left" : "right";
  const previewId = `shard-preview-${page.id}`;

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), INTRO.fadeMs + index * INTRO.staggerMs);
    return () => clearTimeout(t);
  }, [index]);

  useEffect(() => {
    if (resetKey === 0) return;
    waitForLeave.current = pointerInside.current;
    setPhase("idle");
  }, [resetKey]);

  // The page has opened in a new tab; this tab only pulses the shard.
  const opened = useCallback(() => {
    setPhase((cur) => (cur === "idle" ? cur : "opened"));
    setRipples((n) => n + 1);
  }, []);

  // Dwell: hovering for DWELL_MS opens the page. Keyboard focus never auto-opens.
  // A pop-up without a click is usually blocked; then the shard asks for a click instead.
  useEffect(() => {
    if (phase !== "dwelling") return;
    const t = setTimeout(() => {
      if (openInNewTab(page.path)) opened();
      else setPhase("blocked");
    }, DWELL_MS);
    return () => clearTimeout(t);
  }, [phase, page.path, opened]);

  const startHover = () => {
    pointerInside.current = true;
    if (phase !== "idle" || !armed || waitForLeave.current) return;
    setPhase("dwelling");
    onEnter(page.id);
  };

  const endHover = () => {
    pointerInside.current = false;
    waitForLeave.current = false;
    setPhase("idle");
    onLeave(page.id);
  };

  const vars = {
    "--c": page.color,
    "--c-light": shiftLightness(page.color, COLOR_DRIFT.lightness),
    "--c-dark": shiftLightness(page.color, -COLOR_DRIFT.lightness),
    "--c-tint": shiftLightness(page.color, DENIM.tint),
    "--drift-s": `${COLOR_DRIFT.seconds}s`,
    "--drift-delay": `${-spread(index, 0.1) * COLOR_DRIFT.seconds}s`,
    "--float-px": `${FLOAT.px}px`,
    "--float-s": `${FLOAT.minS + spread(index, 0.3) * (FLOAT.maxS - FLOAT.minS)}s`,
    "--float-delay": `${-spread(index, 0.5) * FLOAT.maxS}s`,
    "--glow-min": GLOW.min,
    "--glow-max": GLOW.max,
    "--glow-static": GLOW.staticOpacity,
    "--glow-scale": GLOW.scale,
    "--breathe-s": `${GLOW.minS + spread(index, 0.7) * (GLOW.maxS - GLOW.minS)}s`,
    "--breathe-delay": `${-spread(index, 0.9) * GLOW.maxS}s`,
  } as CSSProperties;

  const glow = (
    <svg viewBox={viewBox} className="h-full w-full overflow-visible" style={{ filter: `blur(${GLOW.blurPx}px)` }}>
      <polygon points={SHARD.points} className="shard-drift" />
    </svg>
  );

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${placement.cx - width / 2}%`,
        top: `${placement.top}%`,
        width: `${width}%`,
        aspectRatio: 1 / SHARD.aspect,
      }}
    >
      <motion.a
        href={page.path}
        {...NEW_TAB}
        aria-label={t("shard.ariaLabel", { title })}
        aria-describedby={active ? previewId : undefined}
        data-active={active}
        data-phase={phase}
        className="pointer-events-none relative z-10 block h-full w-full rounded-lg outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        style={{ rotate: placement.rotate, ...vars }}
        initial={{ opacity: 0, y: reduce ? 0 : INTRO.slidePx }}
        animate={{ opacity: dimmed ? HOVER.dimOpacity : 1, y: 0, scale: active && !reduce ? HOVER.scale : 1 }}
        transition={{
          opacity: introDone
            ? { duration: 0.3, ease: "easeOut" }
            : { duration: INTRO.fadeMs / 1000, ease: "easeOut", delay: (index * INTRO.staggerMs) / 1000 },
          y: { duration: INTRO.fadeMs / 1000, ease: "easeOut", delay: (index * INTRO.staggerMs) / 1000 },
          scale: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
        onPointerEnter={(e) => e.pointerType !== "touch" && startHover()}
        onPointerMove={(e) => e.pointerType !== "touch" && startHover()}
        onPointerLeave={(e) => e.pointerType !== "touch" && endHover()}
        onFocus={() => onEnter(page.id)}
        onBlur={() => onLeave(page.id)}
        // Click, tap and Enter skip the dwell; the link itself opens the new tab.
        onClick={opened}
      >
        <div className="shard-float relative h-full w-full">
          {/* Ambient glow breathes; it pauses and hands over to the brighter glow while active. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: active ? 0 : 1 }}
          >
            <div className="shard-breathe h-full w-full" data-paused={active}>
              {glow}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: active ? GLOW.active : 0 }}
          >
            {glow}
          </div>

          <svg viewBox={viewBox} aria-hidden="true" className="relative h-full w-full overflow-visible">
            <polygon
              points={SHARD.points}
              className="shard-drift shard-main"
              // Transparent stroke widens the hit area beyond the painted edge.
              stroke="transparent"
              strokeWidth={16}
              strokeLinejoin="round"
              style={{ pointerEvents: "visible", cursor: "pointer" }}
            />
            {/* Dwell progress: draws around the outline, rewinds if the pointer leaves early. */}
            <motion.polygon
              points={SHARD.points}
              fill="none"
              stroke={shiftLightness(page.color, DENIM.shade)}
              strokeWidth={3}
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={reduce ? undefined : "1 2"}
              className="shard-ring"
              style={{ pointerEvents: "none" }}
              initial={reduce ? { opacity: 0 } : { strokeDashoffset: 1 }}
              animate={
                phase === "blocked"
                  ? { strokeDashoffset: 0, opacity: reduce ? 1 : [1, BLOCKED_PULSE.minOpacity, 1] }
                  : reduce
                    ? { opacity: ringFull ? 1 : 0 }
                    : { strokeDashoffset: ringFull ? 0 : 1, opacity: 1 }
              }
              transition={
                phase === "blocked"
                  ? { duration: BLOCKED_PULSE.seconds, ease: "easeInOut", repeat: Infinity }
                  : reduce
                    ? { duration: 0.3 }
                    : ringFull
                      ? { duration: DWELL_MS / 1000, ease: "linear" }
                      : { duration: HOVER.rewindMs / 1000, ease: "easeOut" }
              }
            />
            {/* Opened: a short pulse on the shard instead of covering the screen. */}
            {ripples > 0 && !reduce && (
              <motion.polygon
                key={ripples}
                points={SHARD.points}
                fill="var(--c-tint)"
                stroke={page.color}
                strokeWidth={2}
                strokeLinejoin="round"
                style={{ pointerEvents: "none", transformBox: "fill-box", transformOrigin: "center" }}
                initial={{ scale: 1, opacity: 0.55 }}
                animate={{ scale: RIPPLE.scale, opacity: 0 }}
                transition={{ duration: RIPPLE.ms / 1000, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </svg>
        </div>
      </motion.a>

      <AnimatePresence>
        {active && (
          <ShardPreview
            id={previewId}
            page={page}
            side={side}
            title={title}
            hint={t(
              phase === "blocked"
                ? "shard.hintBlocked"
                : phase === "opened"
                  ? "shard.hintOpened"
                  : phase === "idle"
                    ? "shard.hintKeyboard"
                    : "shard.hintDwelling",
            )}
            onOpen={() => openInNewTab(page.path) && opened()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
