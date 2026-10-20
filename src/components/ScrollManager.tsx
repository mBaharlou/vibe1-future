import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

// Scroll position per history entry, keyed by React Router's location.key.
const positions = new Map<string, number>();

/** New pages start at the top; Back/Forward restore where you were. */
export function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    const saved = positions.get(location.key);
    window.scrollTo(0, navigationType === "POP" && saved !== undefined ? saved : 0);
  }, [location.key, navigationType]);

  useEffect(() => {
    let frame = 0;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => positions.set(location.key, window.scrollY));
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
    };
  }, [location.key]);

  return null;
}
