"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { whenIdle, whenPainted } from "@/lib/page-ready";
import { cn } from "@/lib/cn";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * LazyScene — mounts a three.js scene only when its frame is (nearly) on
 * screen and the page has painted, so three.js never touches first load.
 * While off screen or in a hidden tab the scene is told to stop rendering
 * (`active: false`). Without WebGL the `fallback` (a photograph) stays.
 */
export function LazyScene<P extends object>({
  load,
  props,
  fallback,
  label,
  className,
}: {
  load: () => Promise<{ default: ComponentType<P & { active: boolean }> }>;
  props: P;
  fallback: React.ReactNode;
  /** Describes the scene for assistive tech (the canvas itself is an image). */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType<P & { active: boolean }> | null>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const requested = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "200px 0px" });
    observer.observe(el);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!inView || requested.current) return;
    requested.current = true;
    if (!webglAvailable()) return;
    void whenPainted()
      .then(() => whenIdle(1200))
      .then(load)
      .then((mod) => {
        if (mounted.current) setScene(() => mod.default);
      })
      .catch(() => {});
  }, [inView, load]);

  return (
    <div ref={ref} role="img" aria-label={label} className={cn("relative", className)}>
      <div className={cn("absolute inset-0 transition-opacity duration-700 ease-noir", Scene ? "opacity-0" : "opacity-100")}>{fallback}</div>
      {Scene && (
        <div className="absolute inset-0 motion-safe:animate-[fade-in_0.9s_var(--ease-noir)_both]">
          <Scene {...props} active={inView && pageVisible} />
        </div>
      )}
    </div>
  );
}
