"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { COFFEE_LEVEL, createCupGeometry, createHandleGeometry, createSaucerGeometry } from "./geometry";
import { paintLatte, type LatteArt } from "./latteArt";

const CERAMIC = "#f1ebe1";

/**
 * The latte cup — cup, handle, saucer and a painted coffee surface. `crema`
 * tints the coffee; `art` chooses the pour. Tapping the cup calls `onTap`.
 */
export function LatteCup({
  art,
  crema,
  onTap,
  ...group
}: {
  art: LatteArt;
  crema: THREE.Color;
  onTap?: () => void;
} & Omit<React.ComponentProps<"group">, "onClick">) {
  const cup = useMemo(() => createCupGeometry(), []);
  const saucer = useMemo(() => createSaucerGeometry(), []);
  const handle = useMemo(() => createHandleGeometry(), []);
  const ceramic = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: CERAMIC, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25, side: THREE.DoubleSide }),
    [],
  );
  const cremaKey = crema.getHexString();
  const surface = useMemo(() => paintLatte(art, new THREE.Color(`#${cremaKey}`)), [art, cremaKey]);
  useEffect(() => () => surface.dispose(), [surface]);

  const click = onTap
    ? (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onTap();
      }
    : undefined;

  return (
    <group {...group}>
      <mesh geometry={saucer} material={ceramic} position={[0, -0.02, 0]} />
      <group position={[0, 0.12, 0]} onClick={click}>
        <mesh geometry={cup} material={ceramic} />
        <mesh geometry={handle} material={ceramic} />
        <mesh position={[0, COFFEE_LEVEL.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[COFFEE_LEVEL.radius, 64]} />
          <meshStandardMaterial map={surface} roughness={0.28} />
        </mesh>
      </group>
      {/* Contact shadow */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial transparent depthWrite={false} map={SHADOW} opacity={0.55} />
      </mesh>
    </group>
  );
}

const SHADOW = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 10, 64, 64, 64);
  g.addColorStop(0, "rgba(23,18,14,0.55)");
  g.addColorStop(1, "rgba(23,18,14,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
