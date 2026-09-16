import React from "react";
import { KeyProfile } from "@/types";

export type CutStrategy = 'edge-single' | 'edge-double' | 'dimple' | 'laser-track';

export interface KeyTemplate {
  id: string;
  name: string;
  cutStrategy: CutStrategy;
  drawOutline: (profile: KeyProfile) => React.ReactNode;
  drawCuts?: (profile: KeyProfile) => React.ReactNode;
}

// Flawless Geometry Constants (Scaled for SVG)
const SPACING = 40;
const SHOULDER_X = 120;
const FIRST_PIN_OFFSET = 60; // 1.5x spacing (Schlage standard)
const FLAT_WIDTH = 8;
const SLOPE = 1.0; // 90 degree included angle
const DEPTH_SPAN = 35; // How deep a '9' cut is

export function getBladeLength(positions: number): number {
  return FIRST_PIN_OFFSET + (positions - 1) * SPACING + SPACING * 1.5;
}

export function getTipX(positions: number): number {
  return SHOULDER_X + getBladeLength(positions);
}

function calculateEdgeCuts(profile: KeyProfile, startY: number, inverted: boolean = false): string {
  const positions = profile.positions || 5;
  const bitting = profile.bitting;
  const startX = SHOULDER_X + FIRST_PIN_OFFSET;
  
  const bladeEndX = getTipX(positions);
  
  let path = "";
  for (let x = SHOULDER_X; x <= bladeEndX; x += 1) {
    let finalY = startY;
    
    for (let i = 0; i < positions; i++) {
      const cx = startX + i * SPACING;
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\D/g, '')) || 0;
      
      const depthOffset = (val / 9) * DEPTH_SPAN;
      const depthY = inverted ? startY - depthOffset : startY + depthOffset;
      
      let cutY = startY;
      const dist = Math.abs(x - cx);
      
      if (dist <= FLAT_WIDTH / 2) {
        cutY = depthY;
      } else {
        const rise = (dist - FLAT_WIDTH / 2) * SLOPE;
        cutY = depthY + (inverted ? rise : -rise);
      }
      
      if (inverted) {
        if (cutY < finalY) finalY = cutY;
      } else {
        if (cutY > finalY) finalY = cutY;
      }
    }
    
    path += `L ${x},${finalY.toFixed(1)} `;
  }
  return path;
}

