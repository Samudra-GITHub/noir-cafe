"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Soft, rising fbm noise masked to a wisp; each layer has its own seed.
const fragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  float t = uTime * 0.22 + uSeed;
  uv.x += (fbm(vec2(uv.y * 2.0 - t, uSeed)) - 0.5) * 0.5 * uv.y;
  float n = fbm(vec2(uv.x * 3.0, uv.y * 2.2 - t * 1.6));
  float column = smoothstep(0.5, 0.0, abs(uv.x - 0.5)) ;
  float fade = smoothstep(0.0, 0.18, uv.y) * smoothstep(1.0, 0.45, uv.y);
  float a = smoothstep(0.42, 0.85, n) * column * fade * uOpacity;
  gl_FragColor = vec4(vec3(0.97, 0.95, 0.92), a);
}`;

/**
 * Volumetric steam — a few noise-shaded planes stacked around the cup's axis,
 * each turned to face the camera, so the wisps have depth from any angle.
 * `intensity` (0…1) scales it (the journey turns it up as the cup arrives).
 */
export function Steam({
  layers = 6,
  intensity = 1,
  intensityRef,
  still = false,
  ...group
}: { layers?: number; intensity?: number; intensityRef?: React.RefObject<number>; still?: boolean } & React.ComponentProps<"group">) {
  const root = useRef<THREE.Group>(null);
  const world = useMemo(() => new THREE.Vector3(), []);
  const materials = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) =>
        new THREE.ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: fragment,
          uniforms: { uTime: { value: 0 }, uSeed: { value: i * 3.17 }, uOpacity: { value: 0.5 } },
          transparent: true,
          depthWrite: false,
        }),
      ),
    [layers],
  );

  useFrame(({ clock, camera }) => {
    const level = (intensityRef?.current ?? intensity) * 0.55;
    materials.forEach((m, i) => {
      m.uniforms.uTime.value = still ? 4 : clock.elapsedTime;
      m.uniforms.uOpacity.value = level * (0.7 + (i % 3) * 0.15);
    });
    // Billboard every layer toward the camera (around the vertical axis).
    root.current?.children.forEach((child) => {
      const p = child.getWorldPosition(world);
      child.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
    });
  });

  return (
    <group ref={root} {...group}>
      {materials.map((m, i) => (
        <mesh key={i} material={m} position={[Math.sin(i * 2.4) * 0.12, 0.55 + (i % 2) * 0.1, Math.cos(i * 2.4) * 0.12]}>
          <planeGeometry args={[0.9 + (i % 3) * 0.18, 1.5, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}
