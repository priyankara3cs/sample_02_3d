"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

/** Soft-edged puddle with animated ripples (opaque bucket via alphaTest) */
const PondMat = shaderMaterial(
  {
    uTime: 0,
    uAmp: 0.015,
    uSpeed: 1.2,
    uRadius: 0.5,
    uFeather: 0.25,
    uColor: new THREE.Color("#8ec5ffac"),
    uOpacity: 0.45,
  },
  // vertex
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
  // fragment
  /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity, uRadius, uFeather;
  varying vec2 vXZ;
  void main () {
    float r = length(vXZ);
    // 0..1 alpha with feathered edge
    float edge = smoothstep(uRadius, uRadius - uFeather, r);
    float alpha = uOpacity * edge;

    // simple fresnel-ish tint
    float fres = clamp(1.0 - r / (uRadius + 1e-5), 0.0, 1.0);
    vec3 col = mix(uColor * 0.7, uColor, fres);

    gl_FragColor = vec4(col, alpha);
  }`
);
extend({ PondMat });

export default function Pond({
  radius = 0.55,
  feather = 0.35,
  color = "#9fd0ff",
  opacity = 0.45, // can be 1.0 now
  amp = 0.02,
  speed = 1.0,
  yOffset = 0.003,
  renderOrder = 1100, // draw BEFORE boat (boat will be 1200)
  ...props
}) {
  const mat = useRef();

  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(radius + feather, 96);
    g.rotateX(-Math.PI / 2);
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
      {/* IMPORTANT: opaque bucket (transparent=false) with alphaTest */}
      <pondMat
        ref={mat}
        transparent={false}
        alphaTest={0.01}
        depthTest={false}
        depthWrite={false}
        uRadius={radius}
        uFeather={feather}
        uColor={new THREE.Color(color)}
        uOpacity={opacity}
        uAmp={amp}
        uSpeed={speed}
      />
    </mesh>
  );
}
