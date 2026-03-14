"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshDistortMaterial,
  Sphere,
  RoundedBox,
  Text3D,
  Center,
  useAnimations,
  useGLTF,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export type CogniState = 'idle' | 'listening' | 'thinking' | 'explaining' | 'encouraging' | 'celebrating';

interface Cogni3DAvatarProps {
  state: CogniState;
  isSpeaking?: boolean;
  audioLevel?: number;
  className?: string;
}

// =====================================================
// VISEME DEFINITIONS (ARKit Compatible)
// =====================================================

const VISEMES = {
  rest: { jawOpen: 0, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0, mouthRight: 0, mouthSmile: 0 },
  A: { jawOpen: 0.8, mouthFunnel: 0.1, mouthPucker: 0, mouthLeft: 0.2, mouthRight: 0.2, mouthSmile: 0.3 },
  E: { jawOpen: 0.4, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0.3, mouthRight: 0.3, mouthSmile: 0.5 },
  I: { jawOpen: 0.3, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0.25, mouthRight: 0.25, mouthSmile: 0.6 },
  O: { jawOpen: 0.6, mouthFunnel: 0.5, mouthPucker: 0.9, mouthLeft: 0, mouthRight: 0, mouthSmile: 0 },
  U: { jawOpen: 0.4, mouthFunnel: 0.7, mouthPucker: 1.0, mouthLeft: 0, mouthRight: 0, mouthSmile: 0 },
  M: { jawOpen: 0, mouthFunnel: 0, mouthPucker: 0.5, mouthLeft: 0, mouthRight: 0, mouthSmile: 0 },
  F: { jawOpen: 0.15, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0.4, mouthRight: 0.4, mouthSmile: 0.1 },
  TH: { jawOpen: 0.2, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0.3, mouthRight: 0.3, mouthSmile: 0 },
  S: { jawOpen: 0.15, mouthFunnel: 0, mouthPucker: 0, mouthLeft: 0.35, mouthRight: 0.35, mouthSmile: 0.2 },
};

const VISEME_SEQUENCE = ['rest', 'A', 'E', 'O', 'U', 'M', 'F', 'TH', 'S', 'I'] as const;

// =====================================================
// STATE ANIMATION CONFIGS
// =====================================================

const STATE_CONFIGS = {
  idle: {
    headBob: { amplitude: 0.02, speed: 0.5 },
    breathRate: 1,
    eyeBlinkChance: 0.008,
    glowIntensity: 0.4,
    rotationRange: 0.05,
  },
  listening: {
    headBob: { amplitude: 0.015, speed: 0.8 },
    breathRate: 1.2,
    eyeBlinkChance: 0.012,
    glowIntensity: 0.6,
    rotationRange: 0.08,
  },
  thinking: {
    headBob: { amplitude: 0.03, speed: 0.6 },
    breathRate: 0.8,
    eyeBlinkChance: 0.02,
    glowIntensity: 0.5,
    rotationRange: 0.1,
  },
  explaining: {
    headBob: { amplitude: 0.025, speed: 1.2 },
    breathRate: 1.4,
    eyeBlinkChance: 0.006,
    glowIntensity: 0.8,
    rotationRange: 0.15,
  },
  encouraging: {
    headBob: { amplitude: 0.04, speed: 1 },
    breathRate: 1.3,
    eyeBlinkChance: 0.004,
    glowIntensity: 0.9,
    rotationRange: 0.12,
  },
  celebrating: {
    headBob: { amplitude: 0.05, speed: 1.5 },
    breathRate: 1.5,
    eyeBlinkChance: 0.003,
    glowIntensity: 1.0,
    rotationRange: 0.2,
  },
};

// =====================================================
// 3D HEAD COMPONENT
// =====================================================

interface HeadProps {
  state: CogniState;
  currentViseme: typeof VISEMES.rest;
  isBlinking: boolean;
}

