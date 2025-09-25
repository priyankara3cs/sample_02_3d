"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  Suspense,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import NewRoad from "../models/NewRoad";
import BoatWithRipple from "../models/BoatWithRipple";
import Pond from "../effects/Pond";

function ZoomRig({ t }) {
  const { camera } = useThree();
  useFrame(() => {
    const z = THREE.MathUtils.lerp(9, 5.2, t);
    const y = THREE.MathUtils.lerp(1.2, 1.35, t);
    camera.position.set(0, y, z);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneContent() {
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
      <group position={[0, -1.1, 0]} scale={0.22}>
        <NewRoad />
      </group>

      {/* Pond group (scaled parent) */}
      <group
        position={[1.25, -0.245, 1.85]}
        rotation={[0, -0.35, 0]}
        scale={0.07}
      >
        {/* Pond at the origin of the parent */}
        <Pond
          radius={20}
          feather={0.35}
          // color="#4fc3f7"
          opacity={0.32}
          amp={0.02}
          speed={1.0}
          yOffset={0.003}
          renderOrder={999}
          scaleForShader={0.07} // match the parent's scale!
        />

        {/* Boat: same X/Z as pond, tiny local Y lift so it sits above the water */}
        <group position={[0, 0.06, 0]}>
          {" "}
          {/* 0.06 * 0.07 ≈ 0.0042 world-units */}
          <BoatWithRipple showWater={false} />
        </group>
      </group>
    </>
  );
}

const Session1 = forwardRef(function Session1(_, ref) {
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const playing = useRef(false);

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
    <div className="session session-1" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 1.2, 9], fov: 45 }} shadows>
          <Suspense fallback={null}>
            <ZoomRig t={t} />
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>

      <div
        className="session-inner"
        style={{ position: "relative", zIndex: 1 }}
      >
        <h1>Session 1</h1>
        <p>
          Scroll to begin. We’ll zoom into the road + boat, then advance to
          Session 2.
        </p>
      </div>
    </div>
  );
});

export default Session1;
