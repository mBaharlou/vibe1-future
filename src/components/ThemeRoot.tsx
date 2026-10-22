import { useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { THEMES, themeFor, themeVars } from "../config/themes";

/**
 * Puts the current route's theme on <html>: data-theme / data-scheme plus the --t-* custom
 * properties (src/config/themes.ts). Routes without a theme get none, so they keep the site's
 * original look. Layout effect: no frame of the wrong colours on navigation.
 */
export function ThemeRoot() {
  const { pathname } = useLocation();
  const name = themeFor(pathname);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!name) return;
    const theme = THEMES[name];
    const vars = themeVars(theme);
    root.dataset.theme = name;
    root.dataset.scheme = theme.scheme;
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
    return () => {
      delete root.dataset.theme;
      delete root.dataset.scheme;
      for (const key of Object.keys(vars)) root.style.removeProperty(key);
    };
  }, [name]);

  return null;
}
