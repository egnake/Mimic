import { KeyProfile } from "@/types";

export function generateKeySVGPath(profile: KeyProfile): string {
  if (!profile) return "";

  const positions = profile.positions;
  const bitting = profile.bitting;
  
  // Bow (Head) and Shaft
  let path = `M 20,75 C 20,20 100,20 100,50 L 120,50 `;
  
  const startX = 160;
  const endX = 430;
  const spacing = positions > 1 ? (endX - startX) / (positions - 1) : 0;
  
  // Blade parameters
  const bladeStartX = 120;
  const bladeEndX = 470;
  const defaultY = 50;
  const flatW = spacing * 0.15; // 15% of spacing is the flat root
  const slope = 1.0; // 45 degree angle for the cuts
  
  // Discretize the top edge to calculate the envelope of the cuts
  let lastY = defaultY;
  for (let x = bladeStartX; x <= bladeEndX; x += 1) {
    let finalY = defaultY;
    
    // Evaluate depth at this X for all cuts, take the maximum Y (deepest cut)
    for (let i = 0; i < positions; i++) {
      const cx = startX + i * spacing;
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\D/g, '')) || 0;
      const depthY = 50 + (val / 9) * 35; // 0 = 50, 9 = 85
      
      let cutY = defaultY;
      const dist = Math.abs(x - cx);
      
      if (dist <= flatW / 2) {
        cutY = depthY;
      } else {
        cutY = depthY - (dist - flatW / 2) * slope;
      }
      
      if (cutY > finalY) {
        finalY = cutY;
      }
    }
    
    // Small optimization: only add L if Y changes significantly, or just add all since it's 350 points (very fast)
    path += `L ${x},${finalY.toFixed(1)} `;
    lastY = finalY;
  }
  
  // Tip of the key
  // Angle down to a point, then flat bottom
  const tipY = Math.max(lastY, 65);
  path += `L 485,${tipY + 10} `;
  path += `Q 495,${tipY + 15} 495,100 `;
  
  // Bottom edge
  path += `L 130,100 L 130,105 L 120,105 L 120,100 L 100,100 `;
  
  // Bottom of bow
  path += `C 100,130 20,130 20,75 Z`;
  
  // Add Key Hole (Drawn backwards to subtract using fill-rule evenodd)
  path += ` M 45,75 A 12,12 0 1,0 69,75 A 12,12 0 1,0 45,75 Z`;

  return path;
}
