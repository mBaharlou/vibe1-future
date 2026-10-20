import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DENIM, HAMBURGER, MENU, SHARD } from "../config/home";
import { pages } from "../data/pages";
import { useLocale } from "../i18n";
import { NEW_TAB } from "../lib/tabs";
import { HamburgerIcon } from "./HamburgerIcon";

const NAV_ID = "site-menu";
// A click right after hover opened the menu is the same gesture; don't let it close again.
const CLICK_AFTER_HOVER_MS = 400;

type Props = {
  /** The centred bar label: the menu stops MENU.labelGapPx before it. */
  labelRef: RefObject<HTMLElement | null>;
  /** The language switcher: the menu never reaches it, even with the label hidden. */
  switcherRef: RefObject<HTMLElement | null>;
  /** True while the open menu needs the label's space (narrow screens). */
  onCrowd: (crowded: boolean) => void;
};

type Fit = { width: number; crowd: boolean; scroll: boolean };

const isHoverPointer = (e: PointerEvent) => e.pointerType !== "touch";
const seconds = (ms: number) => ms / 1000;

/**
 * Hamburger at the bar's end. The menu opens sideways inside the bar, from the button toward the
 * centred label (mirrored in RTL), as one row of page links that open in new tabs.
 */
export function Menu({ labelRef, switcherRef, onCrowd }: Props) {
  const { t, dir } = useLocale();
  const reduce = useReducedMotion();
  const rtl = dir === "rtl";
  const [open, setOpen] = useState(false);
  const [fit, setFit] = useState<Fit | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hoverOpenedAt = useRef(0);
  const focusFirst = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(false);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => onCrowd(open && !!fit?.crowd), [open, fit, onCrowd]);

  // Leaving the tab (a page just opened in a new one) resets the menu.
  useEffect(() => {
    window.addEventListener("blur", close);
    return () => window.removeEventListener("blur", close);
  }, [close]);

  // Touch: tapping anywhere outside closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  // Room between the button and the label (or, if the items need more, the switcher).
  const measure = useCallback(() => {
    const button = buttonRef.current?.getBoundingClientRect();
    const label = labelRef.current?.getBoundingClientRect();
    const switcher = switcherRef.current?.getBoundingClientRect();
    const list = listRef.current;
    if (!button || !label || !switcher || !list) return;
    // offsetWidth, not scrollWidth: the items slide in with a transform that would inflate it.
    const content = list.offsetWidth;
    const toLabel = rtl
      ? label.left - MENU.labelGapPx - (button.right + MENU.buttonGapPx)
      : button.left - MENU.buttonGapPx - (label.right + MENU.labelGapPx);
    const toSwitcher = rtl
      ? switcher.left - MENU.switcherGapPx - (button.right + MENU.buttonGapPx)
      : button.left - MENU.buttonGapPx - (switcher.right + MENU.switcherGapPx);
    const crowd = content > toLabel;
    const room = Math.max(0, Math.floor(crowd ? toSwitcher : toLabel));
    setFit({ width: Math.min(content, room), crowd, scroll: content > room });
  }, [labelRef, switcherRef, rtl]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const observer = new ResizeObserver(measure);
    if (labelRef.current) observer.observe(labelRef.current);
    if (switcherRef.current) observer.observe(switcherRef.current);
    if (listRef.current) observer.observe(listRef.current);
    observer.observe(document.documentElement);
    // Web fonts change the items' width once they arrive.
    void document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [open, measure, labelRef, switcherRef]);

  useEffect(() => {
    if (!open || !fit || !focusFirst.current) return;
    focusFirst.current = false;
    listRef.current?.querySelector("a")?.focus();
  }, [open, fit]);

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
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      close();
      buttonRef.current?.focus();
      return;
    }
    const links = Array.from(listRef.current?.querySelectorAll("a") ?? []);
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (at < 0) return;
    // Arrow keys follow what you see: in RTL the row runs right → left.
    const step = ({ ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 } as Record<string, number>)[e.key];
    const next = e.key === "Home" ? 0 : e.key === "End" ? links.length - 1 : step !== undefined ? at + step : -1;
    if (next < 0 || next >= links.length) return;
    e.preventDefault();
    links[next].focus();
  };

  const onBlur = (e: FocusEvent) => {
    if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) close();
  };

  // Collapsed at the edge next to the button; the reveal runs toward the label.
  const clipClosed = rtl ? "inset(0% 100% 0% 0% round 999px)" : "inset(0% 0% 0% 100% round 999px)";
  const clipOpen = "inset(0% 0% 0% 0% round 999px)";
  const slide = (rtl ? -1 : 1) * 10;

  const track = {
    closed: reduce
      ? { opacity: 0, transition: { duration: 0.2 } }
      : {
          clipPath: clipClosed,
          // Items leave farthest-first while the track folds back into the button.
          transition: { duration: seconds(MENU.closeMs), ease: MENU.ease, staggerChildren: seconds(MENU.itemStaggerMs), staggerDirection: 1 },
        },
    open: reduce
      ? { opacity: 1, transition: { duration: 0.2 } }
      : {
          clipPath: clipOpen,
          // Nearest the button first, which is the last item in reading order.
          transition: {
            duration: seconds(MENU.openMs),
            ease: MENU.ease,
            delayChildren: 0.06,
            staggerChildren: seconds(MENU.itemStaggerMs),
            staggerDirection: -1,
          },
        },
  };
  const item = {
    closed: reduce ? { opacity: 0 } : { opacity: 0, x: slide, transition: { duration: 0.16, ease: "easeIn" as const } },
    open: reduce ? { opacity: 1 } : { opacity: 1, x: 0, transition: { duration: 0.32, ease: MENU.ease } },
  };

  return (
    <div ref={wrapRef} className="pointer-events-auto relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      {/* Hover is tracked on the button and the menu themselves, not this wrapper: when the menu
          unmounts under the pointer, the wrapper never gets a pointerleave and would stop reopening. */}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? t("menu.close") : t("menu.open")}
        aria-expanded={open}
        aria-controls={NAV_ID}
        onClick={onButtonClick}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(true)}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        className="grid place-items-center rounded-full focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-ink"
        style={{ width: HAMBURGER.hitPx, height: HAMBURGER.hitPx }}
      >
        <HamburgerIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id={NAV_ID}
            aria-label={t("menu.navLabel")}
            className="menu-track absolute top-1/2 h-9 rounded-full bg-white/45 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
            data-scroll={fit?.scroll}
            style={{
              insetInlineEnd: `calc(100% + ${MENU.buttonGapPx}px)`,
              translate: "0 -50%",
              width: fit?.width ?? 0,
            }}
            variants={track}
            initial="closed"
            animate="open"
            exit="closed"
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          >
            <ul ref={listRef} className="flex h-full w-max items-center px-0.5 sm:px-2">
              {pages.map((page) => (
                <motion.li key={page.id} variants={item}>
                  <a
                    href={page.path}
                    {...NEW_TAB}
                    onClick={close}
                    className="menu-item flex h-9 items-center gap-1 whitespace-nowrap rounded-full px-[3px] text-[11px] font-medium text-ink focus-visible:outline-[3px] focus-visible:-outline-offset-2 focus-visible:outline-ink sm:gap-2 sm:px-3 sm:text-[13px]"
                  >
                    <svg aria-hidden="true" viewBox={`0 0 100 ${100 * SHARD.aspect}`} className="w-1.5 shrink-0 rotate-12 sm:w-2.5">
                      <polygon points={SHARD.points} fill={DENIM.base} />
                    </svg>
                    <span className="menu-item-label relative">{t(`pages.${page.key}.title`)}</span>
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
