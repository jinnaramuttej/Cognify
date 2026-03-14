"use client";

import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float,
  useGLTF,
  useAnimations,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CogniState } from './Cogni3DAvatar';

// =====================================================
// TYPES
// =====================================================

interface CogniGLBAvatarProps {
  modelPath?: string; // Path to GLB model
  state: CogniState;
  isSpeaking?: boolean;
  audioLevel?: number;
  className?: string;
}

// =====================================================
// ANIMATION MAPPING
// =====================================================

const STATE_TO_ANIMATION: Record<CogniState, string> = {
  idle: 'Idle',
  listening: 'Listening',
  thinking: 'Thinking',
  explaining: 'Explaining',
  encouraging: 'Encouraging',
  celebrating: 'Success',
};

// =====================================================
// VISEME TO BLENDSHAPE MAPPING (ARKit Compatible)
// =====================================================

const VISEME_BLENDSHAPES = {
  rest: {
    mouthClose: 1,
    jawOpen: 0,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0,
    mouthRight: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
  },
  A: {
    mouthClose: 0,
    jawOpen: 0.7,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.1,
    mouthRight: 0.1,
    mouthSmileLeft: 0.2,
    mouthSmileRight: 0.2,
  },
  E: {
    mouthClose: 0,
    jawOpen: 0.3,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.2,
    mouthRight: 0.2,
    mouthSmileLeft: 0.5,
    mouthSmileRight: 0.5,
  },
  I: {
    mouthClose: 0,
    jawOpen: 0.2,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.15,
    mouthRight: 0.15,
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.6,
  },
  O: {
    mouthClose: 0,
    jawOpen: 0.5,
    mouthFunnel: 0.6,
    mouthPucker: 0.9,
    mouthLeft: 0,
    mouthRight: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
  },
  U: {
    mouthClose: 0,
    jawOpen: 0.3,
    mouthFunnel: 0.8,
    mouthPucker: 1,
    mouthLeft: 0,
    mouthRight: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
  },
  M: {
    mouthClose: 1,
    jawOpen: 0,
    mouthFunnel: 0,
    mouthPucker: 0.3,
    mouthLeft: 0,
    mouthRight: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
  },
  F: {
    mouthClose: 0.2,
    jawOpen: 0.1,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.3,
    mouthRight: 0.3,
    mouthSmileLeft: 0.1,
    mouthSmileRight: 0.1,
  },
  TH: {
    mouthClose: 0.1,
    jawOpen: 0.15,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.2,
    mouthRight: 0.2,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
  },
  S: {
    mouthClose: 0.1,
    jawOpen: 0.1,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthLeft: 0.25,
    mouthRight: 0.25,
    mouthSmileLeft: 0.15,
    mouthSmileRight: 0.15,
  },
};

const VISEME_SEQUENCE = ['rest', 'A', 'E', 'O', 'U', 'M', 'F', 'TH', 'S', 'I'] as const;

// =====================================================
// GLB MODEL COMPONENT
// =====================================================

interface GLBModelProps {
  modelPath: string;
  state: CogniState;
  isSpeaking: boolean;
  audioLevel: number;
}

