"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import LandscapeLowPoly from "../models/LandscapeLowPoly";
import BoatWithRipple from "../models/BoatWithRipple";

/* Tight zoom that looks down the (now vertical) river */
function ZoomRig2({ t }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.fov = 40;
    camera.updateProjectionMatrix();
  }, [camera]);
  useFrame(() => {
    const z = THREE.MathUtils.lerp(6.0, 3.6, t);
    const y = THREE.MathUtils.lerp(1.4, 1.65, t);
    const x = THREE.MathUtils.lerp(0.35, 0.0, t);
    camera.position.set(x, y, z);
    camera.lookAt(0.35, 0.15, 0.0); // aim along river after 90° turn
  });
  return null;
}

/* Subtle bob for the boat */
function BoatBob({ children }) {
  const g = useRef();
  useFrame(({ clock }) => {
    const tt = clock.getElapsedTime();
    if (g.current) {
      g.current.position.y = -0.33 + Math.sin(tt * 1.4) * 0.02;
      g.current.rotation.z = Math.sin(tt * 0.9) * 0.025;
    }
  });
  return <group ref={g}>{children}</group>;
}

function Scene2Content() {
  return (
    <>
      <hemisphereLight intensity={0.6} groundColor="#1a1e1f" />
      <directionalLight
        castShadow
        position={[3, 8, 6]}
        intensity={1.05}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="sunset" />

      {/* Rotate 90° around Y so the river stands straight (top↕bottom) */}
      <group
        position={[0, -0.9, 0.1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.95}
      >
        <LandscapeLowPoly hideBase />
      </group>

      {/* Boat on the river after rotation */}
      <BoatBob>
        <group
          position={[0.36, -0.33, -0.02]} // ⬅️ unchanged
          rotation={[0, 0, 0]} // ⬅️ rotate 90° from previous (was [0, Math.PI / 2, 0])
          scale={0.09}
        >
          <BoatWithRipple showWater={false} />
        </group>
      </BoatBob>
    </>
  );
}

const Session2 = forwardRef(function Session2(_, ref) {
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const playing = useRef(false);

  // Expose playZoom() so page.jsx runs it before sliding to Session 3
  useImperativeHandle(ref, () => ({
    playZoom: () =>
      new Promise((resolve) => {
        if (playing.current) return resolve();
        playing.current = true;
        const start = performance.now();
        const dur = 1200;
        const step = (now) => {
          const k = Math.min(1, Math.max(0, (now - start) / dur));
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          setT(e);
          if (k < 1) raf.current = requestAnimationFrame(step);
          else {
            playing.current = false;
            resolve();
          }
        };
        raf.current = requestAnimationFrame(step);
      }),
  }));

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      playing.current = false;
      setT(0);
    },
    []
  );

  return (
    <div className="session session-2" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 1.3, 6], fov: 40 }} shadows>
          <Suspense fallback={null}>
            <ZoomRig2 t={t} />
            <Scene2Content />
          </Suspense>
        </Canvas>
      </div>

      <div
        className="session-inner"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h1>Session 2</h1>
        <p>
          Scroll to continue. We’ll play a short 3D intro here, then advance to
          Session 3.
        </p>
      </div>
    </div>
  );
});

export default Session2;
