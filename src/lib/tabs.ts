import { CLOSE_FALLBACK_MS } from "../config/home";

// Pages open in their own tab. Links use rel="opener": browsers treat a bare target="_blank"
// as noopener, which would leave the page tab with no way back to the home tab.
export const NEW_TAB = { target: "_blank", rel: "opener" } as const;

/** Opens a page in a new tab from script. Returns false when the browser blocks the pop-up. */
export const openInNewTab = (path: string) => window.open(path, "_blank") !== null;

function homeOpener(): Window | null {
  const opener = window.opener as Window | null;
  if (!opener || opener.closed) return null;
  try {
    // Throws for a cross-origin opener.
    return opener.location.origin === window.location.origin && opener.location.pathname === "/" ? opener : null;
  } catch {
    return null;
  }
}

/** Back to the home tab that opened this one; otherwise (or if the tab won't close) go to "/" here. */
export function goHome(navigate: (to: string) => void) {
  const opener = homeOpener();
  if (!opener) {
    navigate("/");
    return;
  }
  opener.focus();
  window.close();
  setTimeout(() => {
    if (!window.closed) navigate("/");
  }, CLOSE_FALLBACK_MS);
}
