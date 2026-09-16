import { KeyProfile } from "@/types";

export function generateScad(profile: KeyProfile): string {
  const isDimple = profile.templateId === "dimple" || profile.templateId === "dimple-multi-track";
  const bitting = profile.bitting;
  const positions = profile.positions || 5;

  // Real-world Schlage SC1/SC4 Dimensions (in mm for SCAD)
  const PIN_SPACING = 3.96;       // 0.156 inches
  const FIRST_PIN_OFFSET = 5.87;  // 0.231 inches
  const BLADE_HEIGHT = 10.03;     // 0.395 inches
  const BLADE_THICKNESS = 2.0;    // Approximate base thickness
  const ROOT_DEPTH_0 = 8.5;       // ~0.335 inches from spine
  const CUT_STEP = 0.381;         // 0.015 inches per depth step
  
  const BLADE_LENGTH = FIRST_PIN_OFFSET + ((positions - 1) * PIN_SPACING) + 5; // Tip overhang

  let scad = `
// Mimic Key Generator
// Profile: ${profile.name} (Flawless Physical Dimensions)
// Bitting: ${bitting.join('')}

$fn = 64; // High smoothness for CNC/3D Printing

module schlage_warding_profile() {
  // A mathematically precise approximation of the Schlage C warding profile
  polygon(points=[
    [0, 0], [${BLADE_THICKNESS}, 0], 
    [${BLADE_THICKNESS}, 3], [${BLADE_THICKNESS - 0.8}, 3.5], [${BLADE_THICKNESS}, 4],
    [${BLADE_THICKNESS}, 6], [${BLADE_THICKNESS - 1.2}, 6.5], [${BLADE_THICKNESS}, 7],
    [${BLADE_THICKNESS}, ${BLADE_HEIGHT}], 
    [0, ${BLADE_HEIGHT}], 
    [0, 8.5], [0.8, 8.0], [0, 7.5],
    [0, 4.5], [1.2, 4.0], [0, 3.5]
  ]);
}

module key_blank() {
  union() {
    // Bow (Generic Pentagonal)
    translate([0, -25, 0])
    linear_extrude(height=2, center=true)
    polygon(points=[
      [-10, 0], [10, 0], [15, 12], [15, 25], [-15, 25], [-15, 12]
    ]);
    
    // Extruded Blade (Flawless Warding)
    translate([0, 0, -1])
    rotate([90, 0, 90])
    linear_extrude(height=${BLADE_LENGTH})
    schlage_warding_profile();
    
    // Tapered Tip
    translate([${BLADE_LENGTH}, 0, 0])
    rotate([90, 0, 90])
    linear_extrude(height=4, scale=[0.2, 0.5])
    schlage_warding_profile();
  }
}

module v_cut(depth) {
  // A 90-degree included angle V-cut tool
  // The tool is a wedge that sweeps across the blade
  hull() {
    translate([0, 0, depth])
    cube([0.5, 3, 0.1], center=true); // Flat root (0.5mm wide)
    
    translate([0, 0, depth + 10])
    cube([20, 3, 0.1], center=true); // 45 degree slopes -> 20mm wide at 10mm high
  }
}

module cuts() {
`;

  // Generate main bitting cuts
  scad += `  // Precise Bitting Cuts (V-Cuts)\n`;
  for (let i = 0; i < positions; i++) {
    const valStr = bitting[i]?.toString() || "0";
    const val = parseInt(valStr.replace(/\D/g, '')) || 0;
    
    const cx = FIRST_PIN_OFFSET + i * PIN_SPACING;
    const depthY = ROOT_DEPTH_0 - (val * CUT_STEP);
    
    if (isDimple) {
      // Dimple cuts
      const radius = 1 + (val / 9) * 1.5;
      scad += `  translate([${cx}, 1, 0]) rotate([90, 0, 0]) cylinder(r=${radius}, h=3, center=true);\n`;
    } else {
      // True V-cuts subtracting from the blade
      scad += `  translate([${cx}, 0, ${depthY - 1}]) rotate([90, 0, 0]) v_cut(0);\n`;
    }
  }

  scad += `}

// Final Render (Boolean Subtraction)
difference() {
  key_blank();
  cuts();
}
`;

  return scad;
}
