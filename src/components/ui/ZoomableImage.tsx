"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

const MAX = 3;

/**
 * ZoomableImage — pinch with two fingers or double-tap to zoom (up to 3×),
 * drag to pan while zoomed. At 1× it lets horizontal swipes through to the
 * gallery around it. Resets on double-tap.
 */
export function ZoomableImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const lastTap = useRef(0);
  const [pinching, setPinching] = useState(false);
  const zoomed = view.scale > 1.01;

  const clamp = (v: { scale: number; x: number; y: number }, el: HTMLElement) => {
    const scale = Math.min(MAX, Math.max(1, v.scale));
    const maxX = ((scale - 1) * el.clientWidth) / 2;
    const maxY = ((scale - 1) * el.clientHeight) / 2;
    return { scale, x: Math.min(maxX, Math.max(-maxX, v.x)), y: Math.min(maxY, Math.max(-maxY, v.y)) };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: view.scale };
      setPinching(true);
    }
    if (zoomed || pointers.current.size === 2) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = e.currentTarget;
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const scale = (pinch.current.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.dist;
      setView((v) => clamp({ ...v, scale }, el));
    } else if (zoomed) {
      setView((v) => clamp({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }, el));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
      setPinching(false);
    }
    const now = performance.now();
    if (now - lastTap.current < 280 && pointers.current.size === 0) {
      setView((v) => (v.scale > 1.01 ? { scale: 1, x: 0, y: 0 } : { scale: 2, x: 0, y: 0 }));
      lastTap.current = 0;
    } else lastTap.current = now;
  };

  return (
    <div
      className={cn("relative overflow-hidden", zoomed ? "touch-none" : "touch-pan-x touch-pan-y", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={cn("absolute inset-0", !pinching && "transition-transform duration-300 ease-noir")}
        style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} draggable={false} className={cn("object-cover select-none", imageClassName)} />
      </div>
      <span className="sr-only">Pinch or double-tap to zoom.</span>
    </div>
  );
}