function CogniHead({ state, currentViseme, isBlinking }: HeadProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  
  const config = STATE_CONFIGS[state];
  
  useFrame(({ clock }) => {
    if (!headRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Head animation
    headRef.current.position.y = Math.sin(t * config.headBob.speed) * config.headBob.amplitude;
    headRef.current.rotation.y = Math.sin(t * 0.3) * config.rotationRange;
    headRef.current.rotation.x = Math.sin(t * 0.2) * 0.03;
    
    // Antenna glow
    if (antennaRef.current) {
      antennaRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
    }
    
    // Mouth animation based on viseme
    if (mouthRef.current) {
      const jawOpen = currentViseme.jawOpen;
      mouthRef.current.scale.x = 0.8 + currentViseme.mouthLeft + currentViseme.mouthRight;
      mouthRef.current.scale.y = 0.3 + jawOpen * 0.8;
      mouthRef.current.position.z = -0.35 + jawOpen * 0.1;
    }
    
    // Eye blink
    if (leftEyeRef.current && rightEyeRef.current) {
      const scaleY = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = scaleY;
      rightEyeRef.current.scale.y = scaleY;
    }
  });
  
  return (
    <group ref={headRef} position={[0, 0.3, 0]}>
      {/* Main Head */}
      <RoundedBox args={[0.7, 0.85, 0.6]} radius={0.15} smoothness={4}>
        <meshStandardMaterial 
          color="#4A90D9"
          metalness={0.3}
          roughness={0.4}
          emissive="#1E3A8A"
          emissiveIntensity={0.1}
        />
      </RoundedBox>
      
      {/* Face Screen */}
      <mesh position={[0, 0.05, 0.31]}>
        <boxGeometry args={[0.55, 0.45, 0.02]} />
        <meshStandardMaterial 
          color="#0A1628"
          metalness={0.5}
          roughness={0.2}
          emissive="#0F172A"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Eyes */}
      <group position={[0, 0.08, 0.32]}>
        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.13, 0.05, 0]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial 
            color="#60A5FA"
            emissive="#3B82F6"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-0.13, 0.05, 0.06]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
        </mesh>
        
        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.13, 0.05, 0]}>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial 
            color="#60A5FA"
            emissive="#3B82F6"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.13, 0.05, 0.06]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.8} />
        </mesh>
      </group>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, -0.18, 0.32]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#1E293B"
          emissive="#0F172A"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Antenna */}
      <group position={[0, 0.45, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.15]} />
          <meshStandardMaterial color="#60A5FA" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={antennaRef} position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial 
            color="#3B82F6" 
            emissive="#3B82F6"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
      
      {/* Ear pieces */}
      <mesh position={[-0.38, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.2, 0.15]} />
        <meshStandardMaterial color="#4A90D9" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.38, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.2, 0.15]} />
        <meshStandardMaterial color="#4A90D9" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

// =====================================================
// 3D BODY COMPONENT
// =====================================================

interface BodyProps {
  state: CogniState;
}

function CogniBody({ state }: BodyProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const chestLightRef = useRef<THREE.Mesh>(null);
  
  const config = STATE_CONFIGS[state];
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Body breathing
    if (bodyRef.current) {
      bodyRef.current.scale.x = 1 + Math.sin(t * config.breathRate) * 0.02;
      bodyRef.current.scale.z = 1 + Math.sin(t * config.breathRate) * 0.015;
    }
    
    // Arm gestures
    if (state === 'explaining' || state === 'encouraging') {
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(t * 1.5) * 0.2;
        rightArmRef.current.rotation.z = -Math.sin(t * 1.5 + 0.5) * 0.2;
      }
    }
    
    // Chest light pulse
    if (chestLightRef.current) {
      const material = chestLightRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.3;
    }
  });
  
  return (
    <group ref={bodyRef} position={[0, -0.5, 0]}>
      {/* Torso */}
      <RoundedBox args={[0.6, 0.7, 0.35]} radius={0.08} smoothness={4}>
        <meshStandardMaterial 
          color="#3B82F6"
          metalness={0.2}
          roughness={0.5}
        />
      </RoundedBox>
      
      {/* Chest Panel */}
      <mesh position={[0, 0.05, 0.18]}>
        <boxGeometry args={[0.35, 0.25, 0.02]} />
        <meshStandardMaterial 
          color="#0F172A"
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      
      {/* Chest Light */}
      <mesh ref={chestLightRef} position={[0, 0.05, 0.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial 
          color="#60A5FA"
          emissive="#3B82F6"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.38, 0.1, 0]}>
        <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.04} smoothness={2}>
          <meshStandardMaterial color="#4A90D9" metalness={0.2} roughness={0.5} />
        </RoundedBox>
        {/* Hand */}
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#60A5FA" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      
      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.38, 0.1, 0]}>
        <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.04} smoothness={2}>
          <meshStandardMaterial color="#4A90D9" metalness={0.2} roughness={0.5} />
        </RoundedBox>
        {/* Hand */}
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#60A5FA" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      
      {/* Neck */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.15]} />
        <meshStandardMaterial color="#4A90D9" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

// =====================================================
// FLOATING PARTICLES
// =====================================================

