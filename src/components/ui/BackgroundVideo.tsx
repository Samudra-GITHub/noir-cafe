"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import type { VideoAsset } from "@/constants/media";

/**
 * BackgroundVideo — muted, looping, inline ambient video.
 *
 * - `priority` (hero): sources attached immediately, autoplays on load.
 * - otherwise: sources attach only when the frame nears the viewport (lazy),
 *   and playback pauses whenever it scrolls out of view.
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
export function BackgroundVideo({
  video,
  priority = false,
  paused = false,
  className,
  videoClassName,
  children,
}: {
  video: VideoAsset;
  priority?: boolean;
  /** Force-pause, e.g. once a sticky hero is fully covered. */
  paused?: boolean;
  className?: string;
  videoClassName?: string;
  /** Overlays (scrims, vignettes) rendered above the video. */
  children?: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const safe = useMotionSafe();
  const saveData = useSaveData();
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

  const shouldLoad = safe && !saveData && (priority || nearViewport);

  // <source> children are attached lazily; the element must re-read them.
  useEffect(() => {
    if (shouldLoad && !priority) videoRef.current?.load();
  }, [shouldLoad, priority]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldLoad) return;
    if (inView && !paused) void el.play().catch(() => {});
    else el.pause();
  }, [shouldLoad, inView, paused]);

  return (
    <div ref={frameRef} aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={videoRef}
        className={cn("size-full object-cover", videoClassName)}
        poster={video.poster}
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
