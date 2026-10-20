import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { HEADER } from "../config/home";
import { goHome } from "../lib/tabs";
import { Menu } from "./Menu";

/** Fixed bar above everything: optional left item, centred label, menu on the right. */
export function TopBar({ left, center }: { left?: ReactNode; center?: ReactNode }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-center gap-2 px-4 sm:px-8"
      style={{ paddingTop: HEADER.topPx }}
    >
      <div className="flex min-w-0 flex-1 basis-0 justify-start">{left}</div>
      {center}
      <div className="flex flex-1 basis-0 justify-end">
        <Menu />
      </div>
    </div>
  );
}

/** "← Home": returns to the home tab that opened this page, else goes to "/" in this tab. */
export function HomeButton() {
  const navigate = useNavigate();
  return (
    <a
      href="/"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        goHome(navigate);
      }}
      className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full bg-white/55 px-4 text-sm font-medium text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md hover:text-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <span aria-hidden="true">←</span> Home
    </a>
  );
}
