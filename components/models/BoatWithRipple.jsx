"use client";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import { useGLTF, useAnimations, shaderMaterial } from "@react-three/drei";

/* kept for when you enable the boat's own water */
const RippleMat = shaderMaterial(
  {
    uTime: 0,
    uAmp: 0.12,
    uSpeed: 1.8,
    uColor: new THREE.Color("#bfe6ff"),
    uOpacity: 0.85,
  },
  `uniform float uTime,uAmp,uSpeed; varying vec3 vNormal;
   void main(){ vNormal=normalMatrix*normal; vec3 p=position;
   float w=sin((p.x+uTime*uSpeed)*1.2)*.33+sin((p.y*1.4+uTime*uSpeed*.8))*.33+sin((p.x*.7+p.y*.9+uTime*uSpeed*1.3))*.34;
   p.z+=w*uAmp; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
  `uniform vec3 uColor; uniform float uOpacity; varying vec3 vNormal;
   void main(){ float L=dot(normalize(vNormal),normalize(vec3(.7,1.,.6)))*.5+.5;
   vec3 c=uColor*(.75+.25*L); gl_FragColor=vec4(c,uOpacity); }`
);
extend({ RippleMat });

/** showWater=false => only the boat (opaque) */
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
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [waterRadius]);

  useFrame((_, dt) => {
    if (ripple.current) ripple.current.uTime += dt;
  });

  // Make BOAT meshes opaque, depth-tested, and drawn after pond
  useEffect(() => {
    if (!group.current) return;
    group.current.traverse((obj) => {
      if (obj.isMesh && obj.name !== "WaterPlane") {
        // Draw after the pond (pond renderOrder = 999)
        obj.renderOrder = 2000;

        if (obj.material) {
          // Make it participate in the transparent pass, but still look opaque
          obj.material.transparent = true; // <- important
          obj.material.opacity = 1;

          // Disable depth testing/writing so it cleanly overlays the pond
          obj.material.depthTest = false;
          obj.material.depthWrite = false;

          obj.material.side = THREE.FrontSide;
        }
      }
    });
  }, []);

  const obj4 = nodes?.Object_4;
  const obj5 = nodes?.Object_5;
  const obj7 = nodes?.Object_7;

  return (
    <group ref={group} {...props} dispose={null}>
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

      {/* Boat geometry */}
      <group rotation={[-Math.PI / 2, 0, 0]} scale={[3.53, 2.257, 2.093]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          {obj7 && (
            <mesh
              geometry={obj7.geometry}
              material={
                materials?.["Material.002"] ||
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
                materials?.["Material.001"] ||
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
                materials?.["Material.002"] ||
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
