import React from "react";
import { KeyProfile } from "@/types";
import { IKeyProfilePlugin, ICutGeometry, ISvgGeometry } from "../types";
import { getBladeLength, getTipX } from "../utils";

const cutGeometry: ICutGeometry = {
  pinSpacing: 3.0,       // 3mm between pins
  firstPinOffset: 5.5,   // 5.5mm from shoulder
  rootDepth0: 0.0,       // Surface level (no cut)
  cutStep: 0.5,          // 0.5mm per depth
};

const svgGeometry: ISvgGeometry = {
  spacing: 30,
  shoulderX: 120,
  firstPinOffset: 45,
  flatWidth: 0,
  slope: 0,
  depthSpan: 8, // Max radius of the dimple circle
};

export const KaleDimplePlugin: IKeyProfilePlugin = {
  id: "kale-dimple",
  name: "Kale 164 (Dimple)",
  manufacturer: "Kale Kilit",
  defaultPositions: 6,
  cutStrategy: "dimple",
  cutGeometry,
  svgGeometry,
  
  drawOutline(profile: KeyProfile): React.ReactNode {
    const positions = profile.positions || this.defaultPositions;
    const tipX = getTipX(positions, this.svgGeometry);
    
    // Dimple Key Bow (Trapezoidal with rounded edges)
    let path = `M 20,40 L 40,25 L 80,25 L 110,40 L 120,40 L 120,50 `;
    
    // Flat Top Edge of Blade
    path += `L ${tipX},50 L ${tipX + 10},60 L ${tipX + 10},90 L ${tipX},100 `;
    
    // Bottom Edge
    path += `L 120,100 `;
    
    // Bottom Bow
    path += `L 120,110 L 110,110 L 80,125 L 40,125 L 20,110 Z`;
    
    // Hole
    path += ` M 45,75 A 12,12 0 1,0 69,75 A 12,12 0 1,0 45,75 Z`;
    
    // Warding Lines (Grooves on the flat blade)
    const groove1 = `M 120,60 L ${tipX},60`;
    const groove2 = `M 120,90 L ${tipX},90`;
    
    return React.createElement(React.Fragment, null, 
      React.createElement("path", { d: path, className: "fill-surface stroke-foreground/20", strokeWidth: "2", fillRule: "evenodd" }),
      React.createElement("path", { d: groove1, className: "stroke-black/20 dark:stroke-black/50", strokeWidth: "3" }),
      React.createElement("path", { d: groove2, className: "stroke-black/20 dark:stroke-black/50", strokeWidth: "3" })
    );
  },

  drawCuts(profile: KeyProfile): React.ReactNode {
    const positions = profile.positions || this.defaultPositions;
    const bitting = profile.bitting;
    const startX = this.svgGeometry.shoulderX + this.svgGeometry.firstPinOffset;
    const centerY = 75; // Middle of the blade (50 to 100)
    
    const cuts = [];
    
    for (let i = 0; i < positions; i++) {
      const cx = startX + i * this.svgGeometry.spacing;
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\\D/g, '')) || 0;
      
      // Radius increases with depth
      const radius = 2 + (val / 9) * this.svgGeometry.depthSpan;
      
      // Draw dimple hole
      cuts.push(
        React.createElement("circle", {
          key: `dimple-${i}`,
          cx: cx,
          cy: centerY,
          r: radius,
          className: "fill-black/30 stroke-black/50 dark:fill-black/60 dark:stroke-black/80",
          strokeWidth: "1"
        }),
        React.createElement("circle", {
          key: `dimple-inner-${i}`,
          cx: cx,
          cy: centerY,
          r: Math.max(0.5, radius - 2),
          className: "fill-black/50 dark:fill-black/80"
        })
      );
    }
    
    return React.createElement(React.Fragment, null, cuts);
  },

  generateSCAD(profile: KeyProfile): string {
    const bitting = profile.bitting;
    const positions = profile.positions || this.defaultPositions;
    const bladeHeight = 10.0;
    const bladeThickness = 2.5; // Dimple keys are usually thicker
    const bladeLength = this.cutGeometry.firstPinOffset + ((positions - 1) * this.cutGeometry.pinSpacing) + 5;
    
    let scad = `
// Mimic Key Generator
// Profile: ${profile.name} (Plugin: ${this.id})
// Bitting: ${bitting.join('')}

$fn = 64;

module kale_dimple_profile() {
  // A flat rectangular blade with small warding grooves
  difference() {
    square([${bladeThickness}, ${bladeHeight}]);
    
    // Groove 1
    translate([0, 2]) square([0.5, 1]);
    
    // Groove 2
    translate([0, ${bladeHeight - 3}]) square([0.5, 1]);
  }
}

module key_blank() {
  union() {
    // Bow
    translate([0, -25, 0])
    linear_extrude(height=${bladeThickness}, center=true)
    polygon(points=[
      [-5, -5], [10, 0], [15, 12], [15, 25], [-15, 25], [-15, 12]
    ]);
    
    // Blade
    translate([0, 0, -${bladeThickness/2}])
    rotate([90, 0, 90])
    linear_extrude(height=${bladeLength})
    kale_dimple_profile();
    
    // Tip
    translate([${bladeLength}, 0, 0])
    rotate([90, 0, 90])
    linear_extrude(height=4, scale=[0.5, 0.7])
    kale_dimple_profile();
  }
}

module dimple_cut(depth) {
  // Dimple cut is essentially a cone (or spherical cut) on the flat face
  // We use a cylinder with a conical tip (r2 = 0)
  translate([0, 0, ${bladeThickness/2}]) // Start from the face
  rotate([0, 180, 0]) // Point inwards
  cylinder(h=depth + 0.5, r1=depth + 0.5, r2=0, center=false);
}

module cuts() {
`;
    for (let i = 0; i < positions; i++) {
      const valStr = bitting[i]?.toString() || "0";
      const val = parseInt(valStr.replace(/\\D/g, '')) || 0;
      
      const cx = this.cutGeometry.firstPinOffset + i * this.cutGeometry.pinSpacing;
      // Dimple cuts go into the side of the blade.
      // Y is centered on the blade height.
      const cy = bladeHeight / 2;
      const depth = this.cutGeometry.rootDepth0 + (val * this.cutGeometry.cutStep);
      
      scad += `  translate([${cx}, ${cy}, 0]) dimple_cut(${depth});\n`;
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
