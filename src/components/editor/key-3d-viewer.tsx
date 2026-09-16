"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { useScadToMesh } from '@/hooks/use-scad-to-mesh';

interface Key3DViewerProps {
  scadCode: string;
}

export function Key3DViewer({ scadCode }: Key3DViewerProps) {
  const { geometry, loading, error } = useScadToMesh(scadCode);
  
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-red-400">
        <p>Error rendering 3D model: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-zinc-900 overflow-hidden rounded-md border border-zinc-800">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 z-10 text-emerald-400 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-mono tracking-wider">Compiling OpenSCAD to WASM...</p>
        </div>
      )}
      
      <Canvas shadows camera={{ position: [0, 50, 100], fov: 45 }}>
        <color attach="background" args={['#09090b']} />
        
        {/* Stage sets up nice lighting and shadows automatically */}
        <Stage 
          environment="city" 
          intensity={0.6}
          shadows={{ type: 'contact', opacity: 0.8, blur: 2 }}
          adjustCamera={1.2}
        >
          {geometry && (
            <mesh geometry={geometry} castShadow receiveShadow>
              <meshStandardMaterial 
                color="#e5e5e5" 
                metalness={0.7} 
                roughness={0.3} 
                envMapIntensity={1.0}
              />
            </mesh>
          )}
        </Stage>
        
        <OrbitControls makeDefault autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}
