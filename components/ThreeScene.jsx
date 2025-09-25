"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

import NewRoad from "./models/NewRoad";
import NewBoat from "./models/NewBoat";

/**
 * Props:
 * - zoomFactor: 0..1 (camera dolly)
 * - hue: 0..1 (unused now but kept)
 * - currentIndex: which session we are on (0..4)
 */
function ZoomRig({ zoomFactor = 0, lookAt = new THREE.Vector3(0, 0, 0) }) {
  const { camera } = useThree();
  useFrame(() => {
    // dolly from far -> near while transitioning
    const z = THREE.MathUtils.lerp(
      9,
      5.2,
      THREE.MathUtils.clamp(zoomFactor, 0, 1)
    );
    camera.position.set(0, 1.2, z);
    camera.lookAt(lookAt);
  });
  return null;
}

function Session1SceneContent() {
  // lighting tuned for your screenshots
  return (
    <>
      <hemisphereLight intensity={0.6} groundColor="#1a1e1f" />
      <directionalLight
        castShadow
        position={[3, 8, 6]}
        intensity={1.1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="sunset" />

      {/* Scale/position tweaked to match your reference images */}
      <group position={[0, -1.1, 0]} rotation={[0, 0, 0]} scale={0.22}>
        <NewRoad />
      </group>

      {/* Boat at bottom-right, a bit closer to camera, sitting on road edge */}
      <group
        position={[1.15, -0.32, 1.6]}
        rotation={[0, -0.35, 0]}
        scale={0.065}
      >
        <NewBoat />
      </group>
    </>
  );
}

export default function ThreeScene({
  zoomFactor = 0,
  hue = 0,
  currentIndex = 0,
}) {
  return (
    <Canvas camera={{ position: [0, 1.2, 9], fov: 45 }} shadows>
      <Suspense fallback={null}>
        <ZoomRig zoomFactor={zoomFactor} />
        {/* Only show the road/boat when we're on Session 1 */}
        {currentIndex === 0 && <Session1SceneContent />}
      </Suspense>
    </Canvas>
  );
}
