import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const FloatingSphere = ({ position, color, scale, floatIntensity = 2, speed = 2 }) => {
  const meshRef = useRef();

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={floatIntensity}>
      <Sphere ref={meshRef} position={position} scale={scale} args={[1, 64, 64]}>
        <meshPhysicalMaterial 
          color={color}
          roughness={0.1}
          metalness={0.8}
          transmission={0.5}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
};

const Particles = () => {
  const pointsRef = useRef();
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Stars 
      ref={pointsRef} 
      radius={50} 
      depth={50} 
      count={2000} 
      factor={4} 
      saturation={0} 
      fade 
      speed={1} 
    />
  );
};

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#d4a373" />
        <pointLight position={[0, 5, 5]} intensity={0.8} color="#fcd5ce" />
        
        {/* Luxury Colored Spheres */}
        <FloatingSphere position={[-5, 2, -2]} color="#d4a373" scale={1.5} speed={1.5} floatIntensity={3} />
        <FloatingSphere position={[6, -3, -5]} color="#fcd5ce" scale={2.5} speed={1} floatIntensity={2} />
        <FloatingSphere position={[-3, -4, 2]} color="#fae1dd" scale={1} speed={2} floatIntensity={4} />
        <FloatingSphere position={[4, 4, -1]} color="#f8edeb" scale={1.8} speed={1.2} floatIntensity={2.5} />
        
        <Particles />
      </Canvas>
    </div>
  );
};

export default HeroScene;
