import { KeyProfile } from "@/types";
import { ISvgGeometry } from "./types";

export function getBladeLength(positions: number, svgGeo: ISvgGeometry): number {
  return svgGeo.firstPinOffset + (positions - 1) * svgGeo.spacing + svgGeo.spacing * 1.5;
}

export function getTipX(positions: number, svgGeo: ISvgGeometry): number {
  return svgGeo.shoulderX + getBladeLength(positions, svgGeo);
}

export function calculateEdgeCuts(profile: KeyProfile, startY: number, svgGeo: ISvgGeometry, inverted: boolean = false): string {
  const positions = profile.positions || 5;
  const bitting = profile.bitting;
  const startX = svgGeo.shoulderX + svgGeo.firstPinOffset;
  
  const bladeEndX = getTipX(positions, svgGeo);
  
  let path = "";
  for (let x = svgGeo.shoulderX; x <= bladeEndX; x += 1) {
    let finalY = startY;
    
    for (let i = 0; i < positions; i++) {
      const cx = startX + i * svgGeo.spacing;
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\D/g, '')) || 0;
      
      const depthOffset = (val / 9) * svgGeo.depthSpan;
      const depthY = inverted ? startY - depthOffset : startY + depthOffset;
      
      let cutY = startY;
      const dist = Math.abs(x - cx);
      
      if (dist <= svgGeo.flatWidth / 2) {
        cutY = depthY;
      } else {
        const rise = (dist - svgGeo.flatWidth / 2) * svgGeo.slope;
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
