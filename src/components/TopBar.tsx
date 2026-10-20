import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BAR, OWNER } from "../config/home";
import { useLocale } from "../i18n";
import { goHome } from "../lib/tabs";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu } from "./Menu";
import { MuteToggle } from "./MuteToggle";

// --bar-h: the bar's height, also used to keep page content clear of it.
const barCss = `:root{--bar-h:${BAR.mobileHeightPx}px}@media (min-width:${BAR.desktopFromPx}px){:root{--bar-h:${BAR.heightPx}px}}`;

/**
 * Full-width strip fixed at the very top: sound toggle and language switcher at the start, the
 * owner's GitHub link centred in the viewport, the menu at the end. A 1fr/auto/1fr grid keeps the
 * link centred and mirrors in RTL.
 */
export function TopBar({ home = false }: { home?: boolean }) {
  const { t } = useLocale();
  const labelRef = useRef<HTMLAnchorElement>(null);
  const switcherRef = useRef<HTMLButtonElement>(null);
  const [crowdedBy, setCrowdedBy] = useState({ menu: false, language: false });
  const onMenuCrowd = useCallback((menu: boolean) => setCrowdedBy((c) => (c.menu === menu ? c : { ...c, menu })), []);
  const onLanguageCrowd = useCallback((language: boolean) => setCrowdedBy((c) => (c.language === language ? c : { ...c, language })), []);
  const labelHidden = crowdedBy.menu || crowdedBy.language;

  return (
    <>
      <style>{barCss}</style>
      <div
        data-topbar=""
        className="fixed inset-x-0 top-0 z-[60] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-1.5 sm:px-5"
        style={{
          height: "var(--bar-h)",
          background: BAR.background,
          backdropFilter: `blur(${BAR.blurPx}px)`,
          WebkitBackdropFilter: `blur(${BAR.blurPx}px)`,
          borderBottom: `1px solid ${BAR.border}`,
        }}
      >
        <div className="flex min-w-0 items-center justify-start">
          <MuteToggle />
          <LanguageSwitcher buttonRef={switcherRef} labelRef={labelRef} onCrowd={onLanguageCrowd} />
        </div>
        {/* The name is a Latin proper noun: kept LTR (icon first) in every language. */}
        <a
          ref={labelRef}
          href={OWNER.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          lang="en"
          dir="ltr"
          aria-label={t("topBar.github", { name: OWNER.name })}
          tabIndex={labelHidden ? -1 : undefined}
          className="bar-label owner-link inline-flex items-center gap-1.5 rounded-sm transition-opacity ease-out focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink sm:gap-2"
          style={{
            opacity: labelHidden ? 0 : 1,
            pointerEvents: labelHidden ? "none" : undefined,
            transitionDuration: `${BAR.labelFadeMs}ms`,
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 shrink-0 sm:size-3.5" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="owner-link-text relative">{OWNER.name.toLocaleUpperCase("en")}</span>
        </a>
        <div className="flex min-w-0 justify-end">
          <Menu labelRef={labelRef} switcherRef={switcherRef} onCrowd={onMenuCrowd} />
        </div>
      </div>
      {home && <HomeButton />}
    </>
  );
}

/** "← Home": returns to the home tab that opened this page, else goes to "/" in this tab. */
function HomeButton() {
  const navigate = useNavigate();
  const { t, dir } = useLocale();
  return (
    <a
      href="/"
      aria-label={t("home.backLabel")}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        goHome(navigate);
      }}
      data-eyes-avoid=""
      className="fixed start-3 z-[55] inline-flex h-10 items-center gap-2 rounded-full bg-white/55 px-4 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink sm:start-6"
      style={{ top: "calc(var(--bar-h) + 12px)" }}
    >
      <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {t("home.back")}
    </a>
  );
}