function GLBModel({ modelPath, state, isSpeaking, audioLevel }: GLBModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, group);
  const [currentViseme, setCurrentViseme] = useState(VISEME_BLENDSHAPES.rest);
  const visemeIndexRef = useRef(0);
  const morphTargetDictionaryRef = useRef<Record<string, number>>({});
  const morphTargetInfluencesRef = useRef<number[]>([]);
  
  // Clone scene to avoid mutation
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    return clone;
  }, [scene]);
  
  // Find morph targets
  useEffect(() => {
    if (!clonedScene) return;
    
    clonedScene.traverse((object) => {
      if (object instanceof THREE.SkinnedMesh || object instanceof THREE.Mesh) {
        if (object.morphTargetDictionary && object.morphTargetInfluences) {
          morphTargetDictionaryRef.current = object.morphTargetDictionary;
          morphTargetInfluencesRef.current = object.morphTargetInfluences;
        }
      }
    });
  }, [clonedScene]);
  
  // Play animation based on state
  useEffect(() => {
    const targetAnimation = STATE_TO_ANIMATION[state];
    const action = actions[targetAnimation];
    
    if (action) {
      action.reset().fadeIn(0.3).play();
    } else if (names.length > 0) {
      // Fallback to first animation
      actions[names[0]]?.reset().fadeIn(0.3).play();
    }
    
    return () => {
      if (action) {
        action.fadeOut(0.3);
      }
    };
  }, [state, actions, names]);
  
  // Lip sync
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentViseme(VISEME_BLENDSHAPES.rest);
      return;
    }
    
    const visemeInterval = setInterval(() => {
      visemeIndexRef.current = (visemeIndexRef.current + 1) % VISEME_SEQUENCE.length;
      const visemeName = VISEME_SEQUENCE[visemeIndexRef.current];
      const viseme = VISEME_BLENDSHAPES[visemeName];
      
      // Scale by audio level
      setCurrentViseme({
        mouthClose: viseme.mouthClose * (1 - audioLevel * 0.5),
        jawOpen: viseme.jawOpen * (0.3 + audioLevel * 0.7),
        mouthFunnel: viseme.mouthFunnel,
        mouthPucker: viseme.mouthPucker,
        mouthLeft: viseme.mouthLeft,
        mouthRight: viseme.mouthRight,
        mouthSmileLeft: viseme.mouthSmileLeft,
        mouthSmileRight: viseme.mouthSmileRight,
      });
    }, 60 + Math.random() * 40);
    
    return () => clearInterval(visemeInterval);
  }, [isSpeaking, audioLevel]);
  
  // Apply blendshapes
  useFrame(() => {
    const dict = morphTargetDictionaryRef.current;
    const influences = morphTargetInfluencesRef.current;
    
    if (!dict || !influences) return;
    
    // Apply viseme blendshapes
    Object.entries(currentViseme).forEach(([name, value]) => {
      const index = dict[name];
      if (index !== undefined && influences[index] !== undefined) {
        influences[index] = THREE.MathUtils.lerp(influences[index], value, 0.3);
      }
    });
  });
  
  return <primitive ref={group} object={clonedScene} />;
}

// =====================================================
// FALLBACK PLACEHOLDER
// =====================================================

function FallbackPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
  });
  
  return (
    <mesh ref={meshRef}>
      <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
      <meshStandardMaterial 
        color="#3B82F6"
        metalness={0.3}
        roughness={0.5}
        wireframe
      />
      <Html center position={[0, 0.7, 0]}>
        <div className="bg-slate-800/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          Add GLB model to enable 3D avatar
        </div>
      </Html>
    </mesh>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function CogniGLBAvatar({ 
  modelPath,
  state, 
  isSpeaking = false, 
  audioLevel = 0,
  className 
}: CogniGLBAvatarProps) {
  const [modelError, setModelError] = useState(false);
  
  // Check if model exists
  useEffect(() => {
    if (modelPath) {
      // Preload the model
      useGLTF.preload(modelPath);
    }
  }, [modelPath]);
  
  return (
    <div className={cn("w-full h-full min-h-[400px] relative", className)}>
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={<FallbackPlaceholder />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#3B82F6" />
          <pointLight position={[0, 1, 2]} intensity={0.5} color="#60A5FA" />
          
          {/* Model or Fallback */}
          <Float speed={1} rotationIntensity={0.02} floatIntensity={0.2}>
            {modelPath && !modelError ? (
              <GLBModel 
                modelPath={modelPath}
                state={state}
                isSpeaking={isSpeaking}
                audioLevel={audioLevel}
              />
            ) : (
              <FallbackPlaceholder />
            )}
          </Float>
          
          {/* Environment */}
          <Environment preset="studio" />
        </Suspense>
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

// Preload function for external use
export function preloadCogniModel(modelPath: string) {
  useGLTF.preload(modelPath);
}

export default CogniGLBAvatar;
