import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ASK_CAT } from "../config/home";
import { useLocale } from "../i18n";
import type { useChat } from "../lib/chat";
import { Markdown } from "../lib/markdown";
import { CatAvatar } from "./AskCat";

type Props = { chat: ReturnType<typeof useChat>; onClose: () => void };

const MOBILE = "(max-width: 639px)";
const FOCUSABLE = 'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE).matches);
  useEffect(() => {
    const query = window.matchMedia(MOBILE);
    const onChange = () => setMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

/** The chat panel: grows out of the cat button (desktop) or slides up as a bottom sheet (mobile). */
export function ChatPanel({ chat, onClose }: Props) {
  const { t, num } = useLocale();
  const reduce = useReducedMotion();
  const mobile = useMobile();
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = chat.status !== "idle";

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Back to the input once a reply is in.
  useEffect(() => {
    if (!busy) inputRef.current?.focus({ preventScroll: true });
  }, [busy]);

  // Newest message in view.
  useLayoutEffect(() => {
    const list = listRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [chat.messages, chat.status, chat.error, reduce]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy || !draft.trim()) return;
    chat.send(draft);
    setDraft("");
  };

  const onInputKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  // Focus trap: Tab cycles inside the panel while it is open.
  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const { panel } = ASK_CAT;
  // Desktop: just under the cat button (always at the right, like the top bar), growing from the button's centre.
  // The messages inside still follow the page direction.
  const desktopTop = `calc(var(--bar-h) + 12px + var(--ask-size) + ${panel.gapPx}px)`;
  const origin = `calc(100% - var(--ask-size) / 2) calc(-${panel.gapPx}px - var(--ask-size) / 2)`;
  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : mobile
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring" as const, damping: 32, stiffness: 320 } }
      : {
          initial: { opacity: 0, scale: 0.2 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.2 },
          transition: { type: "spring" as const, damping: 26, stiffness: 340 },
        };

  const counter = draft.length >= ASK_CAT.counterFrom;
  const errorText = chat.error && t(`ask.errors.${chat.error}`);

  return (
    <motion.div
      ref={panelRef}
      id="ask-cat-panel"
      role="dialog"
      aria-modal={mobile || undefined}
      aria-labelledby="ask-cat-title"
      data-eyes-avoid=""
      onKeyDown={onPanelKey}
      {...motionProps}
      className={`ask-panel fixed z-[70] flex flex-col overflow-hidden border border-black/[0.06] bg-[#faf9f7]/[0.88] text-ink shadow-[0_24px_60px_-18px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.06)] backdrop-blur-xl ${
        mobile ? "inset-x-0 bottom-0 rounded-t-3xl" : "right-4 rounded-3xl"
      }`}
      style={
        mobile
          ? { height: "calc(100dvh - var(--bar-h))" }
          : {
              top: desktopTop,
              width: `min(${panel.width}px, calc(100vw - 32px))`,
              height: `min(${panel.height}px, calc(100dvh - var(--bar-h) - var(--ask-size) - ${panel.gapPx + 28}px))`,
              transformOrigin: origin,
            }
      }
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b border-black/[0.06] px-4 py-3">
        <CatAvatar className="size-8 shrink-0 shadow-[0_0_0_1.5px_#fff,0_0_0_2.5px_rgba(45,98,128,0.3)]" />
        <h2 id="ask-cat-title" className="min-w-0 flex-1 truncate text-[15px] font-extrabold">
          {t("ask.title")}
        </h2>
        <button
          type="button"
          onClick={chat.reset}
          disabled={!chat.messages.length && !chat.error}
          className="h-8 rounded-full px-3 text-xs font-medium text-neutral-600 hover:bg-black/[0.05] hover:text-ink focus-visible:outline-[3px] focus-visible:outline-ink disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {t("ask.newChat")}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("ask.close")}
          className="grid size-9 place-items-center rounded-full text-neutral-600 hover:bg-black/[0.05] hover:text-ink focus-visible:outline-[3px] focus-visible:outline-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </header>

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 py-4 text-[14px] leading-relaxed rtl:leading-loose">
        <Bubble role="assistant">{t("ask.greeting")}</Bubble>
        {chat.messages.map((m) =>
          m.role === "user" ? (
            <Bubble key={m.id} role="user">
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </Bubble>
          ) : (
            <Bubble key={m.id} role="assistant">
              <Markdown text={m.content} />
            </Bubble>
          ),
        )}
        {chat.status === "waiting" && (
          <div className="self-start rounded-2xl rounded-ss-md bg-white/85 px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]" role="status" aria-label={t("ask.typing")}>
            <span className="ask-typing flex items-center gap-1.5" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        {errorText && (
          <div role="alert" className="flex flex-wrap items-center gap-2 self-stretch rounded-2xl border border-[#c4206f]/20 bg-[#c4206f]/[0.06] px-3.5 py-2.5 text-[13px] text-[#7a1446]">
            <span className="min-w-0 flex-1">{errorText}</span>
            {chat.error !== "not_configured" && (
              <button
                type="button"
                onClick={chat.retry}
                className="h-8 rounded-full bg-white px-3 text-xs font-semibold text-ink shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:bg-white/70 focus-visible:outline-[3px] focus-visible:outline-ink"
              >
                {t("ask.retry")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Screen readers hear each finished reply once, not every streamed token. */}
      <p className="sr-only" aria-live="polite">
        {chat.announced}
      </p>

      <form onSubmit={submit} className="shrink-0 border-t border-black/[0.06] p-3" style={mobile ? { paddingBottom: "max(12px, env(safe-area-inset-bottom))" } : undefined}>
        <div className="flex items-end gap-2 rounded-2xl bg-white/90 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.07)] focus-within:shadow-[0_0_0_2px_#2d6280]">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, ASK_CAT.maxChars))}
            onKeyDown={onInputKey}
            disabled={busy}
            rows={1}
            maxLength={ASK_CAT.maxChars}
            aria-label={t("ask.inputLabel")}
            placeholder={t("ask.placeholder")}
            className="ask-input max-h-32 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] outline-none placeholder:text-neutral-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label={t("ask.send")}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#2d6280] text-white transition-opacity hover:bg-[#245069] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-35"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 rtl:-scale-x-100" fill="currentColor">
              <path d="M1.7 1.3a.6.6 0 0 1 .65-.08l12.5 6.25a.6.6 0 0 1 0 1.06L2.35 14.78a.6.6 0 0 1-.83-.71L3.2 8 1.52 1.93a.6.6 0 0 1 .18-.63ZM4.27 8.6l-1.2 4.33L12.73 8 3.07 3.07l1.2 4.33H8.5a.6.6 0 0 1 0 1.2H4.27Z" />
            </svg>
          </button>
        </div>
        {counter && (
          <p className={`mt-1 px-2 text-end text-[11px] ${draft.length >= ASK_CAT.maxChars ? "text-[#c4206f]" : "text-neutral-500"}`} aria-live="polite">
            {t("ask.counter", { n: num(draft.length), max: num(ASK_CAT.maxChars) })}
          </p>
        )}
      </form>
    </motion.div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  return role === "user" ? (
    <div className="max-w-[85%] self-end rounded-2xl rounded-se-md bg-[#2d6280] px-3.5 py-2 text-white">{children}</div>
  ) : (
    <div className="max-w-[90%] self-start rounded-2xl rounded-ss-md bg-white/85 px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] [overflow-wrap:anywhere]">{children}</div>
  );
}
