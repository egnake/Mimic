import { KeyProfile } from "@/types";
import { getPlugin } from "../plugins";

export function generateScad(profile: KeyProfile): string {
  // If the profile has a templateId, try to find the matching plugin.
  // Otherwise, default to "kwikset-kw1" (Standard)
  const pluginId = profile.templateId || "kwikset-kw1";
  const plugin = getPlugin(pluginId) || getPlugin("kwikset-kw1");
  
  if (!plugin) {
    throw new Error(`Plugin not found for profile template: ${pluginId}`);
  }

  // Delegate the OpenSCAD generation completely to the plugin.
  return plugin.generateSCAD(profile);
}
