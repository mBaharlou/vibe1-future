import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router";
import { pages } from "../data/pages";
import { CAT, HEAD_ORIGIN, HEADER, JOINT, LIGHT, SELECT, WORDMARK, type JointPlacement } from "../config/home";
import { useLocale } from "../i18n";
import { playExhale, playLighter, type Lighting } from "../lib/sound";
import { openInNewTab } from "../lib/tabs";
import patternSvg from "../assets/joint-pattern.svg?raw";
import { Cat } from "./Cat";
import { Haze } from "./Haze";
import { Joint, type JointStage } from "./Joint";
import { OSmoke } from "./OSmoke";
import { JointSmoke, type JointSmokeHandle } from "./JointSmoke";
import { SmokeCanvas } from "./SmokeCanvas";
import { TopBar } from "./TopBar";

type Fan = keyof typeof JOINT.fans;
type Mode = "hover" | "click";
type Active = { index: number; stage: JointStage; flame: boolean; mode: Mode; lightMs: number };

const patternUrl = `url("data:image/svg+xml,${encodeURIComponent(patternSvg)}")`;

// Extent of the cat frame plus its fan of joints, in units of the cat frame's width, with the
// frame's bottom centre at (0, 0) and y pointing down (so the top is negative).
function fanBounds(fan: JointPlacement[]) {
  const catH = 1 / CAT.aspect;
  const origin = { x: HEAD_ORIGIN.x / 100 - 0.5, y: -catH + (HEAD_ORIGIN.y / 100) * catH };
  const len = JOINT.fitLength / 100;
  const half = (len * JOINT.aspect) / 2 + len * 0.04; // + a little for the ember glow
  let minX = -0.5, maxX = 0.5, minY = -catH;
  for (const { angle, dist } of fan) {
    const a = (angle * Math.PI) / 180;
    const d = { x: Math.cos(a), y: Math.sin(a) };
    const n = { x: -d.y, y: d.x };
    for (const along of [dist / 100, dist / 100 + len]) {
      for (const side of [-half, half]) {
        const x = origin.x + d.x * along + n.x * side;
        const y = origin.y + d.y * along + n.y * side;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
      }
    }
  }
  return { halfWidth: Math.max(-minX, maxX), height: -minY };
}

/** Joints sorted left → right by where their tips point. */
const leftToRight = (fan: JointPlacement[]) =>
  [...fan].sort((a, b) => Math.cos((a.angle * Math.PI) / 180) - Math.cos((b.angle * Math.PI) / 180));

