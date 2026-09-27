import * as THREE from "three";
import { beanHex } from "@/lib/brew-model";

/**
 * Procedural geometry for the 3D scenes — no model files to download.
 * Units: the cup is ~1.1 tall; a bean is ~0.5 long at scale 0.5.
 */

/** A coffee bean: an ellipsoid with a flattened face and the S-curved crease. */
export function createBeanGeometry(segments = 40) {
  const geometry = new THREE.SphereGeometry(1, segments, Math.round(segments * 0.7));
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const { x, y } = v;
    let { z } = v;
    if (z > 0) {
      z *= 0.62; // the flat face
      const crease = x - 0.12 * Math.sin(y * 2.6);
      z -= Math.exp(-(crease * crease) / 0.01) * 0.24 * (0.4 + z);
    }
    position.setXYZ(i, x * 0.68, y, z * 0.52);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const lathe = (points: [number, number][], segments: number) =>
  new THREE.LatheGeometry(points.map(([r, h]) => new THREE.Vector2(r, h)), segments);

/** Cup body: outer wall, rolled rim and inner wall in one lathe profile. */
export function createCupGeometry(segments = 72) {
  return lathe(
    [
      [0, 0], [0.33, 0], [0.39, 0.02], [0.44, 0.12], [0.5, 0.36], [0.56, 0.64],
      [0.61, 0.9], [0.63, 1.03], [0.625, 1.075], [0.605, 1.085], [0.59, 1.06],
      [0.575, 0.95], [0.53, 0.68], [0.47, 0.42], [0.4, 0.2], [0.32, 0.11], [0, 0.11],
    ],
    segments,
  );
}

/** Height and radius of the coffee's surface inside the cup. */
export const COFFEE_LEVEL = { y: 0.9, radius: 0.572 };

export function createSaucerGeometry(segments = 72) {
  return lathe(
    [
      [0, 0.03], [0.46, 0.0], [0.82, 0.04], [1.02, 0.12], [1.07, 0.15], [1.04, 0.165],
      [0.96, 0.14], [0.8, 0.085], [0.48, 0.06], [0, 0.07],
    ],
    segments,
  );
}

/** Handle: a partial torus, opening toward the cup wall. */
export function createHandleGeometry() {
  const geometry = new THREE.TorusGeometry(0.23, 0.048, 16, 48, Math.PI * 1.2);
  geometry.rotateZ(-Math.PI * 0.6);
  geometry.translate(0.56, 0.6, 0);
  return geometry;
}

/** Roast from light (0) to dark (1) as a bean colour. */
export function roastColor(roast: number) {
  return new THREE.Color(beanHex(roast));
}
