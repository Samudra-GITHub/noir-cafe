"use client";

/** Warm café light: a soft key from the window, a caramel rim, low fill. */
export function CafeLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#f6e7d4" />
      <directionalLight position={[3, 5, 2.5]} intensity={2.3} color="#fff1e0" />
      <directionalLight position={[-3.5, 2, -3]} intensity={1.1} color="#e8a868" />
      <hemisphereLight args={["#f8f4ec", "#3c2415", 0.35]} />
    </>
  );
}