export function Hero() {
  const { t, dir, lang } = useLocale();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [catHover, setCatHover] = useState(false);
  const [burstAt, setBurstAt] = useState(0);
  const [active, setActive] = useState<Active | null>(null);
  const [flaring, setFlaring] = useState<number | null>(null);
  const [fade, setFade] = useState(0);
  const [armed, setArmed] = useState(false);
  const [shiftCap, setShiftCap] = useState<number | null>(null);
  const [fit, setFit] = useState({ catWidth: 0, fan: "wide" as Fan, fanTop: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkFillRef = useRef<HTMLSpanElement>(null);
  const smokeRef = useRef<JointSmokeHandle>(null);
  const emberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lighting = useRef<Lighting | null>(null);
  const activeRef = useRef<Active | null>(null);
  activeRef.current = active;
  const fan = leftToRight(JOINT.fans[fit.fan]);

  // Size the cat so it, and the joints fanning out of its head, fit the stage without scrolling.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const kind: Fan = width / height < JOINT.tallBelow ? "tall" : "wide";
      const b = fanBounds(JOINT.fans[kind]);
      const m = JOINT.marginPx;
      const catWidth = Math.max(
        0,
        Math.min((width - 2 * m) / (2 * b.halfWidth), (height - m) / b.height, height * JOINT.catMaxHeight * CAT.aspect),
      );
      setFit({ catWidth, fan: kind, fanTop: entry.target.getBoundingClientRect().bottom - catWidth * b.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // "JOINT" + subtitle slide down by HEADER.shift, but stay catClearancePx clear of the cat and its
  // joints. The shift is a transform, so it never changes the layout (or the cat's size).
  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title || !fit.catWidth) return;
    const room = fit.fanTop - title.getBoundingClientRect().bottom - HEADER.catClearancePx;
    setShiftCap(Math.max(0, Math.floor(room)));
  }, [fit]);

  useEffect(() => {
    document.title = t("meta.homeTitle");
  }, [t]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));

  // Back at rest: unlit joints, no flame, flare or overlay, sound stopped.
  const reset = useCallback(() => {
    clearTimers();
    lighting.current?.stop();
    lighting.current = null;
    setActive(null);
    setFlaring(null);
    setFade(0);
  }, []);

  // Leaving the tab (a page opened in a new one) resets everything. Hover only lights a joint
  // after the pointer has really moved here, so coming Back with the pointer resting on a joint
  // doesn't light it and send you straight on again.
  useEffect(() => {
    let origin: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (!origin) origin = { x: e.clientX, y: e.clientY };
      else if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > LIGHT.armPx) setArmed(true);
    };
    const onVisibility = () => document.hidden && reset();
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      reset();
      origin = null;
      setArmed(false);
      setCatHover(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", reset);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", reset);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      reset();
    };
  }, [reset]);

  const tipOf = (i: number) => {
    const r = emberRefs.current[i]?.getBoundingClientRect();
    return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  };
  const getLitTips = useCallback(() => pages.map((_, i) => (activeRef.current?.index === i && activeRef.current.stage === "lit" ? tipOf(i) : null)), []);

  // The way to the page: a quiet exhale, the ember flares, a big puff swells over the page, then
  // the page opens in a new tab, or here if the browser blocks the pop-up (hover isn't a click).
  const go = (index: number) => {
    const page = pages[index];
    playExhale();
    setFlaring(page.id);
    const tip = tipOf(index);
    if (reduce) setFade((n) => n + 1);
    else if (tip) later(SELECT.flareMs * 0.6, () => smokeRef.current?.burst(tip.x, tip.y));
    later(SELECT.openAfterMs, () => {
      if (openInNewTab(page.path)) later(SELECT.burstMs, reset);
      else navigate(page.path);
    });
  };

  // Lighter: sparks on each flint strike, the flame once it catches, then the joint is lit, puffs
  // its first smoke, and after a short hold goes to its page.
  const light = (index: number, mode: Mode) => {
    const cur = activeRef.current;
    if (cur?.stage === "lit") return; // already on its way to a page
    if (cur && (cur.index !== index || mode === "click")) cancel(cur.index, cur.index !== index);
    if (cur?.index === index && mode === "hover") return; // already lighting
    const lightMs = mode === "click" ? LIGHT.clickMs : LIGHT.ms;
    const plan = playLighter(lightMs);
    lighting.current = plan;
    setActive({ index, stage: "lighting", flame: false, mode, lightMs });
    if (!reduce) {
      for (const at of plan.strikes) later(at, () => {
        const tip = tipOf(index);
        if (tip) smokeRef.current?.sparks(tip.x, tip.y);
      });
    }
    later(plan.catchAt, () => setActive((a) => (a && a.index === index ? { ...a, flame: true } : a)));
    later(lightMs, () => {
      lighting.current = null;
      setActive((a) => (a && a.index === index ? { ...a, stage: "lit", flame: false } : a));
      const tip = tipOf(index);
      if (tip && !reduce) smokeRef.current?.firstPuff(tip.x, tip.y);
      later(mode === "click" ? LIGHT.clickHoldMs : LIGHT.holdAfterLightMs, () => go(index));
    });
  };

  // Pointer left / focus lost before it caught: the sound fades, the flame goes out in a wisp.
  function cancel(index: number, wisp = true) {
    const cur = activeRef.current;
    if (!cur || cur.index !== index || cur.stage !== "lighting") return;
    clearTimers();
    lighting.current?.stop();
    lighting.current = null;
    const tip = tipOf(index);
    if (wisp && cur.flame && tip) smokeRef.current?.wisp(tip.x, tip.y);
    activeRef.current = null;
    setActive(null);
  }

  // Click / tap / Enter: the fast lighting, then the page opens in a new tab (still inside the
  // click's activation window).
  const select = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    light(index, "click");
  };

  const catHeight = fit.catWidth / CAT.aspect;

  return (
    <>
      <TopBar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex h-dvh flex-col overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 42%, #f4f4f4 0%, #f4f4f4 38%, #e9e9e9 100%)" }}
      >
        <header className="relative shrink-0 px-4 pt-10 text-center sm:pt-12" style={{ paddingBottom: "clamp(16px, 2.2vw, 24px)" }}>
          {/* Holds the space the old label pill took, so the wordmark sits where it always has. */}
          <div
            aria-hidden="true"
            className="h-[var(--spacer)] sm:h-[var(--spacer-sm)]"
            style={{ "--spacer": `${HEADER.spacerPx}px`, "--spacer-sm": `${HEADER.spacerDesktopPx}px` } as CSSProperties}
          />
          <div ref={titleRef}>
            <div ref={wordmarkRef} className="relative" style={{ translate: `0 ${shiftCap === null ? "0px" : `min(${HEADER.shift}, ${shiftCap}px)`}` }}>
              {/* Real, selectable text; the rainbow + pattern only fills the letters. */}
              <h1
                lang="en"
                dir="ltr"
                data-eyes-avoid=""
                className="wordmark font-brand mx-auto mt-2 w-fit font-black leading-[0.82] tracking-[-0.045em]"
                style={
                  {
                    fontSize: "clamp(3.5rem, min(20.5vw, 30svh), 24rem)",
                    "--wm-pattern": patternUrl,
                    "--wm-scale": `${WORDMARK.patternScale}em`,
                    "--wm-drift-s": `${WORDMARK.driftS}s`,
                    "--wm-hue-s": `${WORDMARK.hueS}s`,
                  } as CSSProperties
                }
              >
                <span ref={wordmarkFillRef} className="wordmark-fill">JOINT</span>
              </h1>
              {/* Smoke in the O's hole: a canvas over the letter, clipped to the hole only. */}
              <OSmoke wrapRef={wordmarkRef} fillRef={wordmarkFillRef} measureKey={`${lang}-${dir}`} />
              <p data-eyes-avoid="" className="mx-auto mt-3 w-fit text-sm text-neutral-500 sm:text-base">
                {t("hero.subtitle")}
              </p>
            </div>
          </div>
        </header>

        <Haze thick={catHover} />

        {/* Stage: the rest of the screen. The cat frame stands on its bottom edge. */}
        <div ref={stageRef} className="relative min-h-0 flex-1">
          <div
            data-eyes-avoid=""
            className="absolute bottom-0 left-1/2"
            style={{ width: fit.catWidth, height: catHeight, transform: "translateX(-50%)" }}
          >
            {/* Behind the cat (lower z), so the filter ends tuck behind its head. Pages follow
                reading order: Page 1 is the leftmost joint in LTR, the rightmost in RTL. DOM and
                tab order follow the pages. */}
            <div className="absolute inset-0 z-10">
              {pages.map((page, n) => {
                const i = dir === "rtl" ? fan.length - 1 - n : n;
                const mine = active?.index === n ? active : null;
                return (
                  <Joint
                    key={page.id}
                    page={page}
                    placement={fan[i]}
                    order={i}
                    stage={mine?.stage ?? "unlit"}
                    flame={!!mine?.flame}
                    lightMs={mine?.lightMs ?? LIGHT.ms}
                    dimmed={active !== null && !mine}
                    flaring={flaring === page.id}
                    emberRef={(el) => {
                      emberRefs.current[n] = el;
                    }}
                    onLight={() => armed && light(n, "hover")}
                    onCancel={() => cancel(n)}
                    onSelect={select(n)}
                  />
                );
              })}
            </div>

            <Cat
              ref={catRef}
              placement={{ height: 100, bottom: 0 }}
              alt={t("hero.catAlt")}
              onHoverChange={setCatHover}
              onTap={() => setBurstAt(Date.now())}
            />
          </div>

          <SmokeCanvas hovering={catHover} burstAt={burstAt} catRef={catRef} />
        </div>

        <JointSmoke ref={smokeRef} getLitTips={getLitTips} />

        {/* Reduced motion: a plain fade stands in for the smoke burst. */}
        <AnimatePresence>
          {reduce && fade > 0 && (
            <motion.div
              key={fade}
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-[40] bg-[#f1efec]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.75, 0] }}
              transition={{ duration: SELECT.burstMs / 1000, times: [0, 0.4, 1] }}
              onAnimationComplete={() => setFade(0)}
            />
          )}
        </AnimatePresence>
      </motion.main>
    </>
  );
}
