import React from "react";
import { KeyProfile } from "@/types";
import { IKeyProfilePlugin, ICutGeometry, ISvgGeometry } from "../types";
import { calculateEdgeCuts, getTipX } from "../utils";

const cutGeometry: ICutGeometry = {
  pinSpacing: 3.96,       // 0.156 inches
  firstPinOffset: 5.87,  // 0.231 inches
  rootDepth0: 8.5,       // ~0.335 inches from spine
  cutStep: 0.381,         // 0.015 inches per depth step
};

const svgGeometry: ISvgGeometry = {
  spacing: 40,
  shoulderX: 120,
  firstPinOffset: 60,
  flatWidth: 8,
  slope: 1.0,
  depthSpan: 35,
};

export const SchlageCPlugin: IKeyProfilePlugin = {
  id: "schlage-c",
  name: "Schlage C (Hexagonal)",
  manufacturer: "Schlage",
  defaultPositions: 5,
  cutGeometry,
  svgGeometry,
  
  drawOutline(profile: KeyProfile): React.ReactNode {
    const tipX = getTipX(profile.positions || this.defaultPositions, this.svgGeometry);
    
    // Schlage Bow
    let path = `M 15,75 L 25,15 L 85,15 L 115,45 L 115,50 L 120,50 `;
    path += calculateEdgeCuts(profile, 50, this.svgGeometry, false);
    
    // Beautiful Tip Taper
    path += `L ${tipX + 5},50 L ${tipX + 45},90 L ${tipX + 45},100 `;
    
    // Bottom Edge + Bottom Bow
    path += `L 120,100 L 115,100 L 115,105 L 85,135 L 25,135 Z`;
    
    // Schlage Keyhole
    path += ` M 60,60 Q 65,60 65,65 L 65,85 Q 65,90 60,90 L 45,80 Q 40,75 45,70 Z`;
    
    return React.createElement(React.Fragment, null, 
      React.createElement("path", { d: path, className: "fill-surface stroke-foreground/20", strokeWidth: "2", fillRule: "evenodd" }),
      React.createElement("path", { d: `M 130,65 L ${tipX + 25},65 L ${tipX + 25},75 L 130,75 Z`, className: "fill-black/10 dark:fill-black/40" })
    );
  },

  generateSCAD(profile: KeyProfile): string {
    const bitting = profile.bitting;
    const positions = profile.positions || this.defaultPositions;
    const bladeHeight = 10.03;
    const bladeThickness = 2.0;
    const bladeLength = this.cutGeometry.firstPinOffset + ((positions - 1) * this.cutGeometry.pinSpacing) + 5;
    
    let scad = `
// Mimic Key Generator
// Profile: ${profile.name} (Plugin: ${this.id})
// Bitting: ${bitting.join('')}

$fn = 64;

module schlage_warding_profile() {
  polygon(points=[
    [0, 0], [${bladeThickness}, 0], 
    [${bladeThickness}, 3], [${bladeThickness - 0.8}, 3.5], [${bladeThickness}, 4],
    [${bladeThickness}, 6], [${bladeThickness - 1.2}, 6.5], [${bladeThickness}, 7],
    [${bladeThickness}, ${bladeHeight}], 
    [0, ${bladeHeight}], 
    [0, 8.5], [0.8, 8.0], [0, 7.5],
    [0, 4.5], [1.2, 4.0], [0, 3.5]
  ]);
}

module key_blank() {
  union() {
    // Realistic Bow (Head of the key)
    translate([-10, ${bladeThickness/2}, ${bladeHeight/2} - 1])
    rotate([90, 0, 0])
    difference() {
      // Main rounded bow shape
      hull() {
        translate([5, 0, 0]) cylinder(r=${bladeHeight/2 + 1}, h=${bladeThickness}, center=true);
        translate([-12, 12, 0]) cylinder(r=12, h=${bladeThickness}, center=true);
        translate([-12, -12, 0]) cylinder(r=12, h=${bladeThickness}, center=true);
      }
      // Keyring hole
      translate([-12, 0, 0])
      cylinder(r=4, h=${bladeThickness + 2}, center=true);
    }
    
    // Neck (Connects bow to blade)
    translate([-5, 0, -1])
    cube([5, ${bladeThickness}, ${bladeHeight}]);
    
    // Shoulder Stop
    translate([-2, -0.5, -1.5])
    cube([2, ${bladeThickness + 1}, ${bladeHeight + 1}]);
    
    // Blade rendering
    translate([0, 0, -1])
    rotate([90, 0, 90])
    linear_extrude(height=${bladeLength})
    schlage_warding_profile();
  }
}

module v_cut(depth) {
  hull() {
    translate([0, 0, depth])
    cube([0.5, 3, 0.1], center=true);
    
    translate([0, 0, depth + 10])
    cube([20, 3, 0.1], center=true);
  }
}

module cuts() {
  // Precise Bitting Cuts
`;
    for (let i = 0; i < positions; i++) {
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\\D/g, '')) || 0;
      
      const cx = this.cutGeometry.firstPinOffset + i * this.cutGeometry.pinSpacing;
      const depthY = this.cutGeometry.rootDepth0 - (val * this.cutGeometry.cutStep);
      
      scad += `  translate([${cx}, 0, ${depthY - 1}]) rotate([90, 0, 0]) v_cut(0);\n`;
    }

    scad += `}

// Final Render
difference() {
  key_blank();
  cuts();
}
`;
    return scad;
  }
};
