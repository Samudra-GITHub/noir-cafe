"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { FloatingBeans } from "./Beans";
import { LatteCup } from "./Cup";
import { AdaptiveResolution, initialDpr } from "./AdaptiveResolution";
import { CafeLights } from "./Lights";
import { Steam } from "./Steam";
import { useLook } from "./useLook";
import type { LatteArt } from "./latteArt";

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// Camera path: [progress, position, look-at].
const PATH: [number, THREE.Vector3, THREE.Vector3][] = [
  [0, new THREE.Vector3(0, 0.9, 7.6), new THREE.Vector3(0, 0.7, 0)],
  [0.45, new THREE.Vector3(0.6, 1.5, 4.6), new THREE.Vector3(0, 0.8, 0)],
  [0.72, new THREE.Vector3(0, 2.1, 2.9), new THREE.Vector3(0, 0.95, 0)],
  [1, new THREE.Vector3(0, 4.4, 0.45), new THREE.Vector3(0, 1, 0)],
];
const CUP_TOP = new THREE.Vector3(0, 1.02, 0);
const ESPRESSO = new THREE.Color("#7a4a2a");

function Rig({ progress, still }: { progress: React.RefObject<number>; still: boolean }) {
  const look = useLook(!still);
  const eased = useRef(0);
  const vectors = useRef({ pos: new THREE.Vector3(), at: new THREE.Vector3() });
  useFrame(({ camera }, delta) => {
    const { pos, at } = vectors.current;
    // Ease toward the scroll position so the camera glides, never jumps.
    eased.current = still ? progress.current : THREE.MathUtils.damp(eased.current, progress.current, 4, delta);
    const p = eased.current;
    let i = 0;
    while (i < PATH.length - 2 && p > PATH[i + 1][0]) i++;
    const [p0, a0, t0] = PATH[i];
    const [p1, a1, t1] = PATH[i + 1];
    const k = smooth(p0, p1, p);
    pos.lerpVectors(a0, a1, k);
    at.lerpVectors(t0, t1, k);
    // Pointer / tilt parallax, fading out on the final top-down view.
    const sway = 1 - smooth(0.8, 1, p);
    pos.x += look.current.x * 0.45 * sway;
    pos.y -= look.current.y * 0.25 * sway;
    camera.position.copy(pos);
    camera.lookAt(at);
  });
  return null;
}

function RisingCup({ progress, art, onTap, still }: { progress: React.RefObject<number>; art: LatteArt; onTap: () => void; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const steam = useRef(0);
  useFrame(() => {
    const p = progress.current;
    if (group.current) group.current.position.y = THREE.MathUtils.lerp(-2.8, 0, smooth(0.28, 0.62, p));
    steam.current = smooth(0.55, 0.9, p);
  });
  return (
    <group ref={group} position={[0, -2.8, 0]}>
      <LatteCup art={art} crema={ESPRESSO} onTap={onTap} />
      <Steam intensityRef={steam} still={still} position={[0, 1.02, 0]} />
    </group>
  );
}

/**
 * The /cup journey — beans drift, gather and fall into the cup; the cup rises
 * with its steam; the camera settles over the latte art. Scroll drives
 * `progress`; the pointer or device tilt steers the view; tapping the cup
 * changes the pour.
 */
export default function JourneyScene({
  progress,
  art,
  onTap,
  still,
  active,
  compact,
}: {
  progress: React.RefObject<number>;
  art: LatteArt;
  onTap: () => void;
  still: boolean;
  active: boolean;
  compact: boolean;
}) {
  return (
    <Canvas
      dpr={initialDpr()}
      camera={{ position: [0, 0.9, 7.6], fov: compact ? 42 : 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={!active ? "never" : still ? "demand" : "always"}
    >
      <CafeLights />
      {!still && <AdaptiveResolution />}
      <Rig progress={progress} still={still} />
      <FloatingBeans count={compact ? 28 : 44} roast={0.62} progress={progress} target={CUP_TOP} still={still} />
      <RisingCup progress={progress} art={art} onTap={onTap} still={still} />
    </Canvas>
  );
}
