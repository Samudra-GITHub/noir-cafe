"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import type { VideoAsset } from "@/constants/media";

/**
 * BackgroundVideo — muted, looping, inline ambient video.
 *
 * - Nothing downloads until the page has loaded and gone idle, so films never
 *   compete with first paint; the poster frame covers the gap.
 * - `priority` (hero): sources attached as soon as that happens, autoplays.
 * - otherwise: sources attach only when the frame nears the viewport (lazy),
 *   and playback pauses whenever it scrolls out of view.
 * - `defer` holds the download back (e.g. a later chapter in a stacked
 *   sequence); once released it stays loaded.
 * - Serves a 720p encode below 768px wide.
 * - Under prefers-reduced-motion, or when the visitor has Save-Data on, only
 *   the poster frame is shown and nothing downloads or plays.
 */

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Honour the browser's data-saver hint (false on the server and during hydration). */
function useSaveData() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
      return Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? "");
    },
    () => false,
  );
}
/** True once the window load event has fired and the main thread is idle. */
let settled = false;
const settleListeners = new Set<() => void>();
function subscribeSettled(onChange: () => void) {
  settleListeners.add(onChange);
  if (settleListeners.size === 1 && !settled) {
    const settle = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
      idle(() => {
        settled = true;
        settleListeners.forEach((l) => l());
      }, { timeout: 2000 });
    };
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });
  }
  return () => settleListeners.delete(onChange);
}
function usePageSettled() {
  return useSyncExternalStore(subscribeSettled, () => settled, () => false);
}

export function BackgroundVideo({
  video,
  priority = false,
  paused = false,
  defer = false,
  className,
  videoClassName,
  children,
}: {
  video: VideoAsset;
  priority?: boolean;
  /** Force-pause, e.g. once a sticky hero is fully covered. */
  paused?: boolean;
  /** Hold off downloading until this turns false; latches once released. */
  defer?: boolean;
  className?: string;
  videoClassName?: string;
  /** Overlays (scrims, vignettes) rendered above the video. */
  children?: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const safe = useMotionSafe();
  const saveData = useSaveData();
  const pageSettled = usePageSettled();
  const [nearViewport, setNearViewport] = useState(priority);
  const [inView, setInView] = useState(priority);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setNearViewport(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const [released, setReleased] = useState(!defer);
  if (!defer && !released) setReleased(true);

  const shouldLoad = safe && !saveData && pageSettled && released && (priority || nearViewport);

  // <source> children are attached lazily; the element must re-read them.
  useEffect(() => {
    if (shouldLoad) videoRef.current?.load();
  }, [shouldLoad]);

  // Pause with the tab / app switcher as well as off screen.
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;
    if (inView && !paused && pageVisible) void el.play().catch(() => {});
    else el.pause();
  }, [shouldLoad, inView, paused, pageVisible]);

  return (
    <div ref={frameRef} aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={videoRef}
        className={cn("size-full object-cover", videoClassName)}
        // Deferred films (e.g. later chapters) hold their poster back too,
        // keeping hidden frames off the first-paint budget.
        poster={released ? video.poster : undefined}
        muted
        loop
        playsInline
        autoPlay={shouldLoad}
        preload={priority ? "auto" : "none"}
        disablePictureInPicture
        disableRemotePlayback
      >
        {shouldLoad && (
          <>
            <source src={video.mobile} type="video/mp4" media="(max-width: 767px)" />
            <source src={video.src} type="video/mp4" />
          </>
        )}
      </video>
      {children}
    </div>
  );
}
