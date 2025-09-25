"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

/** Transparent, soft-edged puddle with subtle ripples. */
const PondMat = shaderMaterial(
  {
    uTime: 0,
    uAmp: 0.015,
    uSpeed: 1.2,
    uRadius: 0.5, // world-units
    uFeather: 0.25, // world-units
    uScale: 1.0, // parent scale (to compensate local r)
    uColor: new THREE.Color("#8ec5ff"), // RGB; transparency is uOpacity
    uOpacity: 0.45,
  },
  // vertex shader
  /* glsl */ `
  uniform float uTime, uAmp, uSpeed;
  varying vec2 vXZ;

  void main () {
    vec3 p = position;
    vXZ = p.xz;
    float r = length(vXZ);
    float wave = sin((r * 18.0) - (uTime * uSpeed)) * uAmp;
    p.y += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`,
  // fragment shader
  /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity, uRadius, uFeather, uScale;
  varying vec2 vXZ;

  void main () {
    float r = length(vXZ);                 // local-space radius
    float radLocal = uRadius  / max(uScale, 1e-6);
    float feaLocal = uFeather / max(uScale, 1e-6);

    float edge  = smoothstep(radLocal, radLocal - feaLocal, r);
    float alpha = uOpacity * edge;

    float fres = clamp(1.0 - r / (radLocal + 1e-5), 0.0, 1.0);
    vec3 col = mix(uColor * 0.7, uColor, fres);

    gl_FragColor = vec4(col, alpha);
  }`
);
extend({ PondMat });

export default function Pond({
  radius = 0.55, // world units
  feather = 0.35, // world units
  color = "#9fd0ff", // any THREE.Color-compatible format (RGB only)
  opacity = 0.45,
  amp = 0.02,
  speed = 1.0,
  yOffset = 0.003, // tiny lift to avoid z-fighting
  renderOrder = 999, // draw before boat (boat uses higher)
  scaleForShader = 1.0, // pass parent scale (e.g., 0.07)
  ...props
}) {
  const mat = useRef();

  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(radius + feather, 96);
    g.rotateX(-Math.PI / 2); // lay flat
    return g;
  }, [radius, feather]);

  useFrame((_, dt) => {
    if (mat.current) mat.current.uTime += dt;
  });

  return (
    <mesh
      geometry={geo}
      position={[0, yOffset, 0]}
      receiveShadow
      renderOrder={renderOrder}
      polygonOffset
      polygonOffsetFactor={-1}
      polygonOffsetUnits={-1}
      {...props}
    >
      <pondMat
        ref={mat}
        transparent // real alpha blending
        depthWrite={false}
        depthTest={false}
        uRadius={radius}
        uFeather={feather}
        uScale={scaleForShader}
        uColor={new THREE.Color(color)}
        uOpacity={opacity}
        uAmp={amp}
        uSpeed={speed}
      />
    </mesh>
  );
}
