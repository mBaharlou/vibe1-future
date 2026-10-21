import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ASK_CAT, CAT } from "../config/home";
import { useLocale } from "../i18n";
import { useChat } from "../lib/chat";
import { ChatPanel } from "./ChatPanel";

/** The cat's face, cropped from the hero photo into a circle. */
export function CatAvatar({ className = "" }: { className?: string }) {
  const { face } = ASK_CAT;
  return (
    <span className={`block overflow-hidden rounded-full bg-[#d9d6d2] ${className}`}>
      <img
        src={CAT.src}
        alt=""
        draggable={false}
        className="h-full w-full select-none object-cover"
        style={{
          objectPosition: `${face.x}% ${face.y}%`,
          transform: `scale(${face.zoom})`,
          transformOrigin: `${face.origin.x}% ${face.origin.y}%`,
        }}
      />
    </span>
  );
}

// Under the hamburger at the bar's end (mirrored in RTL); the end offset centres it on the hamburger.
const sizeCss = `:root{--ask-size:${ASK_CAT.mobileSize}px}@media (min-width:640px){:root{--ask-size:${ASK_CAT.size}px}}`;

/**
 * "Ask the cat": a round cat avatar under the hamburger on every page, opening a chat panel that
 * grows out of it. Mounted once at the app level, so it and the open chat persist across navigation.
 */
export function AskCat() {
  const { t, lang } = useLocale();
  const chat = useChat(lang);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <style>{sizeCss}</style>
      <div
        data-eyes-avoid=""
        className="ask-cat fixed end-1.5 z-[58] sm:end-4"
        style={{ top: "calc(var(--bar-h) + 12px)", width: "var(--ask-size)", height: "var(--ask-size)" }}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-label={open ? t("ask.close") : t("ask.open")}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls="ask-cat-panel"
          onClick={() => setOpen((o) => !o)}
          className="ask-cat-button group relative block h-full w-full rounded-full focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <span className="ask-cat-bob block h-full w-full">
            <span className="ask-cat-face block h-full w-full rounded-full shadow-[0_6px_18px_-6px_rgba(0,0,0,0.35),0_0_0_2px_#fff,0_0_0_3.5px_rgba(45,98,128,0.35)]">
              <CatAvatar className="h-full w-full" />
            </span>
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -end-1 rounded-full bg-[#2d6280] px-1.5 py-px font-brand text-[9px] font-extrabold leading-[14px] tracking-wide text-white shadow-[0_0_0_2px_#fff]"
            >
              AI
            </span>
          </span>
          {!open && (
            <span
              aria-hidden="true"
              className="ask-cat-tip pointer-events-none absolute top-1/2 end-[calc(100%+12px)] whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white shadow-lg"
            >
              {t("ask.tooltip")}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>{open && <ChatPanel key="panel" chat={chat} onClose={close} />}</AnimatePresence>
    </>
  );
}
