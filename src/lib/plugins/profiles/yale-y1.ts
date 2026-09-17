import React from "react";
import { KeyProfile } from "@/types";
import { IKeyProfilePlugin, ICutGeometry, ISvgGeometry } from "../types";
import { calculateEdgeCuts, getTipX } from "../utils";

const cutGeometry: ICutGeometry = {
  pinSpacing: 4.0,       // Approx 0.156"
  firstPinOffset: 6.0,  
  rootDepth0: 8.5,       
  cutStep: 0.38,         
};

const svgGeometry: ISvgGeometry = {
  spacing: 40,
  shoulderX: 120,
  firstPinOffset: 60,
  flatWidth: 8,
  slope: 1.0,
  depthSpan: 35,
};

export const YaleY1Plugin: IKeyProfilePlugin = {
  id: "yale-y1",
  name: "Yale Y1 (Standard)",
  manufacturer: "Yale",
  defaultPositions: 5,
  cutGeometry,
  svgGeometry,
  
  drawOutline(profile: KeyProfile): React.ReactNode {
    const tipX = getTipX(profile.positions || this.defaultPositions, this.svgGeometry);
    
    // Rounder Yale-style Bow
    let path = `M 25,65 C 10,10 90,10 100,45 L 110,45 L 115,50 L 120,50 `;
    path += calculateEdgeCuts(profile, 50, this.svgGeometry, false);
    
    // Tip
    path += `L ${tipX + 5},50 L ${tipX + 35},85 L ${tipX + 35},100 `;
    
    // Bottom Edge
    path += `L 120,100 `;
    
    // Bottom Bow
    path += `L 115,105 L 105,105 C 90,135 15,145 25,65 Z`;
    
    // Keyhole
    path += ` M 50,75 A 10,10 0 1,0 70,75 A 10,10 0 1,0 50,75 Z`;
    
    return React.createElement(React.Fragment, null, 
      React.createElement("path", { d: path, className: "fill-surface stroke-foreground/20", strokeWidth: "2", fillRule: "evenodd" }),
      React.createElement("path", { d: `M 130,65 L ${tipX + 20},65 L ${tipX + 20},75 L 130,75 Z`, className: "fill-black/10 dark:fill-black/40" })
    );
  },

  generateSCAD(profile: KeyProfile): string {
    const bitting = profile.bitting;
    const positions = profile.positions || this.defaultPositions;
    const bladeHeight = 8.5;
    const bladeThickness = 2.0;
    const bladeLength = this.cutGeometry.firstPinOffset + ((positions - 1) * this.cutGeometry.pinSpacing) + 5;
    
    let scad = `
// Mimic Key Generator
// Profile: ${profile.name} (Plugin: ${this.id})
// Bitting: ${bitting.join('')}

$fn = 64;

module yale_warding_profile() {
  polygon(points=[
    [0, 0], [${bladeThickness}, 0], 
    [${bladeThickness}, 2], [${bladeThickness - 0.7}, 3], [${bladeThickness}, 4.5],
    [${bladeThickness}, ${bladeHeight}], 
    [0, ${bladeHeight}], 
    [0, 6.5], [0.8, 5.5], [0, 4.5],
    [0, 3], [0.5, 2], [0, 1.5]
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
    yale_warding_profile();
  }
}

module v_cut(depth) {
  hull() {
    translate([0, 0, depth])
    cube([0.5, 10, 0.1], center=true);
    
    translate([0, 0, depth + 10])
    cube([20, 10, 0.1], center=true);
  }
}

module cuts() {
`;
    for (let i = 0; i < positions; i++) {
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\\D/g, '')) || 0;
      
      const cx = this.cutGeometry.firstPinOffset + i * this.cutGeometry.pinSpacing;
      const depthY = this.cutGeometry.rootDepth0 - (val * this.cutGeometry.cutStep);
      
      scad += `  translate([${cx}, 0, ${depthY - 1}]) v_cut(0);\n`;
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
