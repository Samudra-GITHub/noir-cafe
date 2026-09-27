"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createBeanGeometry, roastColor } from "./geometry";

type Bean = { angle: number; radius: number; height: number; axis: THREE.Vector3; spin: number; phase: number; scale: number };

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/** Seeded so the constellation is the same on every visit. */
function makeBeans(count: number): Bean[] {
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: count }, () => ({
    angle: rand() * Math.PI * 2,
    radius: 1.6 + rand() * 3.2,
    height: -1.4 + rand() * 4,
    axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
    spin: 0.2 + rand() * 0.6,
    phase: rand() * Math.PI * 2,
    scale: 0.16 + rand() * 0.07,
  }));
}

/**
 * Floating coffee beans — one instanced mesh.
 *
 * `progress` (a ref, 0…1) drives the journey: the beans drift as a loose
 * cloud, spiral in toward the cup (`target`), and fall into it. Without it
 * they simply float around `target`. `still` freezes them (reduced motion).
 */
export function FloatingBeans({
  count = 40,
  roast = 0.6,
  progress,
  target = new THREE.Vector3(0, 1, 0),
  still = false,
  spread = 1,
  size = 1,
}: {
  count?: number;
  roast?: number;
  progress?: React.RefObject<number>;
  target?: THREE.Vector3;
  still?: boolean;
  /** Scales the cloud (1 = the journey's wide constellation). */
  spread?: number;
  /** Bean scale multiplier. */
  size?: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const beans = useMemo(() => makeBeans(count), [count]);
  const geometry = useMemo(() => createBeanGeometry(28), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.04 }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useLayoutEffect(() => {
    material.color.copy(roastColor(roast));
    // A little variation between beans, as in a real roast.
    const tint = new THREE.Color();
    beans.forEach((b, i) => mesh.current?.setColorAt(i, tint.setScalar(0.86 + (b.phase / (Math.PI * 2)) * 0.28)));
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [roast, beans, material]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = still ? 0 : clock.elapsedTime;
    const p = progress?.current ?? 0;
    const gather = smooth(0.18, 0.6, p);
    const sink = smooth(0.52, 0.68, p);
    beans.forEach((b, i) => {
      const angle = b.angle + t * 0.12 * b.spin + gather * 5;
      const radius = THREE.MathUtils.lerp(b.radius * spread, 0.12 + (i % 5) * 0.06, gather);
      const y = THREE.MathUtils.lerp(target.y + b.height * spread, target.y + 0.35 + (i % 7) * 0.05, gather) + Math.sin(t * 0.7 + b.phase) * 0.09 * (1 - gather);
      dummy.position.set(target.x + Math.cos(angle) * radius, y - sink * 0.6, target.z + Math.sin(angle) * radius);
      q.setFromAxisAngle(b.axis, t * b.spin + b.phase);
      dummy.quaternion.copy(q);
      dummy.scale.setScalar(b.scale * size * (1 - sink));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} />;
}
