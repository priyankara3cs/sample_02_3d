"use client";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import { useGLTF, useAnimations, shaderMaterial } from "@react-three/drei";

/* crash-proof ripple material (only needs position + normal) */
const RippleMat = shaderMaterial(
  {
    uTime: 0,
    uAmp: 0.12,
    uSpeed: 1.8,
    uColor: new THREE.Color("#bfe6ff"),
    uOpacity: 0.85,
  },
  /* glsl */ `
  uniform float uTime; uniform float uAmp; uniform float uSpeed;
  varying vec3 vNormal;
  void main () {
    vNormal = normalMatrix * normal;
    vec3 p = position;
    float wave =
      sin((p.x + uTime*uSpeed)*1.2)*0.33 +
      sin((p.y*1.4 + uTime*uSpeed*0.8))*0.33 +
      sin((p.x*0.7 + p.y*0.9 + uTime*uSpeed*1.3))*0.34;
    p.z += wave * uAmp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`,
  /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; varying vec3 vNormal;
  void main () {
    float light = dot(normalize(vNormal), normalize(vec3(0.7,1.0,0.6)))*0.5 + 0.5;
    vec3 col = uColor * (0.75 + 0.25*light);
    gl_FragColor = vec4(col, uOpacity);
  }`
);
extend({ RippleMat });

/**
 * Loads /public/3d/BoatWithRipple.glb
 * - Ignores GLB water (we create a procedural water plane)
 * - Forces BOAT meshes to render on top (no depth issues)
 */
export default function BoatWithRipple({
  showWater = true,
  waterRadius = 1.25,
  ...props
}) {
  const group = useRef();
  const ripple = useRef();
  const { nodes, materials, animations } = useGLTF("/3d/NewBoat.glb");
  useAnimations(animations, group);

  const waterGeo = useMemo(() => {
    const geo = new THREE.CircleGeometry(waterRadius, 96);
    geo.rotateX(-Math.PI / 2); // XY -> XZ
    return geo;
  }, [waterRadius]);

  useFrame((_, dt) => {
    if (ripple.current) ripple.current.uTime += dt;
  });

  // Make boat render above the road (no depth test/write) — water stays normal
  useEffect(() => {
    if (!group.current) return;
    group.current.traverse((obj) => {
      if (obj.isMesh && obj.name !== "WaterPlane") {
        obj.renderOrder = 999;
        if (obj.material) {
          obj.material.depthTest = false;
          obj.material.depthWrite = false;
        }
      }
    });
  }, []);

  const obj4 = nodes?.Object_4;
  const obj5 = nodes?.Object_5;
  const obj7 = nodes?.Object_7;

  return (
    <group ref={group} {...props} dispose={null}>
      {/* WATER (procedural) */}
      {showWater && (
        <mesh
          name="WaterPlane"
          geometry={waterGeo}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <rippleMat ref={ripple} uAmp={0.12} uSpeed={1.8} />
        </mesh>
      )}

      {/* BOAT */}
      <group rotation={[-Math.PI / 2, 0, 0]} scale={[3.53, 2.257, 2.093]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {obj7 && (
            <mesh
              geometry={obj7.geometry}
              material={
                materials?.["Material.002"] ??
                new THREE.MeshStandardMaterial({ color: "#ffd26e" })
              }
              castShadow
              receiveShadow
            />
          )}
          {obj4 && (
            <mesh
              geometry={obj4.geometry}
              material={
                materials?.["Material.001"] ??
                new THREE.MeshStandardMaterial({ color: "#c5c9d3" })
              }
              position={[0, 0, 0.111]}
              castShadow
              receiveShadow
            />
          )}
          {obj5 && (
            <mesh
              geometry={obj5.geometry}
              material={
                materials?.["Material.002"] ??
                new THREE.MeshStandardMaterial({ color: "#ffd26e" })
              }
              castShadow
              receiveShadow
            />
          )}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/3d/NewBoat.glb");
