import { KeyProfile } from "@/types";

export function generateGCode(profile: KeyProfile): string {
  const isDimple = profile.templateId === "dimple" || profile.templateId === "dimple-multi-track";
  const bitting = profile.bitting;
  const secondaryBitting = profile.secondaryBitting || [];

  let gcode = `(Mimic CNC Generator)
(Profile: ${profile.name})
(Type: ${profile.type})
(Setup: Use 90-degree V-bit for dimple, standard endmill for edge cuts)
G21 (Metric)
G90 (Absolute positioning)
G0 Z5 (Safe Z)
M3 S10000 (Spindle start)
`;

  let startX = 10; // 10mm from tip/shoulder depending on alignment
  let spacing = 6;
  let feedRate = 100; // mm/min for plunge

  gcode += `\n(--- Main Track Cuts ---)\n`;
  for (let i = 0; i < profile.positions; i++) {
    const valStr = bitting[i]?.toString() || "0";
    const val = parseInt(valStr.replace(/\D/g, '')) || 0;
    
    const cx = startX + i * spacing;
    if (isDimple) {
      // Dimple plunge cut
      // val 0-9 mapped to depth 0.2mm - 1.5mm
      const depth = 0.2 + (val / 9) * 1.5;
      gcode += `G0 X${cx.toFixed(3)} Y0.000\n`;
      gcode += `G1 Z-${depth.toFixed(3)} F${feedRate}\n`;
      gcode += `G0 Z2.000\n`;
    } else {
      // Standard edge cut
      const depth = 1 + (val / 9) * 3;
      gcode += `G0 X${cx.toFixed(3)} Y5.000\n`;
      gcode += `G1 Y${depth.toFixed(3)} F${feedRate}\n`;
      gcode += `G0 Y5.000\n`;
    }
  }

  if (isDimple && profile.secondaryPositions && profile.secondaryPositions > 0) {
    gcode += `\n(--- Secondary Track Cuts ---)\n`;
    const secSpacing = profile.secondaryPositions > 1 ? (profile.positions * spacing) / profile.secondaryPositions : spacing;
    for (let i = 0; i < profile.secondaryPositions; i++) {
      const valStr = secondaryBitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\D/g, '')) || 0;
      
      const cx = startX + i * secSpacing;
      const depth = 0.2 + (val / 9) * 1.5;
      
      // Secondary track is offset in Y by 3mm
      gcode += `G0 X${cx.toFixed(3)} Y-3.000\n`;
      gcode += `G1 Z-${depth.toFixed(3)} F${feedRate}\n`;
      gcode += `G0 Z2.000\n`;
    }
  }

  gcode += `
(End of Program)
G0 Z10
M5 (Spindle off)
M30 (End program)
`;

  return gcode;
}
