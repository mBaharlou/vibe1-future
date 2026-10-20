import type { CSSProperties, MouseEvent, Ref } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HEAD_ORIGIN, JOINT, type JointPlacement } from "../config/home";
import type { PageData } from "../data/pages";
import { useLocale } from "../i18n";
import { NEW_TAB } from "../lib/tabs";

type Props = {
  page: PageData;
  placement: JointPlacement;
  /** Left → right position; offsets the load stagger and the sway loop. */
  order: number;
  hovered: boolean;
  dimmed: boolean;
  /** Ember flares while the joint is being "smoked" (just selected). */
  flaring: boolean;
  /** The pop-up was blocked: the next click lets the link open the tab itself. */
  blocked: boolean;
  emberRef: Ref<HTMLSpanElement>;
  onHover: (hovering: boolean) => void;
  onSelect: (e: MouseEvent<HTMLAnchorElement>) => void;
};

const spread = (i: number, salt: number) => ((i * 0.618 + salt) % 1 + 1) % 1;

/**
 * A joint coming out of the cat's head: filter end behind the head, lit tip pointing out.
 * Placed in % of the cat frame, so it scales with the cat. Never mirrored in RTL.
 */
export function Joint({ page, placement, order, hovered, dimmed, flaring, blocked, emberRef, onHover, onSelect }: Props) {
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

  return (
    <a
      href={page.path}
      {...NEW_TAB}
      aria-label={t("joint.ariaLabel", { title })}
      data-joint={page.key}
      data-blocked={blocked}
      className="joint absolute block rounded-full outline-none focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
      style={{
        left: `${HEAD_ORIGIN.x}%`,
        top: `${HEAD_ORIGIN.y}%`,
        width: `${JOINT.length}%`,
        aspectRatio: 1 / JOINT.aspect,
        transformOrigin: "0 50%",
        transform: `translateY(-50%) rotate(${placement.angle}deg) translateX(${offset}%)`,
      }}
      onPointerEnter={(e) => e.pointerType !== "touch" && onHover(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      onClick={onSelect}
    >
      <span className="joint-sway block h-full w-full" style={sway}>
        <motion.span
          className="relative block h-full w-full"
          style={{ transformOrigin: "50% 50%" }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: `-${intro.slidePct}%` }}
          animate={{ opacity: dimmed ? JOINT.hover.dimOpacity : 1, x: "0%", scale: hovered && !reduce ? JOINT.hover.scale : 1 }}
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
          {/* Ember at the lit tip; also where this joint's smoke rises from. */}
          <span
            ref={emberRef}
            aria-hidden="true"
            className="joint-ember"
            data-hot={hovered}
            data-flare={flaring}
            style={{ "--ember": JOINT.ember.color, "--ember-s": `${JOINT.ember.pulseS}s` } as CSSProperties}
          />
        </motion.span>
      </span>
      {blocked && (
        <span
          className="joint-hint"
          role="status"
          // Sits above the tip, upright whatever the joint's angle.
          style={{ transform: `translate(-50%, -50%) rotate(${-placement.angle}deg) translateY(-190%)` }}
        >
          {t("joint.hintBlocked")}
        </span>
      )}
    </a>
  );
}
