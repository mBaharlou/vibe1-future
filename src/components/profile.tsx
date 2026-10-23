// Small pieces shared by the Me and Contact pages.
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import skySvg from "../assets/sky-pattern.svg?raw";
import { OWNER } from "../config/home";
import { useLocale } from "../i18n";

/** Big titles on Me and Contact: the shop titles' letter fill (.title-fill), in denim sky. */
export const DENIM_FILL = {
  "--title-pattern": `url("data:image/svg+xml,${encodeURIComponent(skySvg)}")`,
  "--title-base": "linear-gradient(180deg, #1d4560 0%, #2d6280 45%, #6aa3c4 100%)",
  "--title-scale": "1.1em",
  "--title-solid": "#2d6280",
} as CSSProperties;

/** The same fill for a dark page: a bright sky, from ice blue into lilac. */
export const NIGHT_FILL = {
  "--title-pattern": `url("data:image/svg+xml,${encodeURIComponent(skySvg)}")`,
  "--title-base": "linear-gradient(180deg, #e0f2fe 0%, #7cc4e8 50%, #a78bfa 100%)",
  "--title-scale": "1.1em",
  "--title-solid": "#7cc4e8",
} as CSSProperties;

/** A small pill label above a title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      data-eyes-avoid=""
      className="bar-label inline-flex w-fit rounded-full border px-3.5 py-1.5"
      style={{ borderColor: "var(--t-border)", background: "var(--t-surface)", color: "var(--t-text-muted)" }}
    >
      {children}
    </p>
  );
}

const timeIn = (tag: string) =>
  new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit", timeZone: OWNER.timeZone }).format(new Date());

/** The time in Eskişehir right now (hours and minutes in the page language), updated every 15 s. */
export function useLocalTime() {
  const { lang } = useLocale();
  const tag = lang === "fa" ? "fa-IR" : lang;
  const [time, setTime] = useState(() => timeIn(tag));
  useEffect(() => {
    setTime(timeIn(tag));
    const id = window.setInterval(() => setTime(timeIn(tag)), 15_000);
    return () => window.clearInterval(id);
  }, [tag]);
  return time;
}

const paths = {
  mail: "M4 6h16v12H4z M4 7l8 6 8-6",
  phone:
    "M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  arrow: "M7 17L17 7M9 7h8v8",
  copy: "M9 9h10v10H9z M5 15V5h10",
  check: "M5 12.5l4.5 4.5L19 7.5",
  folder: "M3.5 6.5h6l2 2h9v10h-17z",
} as const;

/** Line icons in the current colour. */
export function Icon({ name, className = "size-5" }: { name: keyof typeof paths | "github"; className?: string }) {
  if (name === "github") {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
