import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "../i18n";
import { DISCOUNT_RATE, passGate, useGate } from "../lib/gate";

// First thing every new visitor sees: a scratch card. Scratching it off reveals a 10% discount,
// then the card asks whether they're 21+. "Yes" opens the site and keeps the discount (src/lib/gate.ts);
// "No" keeps it closed. The rest of the page is inert behind it until then.

type Step = "scratch" | "ask" | "denied";

const BRUSH = 26;
/** Share of the foil that has to be scratched off before the rest falls away. */
const REVEAL_AT = 0.5;

export function AgeGate() {
  const { verified } = useGate();
  const reduce = useReducedMotion();

  // While it's up, nothing behind it can be reached or scrolled.
  useLayoutEffect(() => {
    const root = document.getElementById("root");
    if (verified || !root) return;
    root.inert = true;
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      root.inert = false;
      document.documentElement.style.overflow = overflow;
    };
  }, [verified]);

  return createPortal(
    <AnimatePresence>
      {!verified && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto p-4"
          style={{ background: "rgba(12, 12, 14, 0.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : 0.5, delay: reduce ? 0 : 0.15 } }}
        >
          <GateCard />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function GateCard() {
  const { t, dir, percent } = useLocale();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("scratch");
  const [revealed, setRevealed] = useState(false);
  const yesRef = useRef<HTMLButtonElement>(null);
  const pct = percent(DISCOUNT_RATE);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    window.setTimeout(() => setStep("ask"), reduce ? 0 : 650);
  };

  useEffect(() => {
    if (step === "ask") yesRef.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      dir={dir}
      className="relative w-full max-w-[380px] rounded-[28px] bg-white px-6 pb-6 pt-7 text-center text-neutral-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] sm:px-7"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 rtl:tracking-normal">{t("gate.label")}</p>
      <h2 id="gate-title" className="mt-2 text-xl font-black leading-tight">
        {step === "denied" ? t("gate.deniedTitle") : t("gate.title")}
      </h2>

      <ScratchCard pct={pct} revealed={revealed} onReveal={reveal} />

      <AnimatePresence mode="wait" initial={false}>
        {step === "scratch" && (
          <motion.button
            key="reveal"
            type="button"
            onClick={reveal}
            exit={{ opacity: 0 }}
            className="mt-3 text-xs font-semibold text-neutral-500 underline underline-offset-4 outline-none hover:text-neutral-800 focus-visible:outline-[3px] focus-visible:outline-neutral-900"
          >
            {t("gate.reveal")}
          </motion.button>
        )}

        {step === "ask" && (
          <motion.div key="ask" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="mt-4 text-sm text-neutral-600">{t("gate.wonNote")}</p>
            <p className="mt-5 text-lg font-extrabold">{t("gate.ask")}</p>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2.5">
              <button
                ref={yesRef}
                type="button"
                onClick={passGate}
                className="h-12 rounded-full bg-neutral-900 px-5 font-bold text-white outline-none transition-transform hover:scale-[1.02] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-neutral-900 active:scale-[0.98]"
              >
                {t("gate.yes")}
              </button>
              <button
                type="button"
                onClick={() => setStep("denied")}
                className="h-12 rounded-full border border-neutral-300 px-6 font-bold text-neutral-700 outline-none hover:bg-neutral-100 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                {t("gate.no")}
              </button>
            </div>
          </motion.div>
        )}

        {step === "denied" && (
          <motion.div key="denied" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <p className="mt-5 text-sm text-neutral-700">{t("gate.denied")}</p>
            <button
              type="button"
              onClick={() => setStep("ask")}
              className="mt-4 text-xs font-semibold text-neutral-500 underline underline-offset-4 outline-none hover:text-neutral-800 focus-visible:outline-[3px] focus-visible:outline-neutral-900"
            >
              {t("gate.back")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * The ticket: the prize printed underneath, a silver foil on a canvas on top. Dragging scratches the
 * foil away; past REVEAL_AT the rest fades off.
 */
function ScratchCard({ pct, revealed, onReveal }: { pct: string; revealed: boolean; onReveal: () => void }) {
  const { t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);

  // Paint the foil at the canvas's real size; again once the web font is in, if nobody has
  // scratched yet (so the label isn't stuck in the fallback font).
  useLayoutEffect(() => {
    paint();
    void document.fonts.ready.then(() => strokes.current === 0 && paint());
  }, [t]);

  function paint() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);

    const foil = ctx.createLinearGradient(0, 0, width, height);
    foil.addColorStop(0, "#b9bdc4");
    foil.addColorStop(0.35, "#eceef1");
    foil.addColorStop(0.55, "#c4c8ce");
    foil.addColorStop(0.8, "#f2f3f5");
    foil.addColorStop(1, "#aeb2b9");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, width, height);
    // Fine diagonal grain, like a real ticket.
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let x = -height; x < width; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(60, 64, 72, 0.75)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round(height * 0.17)}px Montserrat, Vazirmatn, system-ui, sans-serif`;
    ctx.fillText(t("gate.scratchHere"), width / 2, height / 2 - height * 0.04);
    ctx.font = `600 ${Math.round(height * 0.24)}px system-ui, sans-serif`;
    ctx.fillText("✦  ✦  ✦", width / 2, height / 2 + height * 0.24);
  }

  const at = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    // Opaque, so each stroke removes the foil completely (the grain left a translucent style set).
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    const from = last.current ?? to;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    last.current = to;
    if (++strokes.current % 6 === 0 && cleared() >= REVEAL_AT) onReveal();
  };

  // Share of the foil already scratched off (sampled, not every pixel).
  const cleared = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    return total ? clear / total : 0;
  };

  return (
    <div className="relative mx-auto mt-5 aspect-[16/9] w-full select-none overflow-hidden rounded-[20px]">
      {/* The prize, printed under the foil. */}
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ background: "linear-gradient(120deg, #ff5f6d 0%, #ffc371 30%, #7ee8a2 55%, #5ab9ff 78%, #b56cff 100%)" }}
      >
        <motion.div animate={revealed ? { scale: [1, 1.12, 1] } : undefined} transition={{ duration: 0.6 }} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          <p className="text-5xl font-black leading-none tracking-tight">{pct}</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] rtl:tracking-normal">{t("gate.won", { pct })}</p>
        </motion.div>
      </div>
      <motion.canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        animate={{ opacity: revealed ? 0 : 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{ pointerEvents: revealed ? "none" : undefined }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          last.current = null;
          scratch(at(e));
        }}
        onPointerMove={(e) => e.buttons > 0 && scratch(at(e))}
        onPointerUp={() => {
          last.current = null;
          if (cleared() >= REVEAL_AT) onReveal();
        }}
      />
      {/* Screen readers get the prize once it's revealed. */}
      <p className="sr-only" aria-live="polite">
        {revealed ? t("gate.won", { pct }) : ""}
      </p>
    </div>
  );
}
