"use client";

import { useEffect, useRef } from "react";

type Look = { x: number; y: number };

/**
 * Where the visitor is "looking": pointer position on fine pointers, device
 * tilt on phones once motion access is granted. Values are -1…1, written to a
 * ref (read inside useFrame — no re-renders).
 */
export function useLook(enabled = true) {
  const look = useRef<Look>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      look.current = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 };
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // Phone held upright ≈ beta 50°; clamp to a comfortable ±25°.
      look.current = { x: Math.max(-1, Math.min(1, e.gamma / 25)), y: Math.max(-1, Math.min(1, (e.beta - 50) / 25)) };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [enabled]);

  return look;
}

type OrientationPermission = { requestPermission?: () => Promise<"granted" | "denied"> };

/** Touch devices that ask before sharing device tilt (iOS); elsewhere it is simply available or irrelevant. */
export function motionNeedsPermission() {
  return (
    typeof window !== "undefined" &&
    matchMedia("(pointer: coarse)").matches &&
    typeof (window.DeviceOrientationEvent as unknown as OrientationPermission)?.requestPermission === "function"
  );
}

export async function requestMotionPermission() {
  const api = window.DeviceOrientationEvent as unknown as OrientationPermission;
  if (typeof api?.requestPermission !== "function") return true;
  try {
    return (await api.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
