import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { BAR } from "../config/home";
import { useLocale } from "../i18n";
import { goHome } from "../lib/tabs";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu } from "./Menu";

// --bar-h: the bar's height, also used to keep page content clear of it.
const barCss = `:root{--bar-h:${BAR.mobileHeightPx}px}@media (min-width:${BAR.desktopFromPx}px){:root{--bar-h:${BAR.heightPx}px}}`;

/**
 * Full-width strip fixed at the very top: language switcher at the start, the label centred in the
 * viewport, the menu at the end. A 1fr/auto/1fr grid keeps the label centred and mirrors in RTL.
 */
export function TopBar({ home = false }: { home?: boolean }) {
  const { t, upper } = useLocale();
  const labelRef = useRef<HTMLParagraphElement>(null);
  const switcherRef = useRef<HTMLButtonElement>(null);
  const [crowdedBy, setCrowdedBy] = useState({ menu: false, language: false });
  const onMenuCrowd = useCallback((menu: boolean) => setCrowdedBy((c) => (c.menu === menu ? c : { ...c, menu })), []);
  const onLanguageCrowd = useCallback((language: boolean) => setCrowdedBy((c) => (c.language === language ? c : { ...c, language })), []);
  const labelHidden = crowdedBy.menu || crowdedBy.language;

  return (
    <>
      <style>{barCss}</style>
      <div
        className="fixed inset-x-0 top-0 z-[60] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-1.5 sm:px-5"
        style={{
          height: "var(--bar-h)",
          background: BAR.background,
          backdropFilter: `blur(${BAR.blurPx}px)`,
          WebkitBackdropFilter: `blur(${BAR.blurPx}px)`,
          borderBottom: `1px solid ${BAR.border}`,
        }}
      >
        <div className="flex min-w-0 justify-start">
          <LanguageSwitcher buttonRef={switcherRef} labelRef={labelRef} onCrowd={onLanguageCrowd} />
        </div>
        <p
          ref={labelRef}
          className="bar-label text-center text-neutral-800 transition-opacity ease-out"
          style={{ opacity: labelHidden ? 0 : 1, transitionDuration: `${BAR.labelFadeMs}ms` }}
        >
          {upper(t("topBar.label"))}
        </p>
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
      className="fixed start-3 z-[55] inline-flex h-10 items-center gap-2 rounded-full bg-white/55 px-4 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink sm:start-6"
      style={{ top: "calc(var(--bar-h) + 12px)" }}
    >
      <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span> {t("home.back")}
    </a>
  );
}