export const templates: KeyTemplate[] = [
  {
    id: 'standard-edge',
    name: 'Standard Edge (Square)',
    cutStrategy: 'edge-single',
    drawOutline: (profile) => {
      const tipX = getTipX(profile.positions || 5);
      
      // Top Bow + Top Blade Edge
      let path = `M 15,75 C 15,15 95,15 105,45 L 105,50 L 120,50 `;
      path += calculateEdgeCuts(profile, 50, false);
      
      // Tip (Taper down to bottom)
      path += `L ${tipX + 5},50 L ${tipX + 45},95 L ${tipX + 45},100 `;
      
      // Bottom Edge
      path += `L 120,100 `;
      
      // Bottom Bow
      path += `L 105,100 L 105,105 C 95,135 15,135 15,75 Z`;
      
      // Hole
      path += ` M 45,75 A 12,12 0 1,0 69,75 A 12,12 0 1,0 45,75 Z`;
      
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d={`M 130,65 L ${tipX + 25},65 L ${tipX + 25},75 L 130,75 Z`} className="fill-black/10 dark:fill-black/40" />
        </>
      );
    }
  },
  {
    id: 'round-edge',
    name: 'Classic Yale (Round)',
    cutStrategy: 'edge-single',
    drawOutline: (profile) => {
      const tipX = getTipX(profile.positions || 5);
      
      // Round Bow + Top Blade Edge
      let path = `M 30,75 A 45,45 0 1,1 105,45 L 105,50 L 120,50 `;
      path += calculateEdgeCuts(profile, 50, false);
      
      // Tip
      path += `L ${tipX + 5},50 L ${tipX + 45},95 L ${tipX + 45},100 `;
      
      // Bottom Edge + Bottom Bow
      path += `L 120,100 L 105,100 L 105,105 `;
      path += `A 45,45 0 0,1 30,75 Z`;
      
      // Hole
      path += ` M 55,75 A 12,12 0 1,0 79,75 A 12,12 0 1,0 55,75 Z`;
      
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d={`M 130,65 L ${tipX + 25},65 L ${tipX + 25},75 L 130,75 Z`} className="fill-black/10 dark:fill-black/40" />
        </>
      );
    }
  },
  {
    id: 'hex-edge',
    name: 'Hexagonal (Schlage)',
    cutStrategy: 'edge-single',
    drawOutline: (profile) => {
      const tipX = getTipX(profile.positions || 5);
      
      // Schlage Bow
      let path = `M 15,75 L 25,15 L 85,15 L 115,45 L 115,50 L 120,50 `;
      path += calculateEdgeCuts(profile, 50, false);
      
      // Beautiful Tip Taper
      path += `L ${tipX + 5},50 L ${tipX + 45},90 L ${tipX + 45},100 `;
      
      // Bottom Edge + Bottom Bow
      path += `L 120,100 L 115,100 L 115,105 L 85,135 L 25,135 Z`;
      
      // Schlage Keyhole
      path += ` M 60,60 Q 65,60 65,65 L 65,85 Q 65,90 60,90 L 45,80 Q 40,75 45,70 Z`;
      
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d={`M 130,65 L ${tipX + 25},65 L ${tipX + 25},75 L 130,75 Z`} className="fill-black/10 dark:fill-black/40" />
        </>
      );
    }
  },
  {
    id: 'double-edge',
    name: 'Double-Sided (Auto)',
    cutStrategy: 'edge-double',
    drawOutline: (profile) => {
      // Calculate top cuts
      let path = `M 40,75 A 50,50 0 1,1 100,30 L 120,30 `;
      path += calculateEdgeCuts(profile, 30, false);
      
      // Tip
      path += `L 485,55 Q 495,75 485,95 `;
      
      // Calculate bottom cuts (inverted). We must traverse backwards from 470 to 120 to connect the path.
      // Easiest way is to calculate normally, extract coords, and reverse them.
      const positions = profile.positions;
      const bitting = profile.bitting;
      const startX = 160;
      const endX = 430;
      const spacing = positions > 1 ? (endX - startX) / (positions - 1) : 0;
      const flatW = spacing * 0.15; 
      const slope = 1.0; 
      
      for (let x = 470; x >= 120; x -= 1) {
        let finalY = 120;
        for (let i = 0; i < positions; i++) {
          const cx = startX + i * spacing;
          const valStr = bitting[i]?.toString() || "0";
          const val = parseInt(valStr.replace(/\D/g, '')) || 0;
          const depthY = 120 - (val / 9) * 35; 
          
          let cutY = 120;
          const dist = Math.abs(x - cx);
          
          if (dist <= flatW / 2) {
            cutY = depthY;
          } else {
            cutY = depthY + (dist - flatW / 2) * slope;
          }
          
          if (cutY < finalY) {
            finalY = cutY;
          }
        }
        path += `L ${x},${finalY.toFixed(1)} `;
      }
      
      path += `L 120,120 L 100,120 A 50,50 0 0,1 40,75 Z`;
      path += ` M 55,75 A 12,12 0 1,0 79,75 A 12,12 0 1,0 55,75 Z`;
      
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d="M 130,65 L `${getTipX(profile.positions || 5) - 20},65 L `${getTipX(profile.positions || 5) - 20},85 L 130,85 Z" className="fill-black/10 dark:fill-black/40" />
        </>
      );
    }
  },
  {
    id: 'dimple-flat',
    name: 'Dimple (High Security)',
    cutStrategy: 'dimple',
    drawOutline: (profile) => {
      // Large plastic DOM style bow
      let path = `M 30,75 C 30,10 110,10 110,50 L 120,50 L 480,50 Q 495,50 495,75 Q 495,100 480,100 L 120,100 L 110,100 C 110,140 30,140 30,75 Z`;
      path += ` M 50,75 A 15,15 0 1,0 80,75 A 15,15 0 1,0 50,75 Z`;
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d="M 130,70 L 470,70 L 470,80 L 130,80 Z" className="fill-black/10 dark:fill-black/40" />
        </>
      );
    },
    drawCuts: (profile) => {
      const positions = profile.positions;
      const bitting = profile.bitting;
      const startX = 160;
      const endX = 430;
      const spacing = positions > 1 ? (endX - startX) / (positions - 1) : 0;
      
      return (
        <>
          {bitting.map((bVal, idx) => {
            const valStr = bVal?.toString() || "0";
            const val = parseInt(valStr.replace(/\D/g, '')) || 0;
            const cx = startX + idx * spacing;
            const cy = 75; // Center of blade
            // dimple radius grows with depth
            const radius = 3 + (val / 9) * 8; 
            return (
              <circle 
                key={idx} 
                cx={cx} 
                cy={cy} 
                r={radius} 
                className="fill-background stroke-foreground/30 shadow-inner" 
                strokeWidth="1" 
              />
            );
          })}
        </>
      );
    }
  },
  {
    id: 'laser-track',
    name: 'Automotive Track (Laser)',
    cutStrategy: 'laser-track',
    drawOutline: (profile) => {
      // Sleek automotive remote style bow
      let path = `M 30,85 C 30,30 110,40 120,50 L 485,50 Q 495,60 495,75 Q 495,90 485,100 L 120,100 C 110,110 30,120 30,85 Z`;
      path += ` M 45,75 A 8,8 0 1,0 61,75 A 8,8 0 1,0 45,75 Z`;
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
        </>
      );
    },
    drawCuts: (profile) => {
      const positions = profile.positions;
      const bitting = profile.bitting;
      const startX = 160;
      const endX = 430;
      const spacing = positions > 1 ? (endX - startX) / (positions - 1) : 0;
      
      // Calculate smooth bezier track
      let trackPath = `M 130,75 `;
      for (let i = 0; i < positions; i++) {
        const cx = startX + i * spacing;
        
        const valStr = bitting[i]?.toString() || "0";
        const val = parseInt(valStr.replace(/\D/g, '')) || 0;
        
        // laser tracks typically wiggle around the center.
        // val 0-9 mapped to 55 to 95.
        const cy = 55 + (val / 9) * 40;
        
        if (i === 0) {
          trackPath += `L ${cx - spacing/2},75 L ${cx},${cy} `;
        } else {
          const prevValStr = bitting[i-1]?.toString() || "0";
          const prevVal = parseInt(prevValStr.replace(/\D/g, '')) || 0;
          const prevCX = startX + (i-1) * spacing;
          const prevCY = 55 + (prevVal / 9) * 40;
          trackPath += `C ${prevCX + spacing/2},${prevCY} ${cx - spacing/2},${cy} ${cx},${cy} `;
        }
      }
      trackPath += `L 470,75`;

      return (
        <path 
          d={trackPath} 
          className="fill-none stroke-background drop-shadow-sm" 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
  },
  {
    id: 'dimple-multi-track',
    name: 'Dimple Multi-Track (Kale vs.)',
    cutStrategy: 'dimple',
    drawOutline: (profile) => {
      let path = `M 30,75 C 30,10 110,10 110,50 L 120,50 L 480,50 Q 495,50 495,75 Q 495,100 480,100 L 120,100 L 110,100 C 110,140 30,140 30,75 Z`;
      path += ` M 50,75 A 15,15 0 1,0 80,75 A 15,15 0 1,0 50,75 Z`;
      return (
        <>
          <path d={path} className="fill-surface stroke-foreground/20" strokeWidth="2" fillRule="evenodd" />
          <path d="M 130,65 L `${getTipX(profile.positions || 5) - 20},65 L `${getTipX(profile.positions || 5) - 20},85 L 130,85 Z" className="fill-black/10 dark:fill-black/40" />
        </>
      );
    },
    drawCuts: (profile) => {
      const startX = 160;
      const endX = 430;
      
      const pos1 = profile.positions;
      const spacing1 = pos1 > 1 ? (endX - startX) / (pos1 - 1) : 0;
      
      const pos2 = profile.secondaryPositions || 0;
      const spacing2 = pos2 > 1 ? (endX - startX) / (pos2 - 1) : 0;
      
      return (
        <>
          {profile.bitting.map((bVal, idx) => {
            const valStr = bVal?.toString() || "0";
            const val = parseInt(valStr.replace(/\D/g, '')) || 0;
            const cx = startX + idx * spacing1;
            const cy = 60; // Upper track
            const radius = 2 + (val / 9) * 5; 
            return (
              <circle 
                key={`p1-${idx}`} 
                cx={cx} cy={cy} r={radius} 
                className="fill-background stroke-foreground/30 shadow-inner" strokeWidth="1" 
              />
            );
          })}
          {(profile.secondaryBitting || []).map((bVal, idx) => {
            const valStr = bVal?.toString() || "0";
            const val = parseInt(valStr.replace(/\D/g, '')) || 0;
            const cx = startX + idx * spacing2;
            const cy = 90; // Lower track
            const radius = 2 + (val / 9) * 5; 
            return (
              <circle 
                key={`p2-${idx}`} 
                cx={cx} cy={cy} r={radius} 
                className="fill-background stroke-foreground/30 shadow-inner" strokeWidth="1" 
              />
            );
          })}
        </>
      );
    }
  }
];

export function getTemplate(id?: string): KeyTemplate {
  return templates.find(t => t.id === id) || templates[0];
}
