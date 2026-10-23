import type { Ref } from "react";
import { CAT } from "../config/home";

type Props = {
  ref?: Ref<HTMLDivElement>;
  /** Height and distance from the bottom, as % of the hero frame. */
  placement: { height: number; bottom: number };
  alt: string;
  /** Another photo in the same frame (the shop pages' heroes); defaults to the home cat. */
  photo?: { src: string; webp?: string; zoom: number; focus: { x: number; y: number } };
  onHoverChange?: (hovering: boolean) => void;
  onTap?: () => void;
};

/** The hero cat, cropped into a soft arch so the photo sits inside the poster. */
export function Cat({ ref, placement, alt, photo, onHoverChange, onTap }: Props) {
  const { src, webp, zoom, focus } = photo ?? CAT;
  const img = (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading={photo ? "lazy" : undefined}
      decoding="async"
      className="h-full w-full select-none object-cover"
      style={{
        objectPosition: `${focus.x}% ${focus.y}%`,
        transform: `scale(${zoom})`,
        transformOrigin: `${focus.x}% ${focus.y}%`,
      }}
    />
  );
  return (
    <div
      ref={ref}
      className="absolute left-1/2 z-20 overflow-hidden rounded-t-full"
      style={{
        height: `${placement.height}%`,
        bottom: `${placement.bottom}%`,
        aspectRatio: CAT.aspect,
        transform: "translateX(-50%)",
        boxShadow: "0 28px 60px -22px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.55)",
      }}
      onPointerEnter={(e) => e.pointerType !== "touch" && onHoverChange?.(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && onHoverChange?.(false)}
      onPointerDown={(e) => e.pointerType === "touch" && onTap?.()}
    >
      {webp ? (
        <picture className="block h-full w-full">
          <source srcSet={webp} type="image/webp" />
          {img}
        </picture>
      ) : (
        img
      )}
    </div>
  );
}
