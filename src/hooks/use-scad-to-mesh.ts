import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ScadMeshResult {
  geometry: THREE.BufferGeometry | null;
  loading: boolean;
  error: string | null;
}

export function useScadToMesh(scadString: string): ScadMeshResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    // Initialize the Web Worker
    workerRef.current = new Worker(new URL('../lib/export/scad-worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data.ok) {
        setError(data.error || "Failed to render 3D mesh.");
        setLoading(false);
        return;
      }
      
      const posArray = new Float32Array(data.positions);
      const normArray = new Float32Array(data.normals);
      
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      geom.setAttribute('normal', new THREE.BufferAttribute(normArray, 3));
      
      setGeometry(geom);
      setError(null);
      setLoading(false);
    };
    
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!scadString || !workerRef.current) return;
    
    setLoading(true);
    const id = nextId.current++;
    workerRef.current.postMessage({ id, scadString });
    
  }, [scadString]);

  return { geometry, loading, error };
}
