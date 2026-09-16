import React from "react";
import { KeyProfile } from "@/types";

export interface ICutGeometry {
  pinSpacing: number;     // Distance between pins in mm (SCAD)
  firstPinOffset: number; // Offset from shoulder to first pin in mm (SCAD)
  rootDepth0: number;     // Depth of a "0" cut from spine in mm (SCAD)
  cutStep: number;        // Step distance per depth in mm (SCAD)
  macs?: number;          // Maximum Adjacent Cut Specification
}

export interface ISvgGeometry {
  spacing: number;
  shoulderX: number;
  firstPinOffset: number;
  flatWidth: number;
  slope: number;
  depthSpan: number;
}

export interface IKeyProfilePlugin {
  id: string;
  name: string;
  manufacturer: string;
  
  defaultPositions: number;
  
  // Physical Metrics for OpenSCAD Export
  cutGeometry: ICutGeometry;
  
  // Logical Metrics for 2D View
  svgGeometry: ISvgGeometry;
  
  // 2D SVG / React Rendering
  drawOutline(profile: KeyProfile): React.ReactNode;
  
  // 3D SCAD Rendering
  generateSCAD(profile: KeyProfile): string;
}
