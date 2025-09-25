"use client";
import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

export default function NewRoad(props) {
  const { nodes, materials } = useGLTF("/3d/NewRoad.glb");

  // Reduce z-fighting with other meshes
  useEffect(() => {
    Object.values(materials).forEach((m) => {
      if (!m) return;
      m.polygonOffset = true;
      m.polygonOffsetFactor = 1;
      m.polygonOffsetUnits = 1;
    });
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      {/* grass disk */}
      <group position={[-39.524, 1.53, 36.825]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Material2001.geometry}
          material={materials["grasss.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Material2002.geometry}
          material={materials["grass_close2.001"]}
        />
      </group>
      {/* road strip */}
      <group position={[5.304, 18.514, 4.307]} rotation={[3.11, 0, 0.208]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials["road_22.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials["road_22.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials["road_22.001"]}
        />
      </group>
    </group>
  );
}
useGLTF.preload("/3d/NewRoad.glb");
