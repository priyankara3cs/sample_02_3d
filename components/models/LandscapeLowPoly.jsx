"use client";
import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";

/** Low-poly landscape (river + trees). Set hideBase to remove the floating brown block. */
export default function LandscapeLowPoly({ hideBase = true, ...props }) {
  const root = useRef();
  const { nodes, materials } = useGLTF(
    "/3d/low_poly_landscape_with_river_and_trees.glb"
  );

  // Hide only the base mesh by NODE name (keeps river visible)
  useEffect(() => {
    if (!hideBase || !root.current) return;
    root.current.traverse((o) => {
      if (o.isMesh && o.name === "Material_002-material") o.visible = false;
    });
  }, [hideBase]);

  return (
    <group ref={root} {...props} dispose={null}>
      {/* --- your auto-generated meshes (unchanged) --- */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group scale={[3, 3, 0.287]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material-material"].geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_001-material"].geometry}
            material={materials["Material.001"]}
          />
        </group>
        <group
          position={[-2.571, -2.684, 0.672]}
          rotation={[0, 0, 0.457]}
          scale={0.11}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_003-material"].geometry}
            material={materials["Material.003"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_004-material"].geometry}
            material={materials["Material.004"]}
          />
        </group>
        <group
          position={[-1.31, -2.474, 0.566]}
          rotation={[0, 0, 1.371]}
          scale={[0.067, 0.067, 0.053]}
        >
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_005-material"].geometry}
            material={materials["Material.005"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_004-material_1"].geometry}
            material={materials["Material.004"]}
          />
        </group>
        <group scale={[3, 3, 0.287]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material-material_1"].geometry}
            material={materials.Material}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_001-material_1"].geometry}
            material={materials["Material.001"]}
          />
        </group>
        {/* …keep the rest of your generated nodes exactly as before… */}
        <group position={[-2.275, -1.801, 0.586]} scale={0.067}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_005-material_1"].geometry}
            material={materials["Material.005"]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes["Material_004-material_2"].geometry}
            material={materials["Material.004"]}
          />
        </group>
        {/* (don’t remove this mesh; it’s the one we hide by name in the effect) */}
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Material_002-material"].geometry}
          material={materials["Material.002"]}
          position={[0, 0, 0.469]}
          scale={[3.681, 1.201, 1]}
        />
        {/* …all remaining small rocks/trees meshes… */}
      </group>
    </group>
  );
}

useGLTF.preload("/3d/low_poly_landscape_with_river_and_trees.glb");
