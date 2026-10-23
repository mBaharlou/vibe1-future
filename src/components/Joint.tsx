import type { CSSProperties, MouseEvent, Ref } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HEAD_ORIGIN, JOINT, LIGHT, type JointPlacement } from "../config/home";
import type { PageData } from "../data/pages";
import { useLocale } from "../i18n";

/** unlit: at rest · lighting: the lighter is going (flame once it catches) · lit: burning, smoking. */
export type JointStage = "unlit" | "lighting" | "lit";

type Props = {
  page: PageData;
  placement: JointPlacement;
  /** Left → right position; offsets the load stagger and the sway loop. */
  order: number;
  stage: JointStage;
  /** The lighter's flame is showing (it has caught, not yet lit the joint). */
  flame: boolean;
  /** How long this lighting takes, so the tip's glow-up matches it. */
  lightMs: number;
  dimmed: boolean;
  /** Ember flares on the way to the page. */
  flaring: boolean;
  emberRef: Ref<HTMLSpanElement>;
  /** Hover or keyboard focus. */
  onLight: () => void;
  onCancel: () => void;
  onSelect: (e: MouseEvent<HTMLAnchorElement>) => void;
};

const spread = (i: number, salt: number) => ((i * 0.618 + salt) % 1 + 1) % 1;

/**
 * A joint coming out of the cat's head: filter end behind the head, tip pointing out.
 * Placed in % of the cat frame, so it scales with the cat. Never mirrored in RTL.
 */
export function Joint({ page, placement, order, stage, flame, lightMs, dimmed, flaring, emberRef, onLight, onCancel, onSelect }: Props) {
  const { t } = useLocale();
  const reduce = useReducedMotion();
  const title = t(`pages.${page.key}.title`);
  // translateX in % of the joint's own length: the filter end sits `dist` out from the head.
  const offset = (placement.dist / JOINT.length) * 100;
  const sway = {
    "--sway-deg": `${JOINT.sway.deg}deg`,
    "--sway-s": `${JOINT.sway.minS + spread(order, 0.3) * (JOINT.sway.maxS - JOINT.sway.minS)}s`,
    "--sway-delay": `${-spread(order, 0.7) * JOINT.sway.maxS}s`,
  } as CSSProperties;
  const intro = JOINT.intro;
  const active = stage !== "unlit";

  return (
    <a
      href={page.path}
      aria-label={t("joint.ariaLabel", { title })}
      data-joint={page.key}
      data-stage={stage}
      data-eyes-avoid=""
      className="joint absolute block rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
      style={{
        left: `${HEAD_ORIGIN.x}%`,
        top: `${HEAD_ORIGIN.y}%`,
        width: `${JOINT.length}%`,
        aspectRatio: 1 / JOINT.aspect,
        transformOrigin: "0 50%",
        transform: `translateY(-50%) rotate(${placement.angle}deg) translateX(${offset}%)`,
      }}
      onPointerEnter={(e) => e.pointerType !== "touch" && onLight()}
      onPointerLeave={(e) => e.pointerType !== "touch" && onCancel()}
      // Keyboard focus lights it like hover; a tap's focus doesn't (the tap itself does).
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && onLight()}
      onBlur={onCancel}
      onClick={onSelect}
    >
      <span className="joint-sway block h-full w-full" style={sway}>
        <motion.span
          className="relative block h-full w-full"
          style={{ transformOrigin: "50% 50%" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: `-${intro.slidePct}%` }}
          animate={{ opacity: dimmed ? JOINT.hover.dimOpacity : 1, x: "0%", scale: active && !reduce ? JOINT.hover.scale : 1 }}
          transition={{
            opacity: { duration: 0.4, ease: "easeOut", delay: 0 },
            x: { duration: intro.ms / 1000, ease: intro.ease, delay: (order * intro.staggerMs) / 1000 },
            scale: { duration: 0.35, ease: intro.ease },
          }}
        >
          <motion.span
            className="block h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: (intro.ms * 0.7) / 1000, ease: "easeOut", delay: (order * intro.staggerMs) / 1000 }}
          >
            <picture>
              <source srcSet={JOINT.src} type="image/webp" />
              <img src={JOINT.fallbackSrc} alt="" draggable={false} className="block h-full w-full select-none" />
            </picture>
          </motion.span>
          {/* The tip: dark at rest, glows up while lighting, a bright ember once lit. Smoke and
              sparks come from here. */}
          <span
            ref={emberRef}
            aria-hidden="true"
            className="joint-ember"
            data-stage={stage}
            data-flare={flaring}
            style={
              {
                "--ember": JOINT.ember.color,
                "--light-ms": `${lightMs}ms`,
                "--pre-glow": LIGHT.preGlow,
              } as CSSProperties
            }
          />
          {/* Lighter flame, kept upright whatever the joint's angle. */}
          {flame && !reduce && (
            <span className="joint-flame-anchor" style={{ transform: `rotate(${-placement.angle}deg)` }}>
              <span className="joint-flame" style={{ height: `${LIGHT.flameScale * 100}%` }}>
                <svg viewBox="0 0 20 34" aria-hidden="true">
                  <defs>
                    <radialGradient id={`flame-${page.key}`} cx="50%" cy="72%" r="62%">
                      <stop offset="0%" stopColor="#fffbe6" />
                      <stop offset="28%" stopColor="#ffe27a" />
                      <stop offset="62%" stopColor="#ffa233" />
                      <stop offset="100%" stopColor="#ff6a1a" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path d="M10 1 C 14 9, 19 15, 18 23 C 17.4 29.5, 13.8 33, 10 33 C 6.2 33, 2.6 29.5, 2 23 C 1 15, 6 9, 10 1 Z" fill={`url(#flame-${page.key})`} />
                  <path d="M10 16 C 12 20, 13.4 23, 13 26.5 C 12.7 29.5, 11.4 31, 10 31 C 8.6 31, 7.3 29.5, 7 26.5 C 6.6 23, 8 20, 10 16 Z" fill="#6fb6ff" fillOpacity="0.55" />
                </svg>
              </span>
            </span>
          )}
        </motion.span>
      </span>
    </a>
  );
}
