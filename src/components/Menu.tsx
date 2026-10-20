import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DENIM, MENU, SHARD } from "../config/home";
import { pages } from "../data/pages";
import { NEW_TAB } from "../lib/tabs";

const PANEL_ID = "site-menu";
// A click right after hover opened the menu is the same gesture; don't let it close again.
const CLICK_AFTER_HOVER_MS = 400;
// Collapsed to the panel's top-right corner. Open overshoots the edges so the shadow isn't clipped.
const CLIP_CLOSED = "inset(0% 0% 100% 100%)";
const CLIP_OPEN = "inset(-10% -10% -14% -16%)";

const isHoverPointer = (e: PointerEvent) => e.pointerType !== "touch";

/** Top-right hamburger. Hover opens it (tap on touch, Enter/Space on keyboard); the panel grows leftward. */
export function Menu() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverOpenedAt = useRef(0);
  const focusFirst = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = () => {
    cancelClose();
    setOpen(false);
  };

  useEffect(() => cancelClose, []);

  // Leaving the tab (e.g. a page just opened in a new one) always resets the menu.
  useEffect(() => {
    window.addEventListener("blur", close);
    return () => window.removeEventListener("blur", close);
  }, []);

  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    panelRef.current?.querySelector("a")?.focus();
  }, [open]);

  const onPointerEnter = (e: PointerEvent) => {
    if (!isHoverPointer(e)) return;
    cancelClose();
    if (!open) hoverOpenedAt.current = Date.now();
    setOpen(true);
  };

  const onPointerLeave = (e: PointerEvent) => {
    if (!isHoverPointer(e)) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), MENU.closeDelayMs);
  };

  const onButtonClick = (e: MouseEvent) => {
    if (open && Date.now() - hoverOpenedAt.current < CLICK_AFTER_HOVER_MS) return;
    // detail is 0 for Enter/Space: move focus into the menu.
    if (!open && e.detail === 0) focusFirst.current = true;
    cancelClose();
    setOpen(!open);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !open) return;
    e.stopPropagation();
    close();
    buttonRef.current?.focus();
  };

  const onBlur = (e: FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null) && e.relatedTarget) close();
  };

  const seconds = (ms: number) => ms / 1000;

  return (
    // Hover is tracked on the button and the panel themselves, not this wrapper: when the panel
    // unmounts under the pointer, the wrapper never gets a pointerleave and would stop reopening.
    <div className="pointer-events-auto relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        data-open={open}
        onClick={onButtonClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="menu-button group grid place-items-center rounded-full bg-white/55 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
        style={{ width: MENU.buttonPx, height: MENU.buttonPx }}
      >
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <span className="menu-line menu-line-top" />
          <span className="menu-line menu-line-mid" />
          <span className="menu-line menu-line-bot" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            ref={panelRef}
            id={PANEL_ID}
            aria-label="Pages"
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            className="absolute right-0 overflow-y-auto rounded-2xl border border-white/70 bg-[#fafaf8]/80 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.3),0_4px_14px_-6px_rgba(0,0,0,0.08)] backdrop-blur-xl"
            style={{
              top: `calc(100% + ${MENU.gapPx}px)`,
              width: `min(${MENU.widthPx}px, calc(100vw - 32px))`,
              height: MENU.height,
              transformOrigin: "top right",
            }}
            initial={reduce ? { opacity: 0 } : { clipPath: CLIP_CLOSED }}
            animate={reduce ? { opacity: 1 } : { clipPath: CLIP_OPEN }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.2 } }
                : { clipPath: CLIP_CLOSED, transition: { duration: seconds(MENU.closeMs), ease: MENU.ease } }
            }
            transition={reduce ? { duration: 0.2 } : { duration: seconds(MENU.openMs), ease: MENU.ease }}
          >
            <span aria-hidden="true" className="absolute inset-y-5 left-0 w-[2px] rounded-full" style={{ background: DENIM.base }} />
            <ul className="px-3 py-4">
              {pages.map((page, i) => (
                <motion.li
                  key={page.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 10 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{
                    duration: reduce ? 0.2 : 0.3,
                    ease: MENU.ease,
                    delay: reduce ? 0 : 0.08 + seconds(i * MENU.itemStaggerMs),
                  }}
                >
                  <a
                    href={page.path}
                    {...NEW_TAB}
                    onClick={close}
                    className="menu-item flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-ink focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-ink"
                  >
                    <svg aria-hidden="true" viewBox={`0 0 100 ${100 * SHARD.aspect}`} className="w-3 shrink-0 rotate-12">
                      <polygon points={SHARD.points} fill={DENIM.base} />
                    </svg>
                    <span className="menu-item-label relative">{page.title}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
