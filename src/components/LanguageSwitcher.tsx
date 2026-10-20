import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { LANG_SWITCH } from "../config/home";
import { dirOf, LANG_NAMES, LANGS, switchLanguage, useLocale, type Lang } from "../i18n";
import { createWisps, WISP_CANVAS_HEIGHT } from "../lib/wisps";

const LIST_ID = "language-list";
const seconds = (ms: number) => ms / 1000;

type Props = {
  /** The switcher button; the menu measures against it. */
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** The centred bar label: the expanded options stop LANG_SWITCH.labelGapPx before it. */
  labelRef: RefObject<HTMLElement | null>;
  /** True while the expanded options need the label's space (narrow screens). */
  onCrowd: (crowded: boolean) => void;
};

/**
 * Shows only the current language. On hover/focus the other two condense out of smoke beside it,
 * growing toward the page centre; choosing one (or leaving) dissolves them back into smoke.
 */
export function LanguageSwitcher({ buttonRef, labelRef, onCrowd }: Props) {
  const { t, lang, dir } = useLocale();
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [crowd, setCrowd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wisps = useRef<ReturnType<typeof createWisps> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const expandedRef = useRef(false);
  const others = LANGS.filter((l) => l !== lang);

  useEffect(() => {
    if (reduce || !canvasRef.current) return;
    wisps.current = createWisps(canvasRef.current);
    return () => {
      wisps.current?.destroy();
      wisps.current = null;
    };
  }, [reduce]);

  const visibleOptions = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>("[role=option][data-other=true]") ?? []);

  const expand = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (expandedRef.current) return;
    expandedRef.current = true;
    visibleOptions().forEach((el, k) => wisps.current?.condense(el, k * LANG_SWITCH.staggerMs));
    setExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    clearTimeout(closeTimer.current);
    if (!expandedRef.current) return;
    expandedRef.current = false;
    visibleOptions().forEach((el, k) => wisps.current?.dissolve(el, k * LANG_SWITCH.staggerMs));
    setExpanded(false);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => onCrowd(expanded && crowd), [expanded, crowd, onCrowd]);

  // Touch: tap outside closes.
  useEffect(() => {
    if (!expanded) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) collapse();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [expanded, collapse]);

  // Do the options fit between the button and the label?
  useLayoutEffect(() => {
    if (!expanded) return;
    const measure = () => {
      const button = buttonRef.current?.getBoundingClientRect();
      const label = labelRef.current?.getBoundingClientRect();
      const list = listRef.current;
      if (!button || !label || !list) return;
      const listBox = list.getBoundingClientRect();
      const room = dir === "rtl" ? button.left - LANG_SWITCH.labelGapPx - label.right : label.left - LANG_SWITCH.labelGapPx - button.right;
      const used = dir === "rtl" ? button.left - listBox.left : listBox.right - button.right;
      setCrowd(used > room);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [expanded, dir, labelRef, buttonRef, lang]);

  const choose = (next: Lang) => {
    collapse();
    buttonRef.current?.focus({ preventScroll: true });
    void switchLanguage(next);
  };

  const focusOption = (index: number) => {
    const options = visibleOptions();
    options[(index + options.length) % options.length]?.focus();
  };

  const onButtonKey = (e: KeyboardEvent) => {
    if (!["Enter", " ", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    expand();
    requestAnimationFrame(() => focusOption(0));
  };

  const onListKey = (e: KeyboardEvent) => {
    const options = visibleOptions();
    const at = options.indexOf(document.activeElement as HTMLElement);
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === forward || e.key === "ArrowDown") focusOption(at + 1);
    else if (e.key === back || e.key === "ArrowUp") focusOption(at - 1);
    else if (e.key === "Enter" || e.key === " ") {
      const chosen = (document.activeElement as HTMLElement | null)?.dataset.lang;
      if (chosen && LANGS.includes(chosen as Lang)) choose(chosen as Lang);
    } else if (e.key === "Escape") {
      collapse();
      buttonRef.current?.focus();
    } else return;
    e.preventDefault();
  };

  const onEnter = (e: PointerEvent) => e.pointerType !== "touch" && expand();
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(collapse, LANG_SWITCH.closeDelayMs);
  };

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto relative flex items-center"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onBlur={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) collapse();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={LIST_ID}
        aria-label={t("language.button", { name: LANG_NAMES[lang] })}
        lang={lang}
        dir={dirOf(lang)}
        onClick={() => (expanded ? collapse() : expand())}
        onKeyDown={onButtonKey}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && expand()}
        className="flex h-11 items-center whitespace-nowrap rounded-full px-1.5 text-xs font-medium text-ink focus-visible:outline-[3px] focus-visible:-outline-offset-4 focus-visible:outline-ink sm:text-[13px]"
      >
        {LANG_NAMES[lang]}
      </button>

      {/* Every language stays in the listbox for screen readers; only the other two are drawn. */}
      <ul
        ref={listRef}
        id={LIST_ID}
        role="listbox"
        aria-label={t("language.list")}
        onKeyDown={onListKey}
        className="absolute start-full top-1/2 flex items-center gap-1"
        style={{ translate: "0 -50%", pointerEvents: expanded ? "auto" : "none" }}
      >
        {LANGS.map((l) => {
          const other = l !== lang;
          const order = others.indexOf(l);
          return (
            <motion.li
              key={l}
              role="option"
              aria-selected={!other}
              tabIndex={-1}
              lang={l}
              dir={dirOf(l)}
              data-lang={l}
              data-other={other}
              onClick={() => (other ? choose(l) : collapse())}
              className={`${other ? "" : "sr-only"} flex h-11 cursor-pointer items-center whitespace-nowrap rounded-full px-2 text-xs font-medium text-ink outline-none hover:text-[#2d6280] focus-visible:outline-[3px] focus-visible:-outline-offset-4 focus-visible:outline-ink sm:text-[13px]`}
              initial={false}
              animate={
                expanded && other
                  ? { opacity: 1, filter: reduce ? "none" : "blur(0px)" }
                  : { opacity: 0, filter: reduce ? "none" : "blur(6px)" }
              }
              transition={
                reduce
                  ? { duration: 0.2 }
                  : expanded
                    ? { duration: seconds(LANG_SWITCH.condenseMs) * 0.7, delay: seconds(LANG_SWITCH.condenseMs) * 0.3 + seconds(order * LANG_SWITCH.staggerMs), ease: "easeOut" }
                    : { duration: seconds(LANG_SWITCH.dissolveMs) * 0.6, delay: seconds(Math.max(0, order) * LANG_SWITCH.staggerMs), ease: "easeIn" }
              }
            >
              {LANG_NAMES[l]}
            </motion.li>
          );
        })}
      </ul>

      {!reduce &&
        createPortal(
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[70] w-full"
            style={{ height: WISP_CANVAS_HEIGHT }}
          />,
          document.body,
        )}
    </div>
  );
}
