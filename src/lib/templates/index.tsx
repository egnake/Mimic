import React from "react";
import { KeyProfile } from "@/types";
import { getAllPlugins, getPlugin } from "../plugins";
import { calculateEdgeCuts as utilsCalcEdge, getBladeLength as utilsGetBladeLength, getTipX as utilsGetTipX } from "../plugins/utils";

export type CutStrategy = 'edge-single' | 'edge-double' | 'dimple' | 'laser-track';

export interface KeyTemplate {
  id: string;
  name: string;
  cutStrategy: CutStrategy;
  drawOutline: (profile: KeyProfile) => React.ReactNode;
  drawCuts?: (profile: KeyProfile) => React.ReactNode;
}

// Generate the templates dynamically from the Plugin Registry
export const templates: KeyTemplate[] = getAllPlugins().map(plugin => ({
  id: plugin.id,
  name: plugin.name,
  cutStrategy: 'edge-single', // In the future, this can also be moved to the plugin
  drawOutline: (profile) => plugin.drawOutline(profile)
}));

// Backward compatibility or helper functions for older files if needed
export function calculateEdgeCuts(profile: KeyProfile, startY: number, inverted: boolean = false): string {
  // If we still need to expose this old signature, we'll try to find the plugin, 
  // else fallback to Kwikset (Standard).
  const plugin = getPlugin(profile.templateId || "kwikset-kw1") || getPlugin("kwikset-kw1")!;
  return utilsCalcEdge(profile, startY, plugin.svgGeometry, inverted);
}

export function getBladeLength(positions: number): number {
  const plugin = getPlugin("kwikset-kw1")!;
  return utilsGetBladeLength(positions, plugin.svgGeometry);
}

export function getTipX(positions: number): number {
  const plugin = getPlugin("kwikset-kw1")!;
  return utilsGetTipX(positions, plugin.svgGeometry);
}
