import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { pages } from "../data/pages";
import { DENIM, DWELL_ARM_PX, HEADER, LAYOUTS, TALL_BELOW } from "../config/home";
import { HOME_TITLE } from "../data/pages";
import { Cat } from "./Cat";
import { Haze } from "./Haze";
import { Shard } from "./Shard";
import { SmokeCanvas } from "./SmokeCanvas";
import { Sparkle } from "./Sparkle";
import { TopBar } from "./TopBar";

const LABEL = "Graphic design prompts for";
const labelClass = "inline-block rounded-full text-[10px] font-medium uppercase tracking-[0.35em] text-neutral-800 sm:text-xs";
const labelStyle = { padding: "6px 14px", background: `${DENIM.base}0f` };

export function Hero() {
  const [active, setActive] = useState<number | null>(null);
  const [catHover, setCatHover] = useState(false);
  const [burstAt, setBurstAt] = useState(0);
  const [armed, setArmed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [shiftCap, setShiftCap] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0, kind: "wide" as keyof typeof LAYOUTS });
  const layout = LAYOUTS[frame.kind];

  // Pick the composition that suits the stage, then fit the largest frame of that ratio.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const kind = width / height < TALL_BELOW ? "tall" : "wide";
      const { ratio } = LAYOUTS[kind];
      const w = Math.min(width, height * ratio);
      setFrame({ width: w, height: w / ratio, kind });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // "CLAUDE" + subtitle slide down by HEADER.shift, but never closer to the cat than catClearancePx.
  // The shift is a transform, so header height and with it the cat and shards stay exactly in place.
  useLayoutEffect(() => {
    const title = titleRef.current;
    const cat = catRef.current;
    if (!title || !cat || !frame.height) return;
    const room = cat.getBoundingClientRect().top - title.getBoundingClientRect().bottom - HEADER.catClearancePx;
    setShiftCap(Math.max(0, Math.floor(room)));
  }, [frame]);

  useEffect(() => {
    document.title = HOME_TITLE;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hover-to-open arms only after the pointer really moves here, so a pointer resting on a
  // shard at load doesn't dwell. Also reset when the page is restored from the back/forward cache.
  useEffect(() => {
    let origin: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (!origin) origin = { x: e.clientX, y: e.clientY };
      else if (Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > DWELL_ARM_PX) setArmed(true);
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      origin = null;
      setArmed(false);
      setActive(null);
      setCatHover(false);
    };
    // A page opened in another tab: this tab goes back to rest, with no ring or hover left over.
    const onLeaveTab = () => {
      setActive(null);
      setResetKey((n) => n + 1);
    };
    const onVisibility = () => document.hidden && onLeaveTab();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("blur", onLeaveTab);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("blur", onLeaveTab);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <TopBar
        center={
          <p className={`${labelClass} shrink-0 backdrop-blur-sm max-sm:tracking-[0.25em]`} style={labelStyle}>
            {LABEL}
          </p>
        }
      />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex min-h-svh flex-col overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 42%, #f4f4f4 0%, #f4f4f4 38%, #e9e9e9 100%)" }}
      >
        <header className="relative px-4 pt-10 text-center sm:pt-12" style={{ paddingBottom: "clamp(16px, 2.2vw, 24px)" }}>
          {/* The visible label lives in the fixed top bar; this invisible copy keeps the header's height. */}
          <p aria-hidden="true" className={`${labelClass} invisible`} style={labelStyle}>
            {LABEL}
          </p>
          <div ref={titleRef}>
            <div
              style={{
                translate: `0 ${shiftCap === null ? "0px" : `min(${HEADER.shift}, ${shiftCap}px)`}`,
              }}
            >
              <h1
                className="mt-2 font-black leading-[0.82] tracking-[-0.045em] text-ink"
                style={{ fontSize: "clamp(3.5rem, min(20.5vw, 30svh), 24rem)" }}
              >
                CLAUDE
              </h1>
              <p className="mt-3 text-sm text-neutral-500 sm:text-base">
                Instantly level up your work using Claude.ai!
              </p>
            </div>
          </div>
        </header>

        <Haze thick={catHover} />

        {/* Stage: fills the remaining height; the frame sits bottom-centre inside it. */}
        <div ref={stageRef} className="relative min-h-[300px] flex-1">
          <div
            className="absolute bottom-0 left-1/2"
            style={{ width: frame.width, height: frame.height, transform: "translateX(-50%)" }}
          >
            {/* layout.shards is sorted left → right, so shard i opens pages[i]. Tab order follows. */}
            {layout.shards.map((placement, i) => {
              const page = pages[i];
              return (
                <Shard
                  key={page.id}
                  page={page}
                  placement={placement}
                  width={layout.shardWidth}
                  index={i}
                  armed={armed}
                  resetKey={resetKey}
                  active={active === page.id}
                  dimmed={active !== null && active !== page.id}
                  onEnter={setActive}
                  onLeave={(id) => setActive((cur) => (cur === id ? null : cur))}
                />
              );
            })}

            {layout.sparkles.map((s, i) => (
              <Sparkle
                key={i}
                spokes={i === 0 ? 10 : 12}
                className="absolute z-[15]"
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.width}%` }}
              />
            ))}

            <Cat
              ref={catRef}
              placement={layout.cat}
              onHoverChange={setCatHover}
              onTap={() => setBurstAt(Date.now())}
            />

            <SmokeCanvas hovering={catHover} burstAt={burstAt} catRef={catRef} />
          </div>
        </div>
      </motion.main>
    </>
  );
}
