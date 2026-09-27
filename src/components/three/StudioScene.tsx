"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { FloatingBeans } from "./Beans";
import { LatteCup } from "./Cup";
import { AdaptiveResolution, initialDpr } from "./AdaptiveResolution";
import { CafeLights } from "./Lights";
import { Steam } from "./Steam";
import { useLook } from "./useLook";
import type { LatteArt } from "./latteArt";
import { cremaHex } from "@/lib/brew-model";

function Turntable({ children, still }: { children: React.ReactNode; still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const look = useLook(!still);
  const drag = useRef({ active: false, x: 0, angle: 0.5, velocity: 0 });
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const d = drag.current;
    if (!d.active && !still) {
      d.angle += d.velocity;
      d.velocity *= 0.94;
      d.angle += delta * 0.12; // a slow idle turn
    }
    g.rotation.y = d.angle + look.current.x * 0.25;
    g.rotation.x = look.current.y * 0.08;
  });
  return (
    <group
      ref={group}
      onPointerDown={(e) => {
        drag.current = { ...drag.current, active: true, x: e.clientX, velocity: 0 };
        (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.active) return;
        const dx = (e.clientX - d.x) * 0.01;
        d.x = e.clientX;
        d.angle += dx;
        d.velocity = dx;
      }}
      onPointerUp={() => (drag.current.active = false)}
      onPointerLeave={() => (drag.current.active = false)}
    >
      {children}
    </group>
  );
}

/**
 * The studio's cup: drag to turn it (or tilt the phone), tap it to change the
 * pour. Its crema follows the recipe's roast and extraction; a few beans of the
 * chosen roast float around it.
 */
export default function StudioScene({
  roast,
  ey,
  art,
  onTap,
  still,
  active,
}: {
  roast: number;
  /** Extraction yield, % */
  ey: number;
  art: LatteArt;
  onTap: () => void;
  still: boolean;
  active: boolean;
}) {
  const crema = useMemo(() => new THREE.Color(cremaHex(roast, ey)), [roast, ey]);
  return (
    <Canvas
      dpr={initialDpr()}
      camera={{ position: [0, 3, 3.3], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={!active ? "never" : still ? "demand" : "always"}
      onCreated={({ camera }) => camera.lookAt(0, 0.7, 0)}
    >
      <CafeLights />
      {!still && <AdaptiveResolution />}
      <Turntable still={still}>
        <LatteCup art={art} crema={crema} onTap={onTap} />
        <Steam position={[0, 1.02, 0]} still={still} intensity={0.8} />
      </Turntable>
      <FloatingBeans count={12} roast={roast} target={new THREE.Vector3(0, 0.1, 0)} still={still} spread={0.62} size={0.55} />
    </Canvas>
  );
}