function FloatingParticles({ state }: { state: CogniState }) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 0.5,
      ] as [number, number, number],
      scale: 0.02 + Math.random() * 0.03,
      speed: 0.5 + Math.random() * 1,
    }));
  }, []);
  
  const config = STATE_CONFIGS[state];
  
  return (
    <group>
      {particles.map((particle) => (
        <Float key={particle.id} speed={particle.speed} floatIntensity={config.glowIntensity}>
          <mesh position={particle.position}>
            <sphereGeometry args={[particle.scale, 8, 8]} />
            <meshStandardMaterial 
              color="#60A5FA"
              emissive="#3B82F6"
              emissiveIntensity={config.glowIntensity}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// =====================================================
// AMBIENT GLOW
// =====================================================

function AmbientGlow({ state }: { state: CogniState }) {
  const glowRef = useRef<THREE.Mesh>(null);
  const config = STATE_CONFIGS[state];
  
  const glowColors = {
    idle: '#3B82F6',
    listening: '#06B6D4',
    thinking: '#8B5CF6',
    explaining: '#3B82F6',
    encouraging: '#10B981',
    celebrating: '#F59E0B',
  };
  
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const t = clock.getElapsedTime();
    glowRef.current.scale.setScalar(1 + Math.sin(t) * 0.1);
    const material = glowRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = config.glowIntensity * (0.5 + Math.sin(t * 2) * 0.3);
  });
  
  return (
    <mesh ref={glowRef} position={[0, -0.1, -0.3]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial 
        color={glowColors[state]}
        emissive={glowColors[state]}
        emissiveIntensity={config.glowIntensity}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

// =====================================================
// MAIN 3D SCENE
// =====================================================

interface SceneProps {
  state: CogniState;
  isSpeaking: boolean;
  audioLevel: number;
}

function Scene({ state, isSpeaking, audioLevel }: SceneProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentViseme, setCurrentViseme] = useState(VISEMES.rest);
  const visemeIndexRef = useRef(0);
  
  const config = STATE_CONFIGS[state];
  
  // Blinking logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() < config.eyeBlinkChance) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 100);
    return () => clearInterval(blinkInterval);
  }, [config.eyeBlinkChance]);
  
  // Lip sync logic
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentViseme(VISEMES.rest);
      return;
    }
    
    const visemeInterval = setInterval(() => {
      visemeIndexRef.current = (visemeIndexRef.current + 1) % VISEME_SEQUENCE.length;
      const visemeName = VISEME_SEQUENCE[visemeIndexRef.current];
      const viseme = VISEMES[visemeName];
      
      setCurrentViseme({
        jawOpen: viseme.jawOpen * (0.3 + audioLevel * 0.7),
        mouthFunnel: viseme.mouthFunnel,
        mouthPucker: viseme.mouthPucker,
        mouthLeft: viseme.mouthLeft,
        mouthRight: viseme.mouthRight,
        mouthSmile: viseme.mouthSmile,
      });
    }, 60 + Math.random() * 40);
    
    return () => clearInterval(visemeInterval);
  }, [isSpeaking, audioLevel]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#3B82F6" />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#60A5FA" />
      
      {/* Main Avatar */}
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
        <group scale={1.2}>
          <CogniHead state={state} currentViseme={currentViseme} isBlinking={isBlinking} />
          <CogniBody state={state} />
        </group>
      </Float>
      
      {/* Ambient Effects */}
      <AmbientGlow state={state} />
      <FloatingParticles state={state} />
    </>
  );
}

// =====================================================
// MAIN EXPORT COMPONENT
// =====================================================

export function Cogni3DAvatar({ 
  state, 
  isSpeaking = false, 
  audioLevel = 0,
  className 
}: Cogni3DAvatarProps) {
  return (
    <div className={cn("w-full h-full min-h-[400px]", className)}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['transparent']} />
        <fog attach="fog" args={['#0F172A', 5, 15]} />
        
        <Scene state={state} isSpeaking={isSpeaking} audioLevel={audioLevel} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
      </Canvas>
      
      {/* State Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md shadow-lg",
            state === 'thinking' && "bg-purple-500/20 text-purple-300 border border-purple-400/30",
            state === 'explaining' && "bg-blue-500/20 text-blue-300 border border-blue-400/30",
            state === 'encouraging' && "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
            state === 'celebrating' && "bg-amber-500/20 text-amber-300 border border-amber-400/30",
            state === 'listening' && "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
            state === 'idle' && "bg-slate-500/20 text-slate-300 border border-slate-400/30"
          )}
        >
          {state.charAt(0).toUpperCase() + state.slice(1)}
        </motion.div>
      </div>
    </div>
  );
}

export default Cogni3DAvatar;
