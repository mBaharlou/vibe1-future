import type { Ref } from "react";
import { CAT } from "../config/home";

type Props = {
  ref: Ref<HTMLDivElement>;
  /** Height as % of the hero frame. */
  height: number;
  onHoverChange: (hovering: boolean) => void;
  onTap: () => void;
};

/** The hero cat, cropped into a soft arch so the photo sits inside the poster. */
export function Cat({ ref, height, onHoverChange, onTap }: Props) {
  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-1/2 z-20 overflow-hidden rounded-t-full"
      style={{
        height: `${height}%`,
        aspectRatio: CAT.aspect,
        transform: "translate(-50%, 3%)",
        boxShadow: "0 28px 60px -22px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.55)",
      }}
      onPointerEnter={(e) => e.pointerType !== "touch" && onHoverChange(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && onHoverChange(false)}
      onPointerDown={(e) => e.pointerType === "touch" && onTap()}
    >
      <img
        src={CAT.src}
        alt={CAT.alt}
        draggable={false}
        className="h-full w-full select-none object-cover"
        style={{
          objectPosition: `${CAT.focus.x}% ${CAT.focus.y}%`,
          transform: `scale(${CAT.zoom})`,
          transformOrigin: `${CAT.focus.x}% ${CAT.focus.y}%`,
        }}
      />
    </div>
  );
}
