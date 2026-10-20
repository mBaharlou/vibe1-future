import type { CSSProperties } from "react";
import { HAZE } from "../config/home";

/** Faint drifting haze across the lower half of the page. Thickens slightly while `thick`. */
export function Haze({ thick }: { thick: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] overflow-hidden">
      {HAZE.blobs.map((b, i) => (
        <div
          key={i}
          className="haze-drift absolute rounded-full"
          style={
            {
              left: `${b.left}%`,
              bottom: `${b.bottom}%`,
              width: `${b.width}%`,
              height: `${b.height}%`,
              background: `radial-gradient(closest-side, rgba(${b.color},1), rgba(${b.color},0))`,
              filter: `blur(${HAZE.blurPx}px)`,
              opacity: b.opacity + (thick ? HAZE.thicken : 0),
              transition: `opacity ${HAZE.thickenMs}ms ease-in-out`,
              "--haze-s": `${b.seconds}s`,
              "--haze-dx": `${b.driftPct}vw`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
