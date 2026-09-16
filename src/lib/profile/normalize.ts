import { KeyProfile, KeyFamily } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function createEmptyProfile(
  family: KeyFamily = "standard-pin-tumbler",
  positions: number = 5
): KeyProfile {
  return {
    id: uuidv4(),
    name: "New Profile",
    family,
    type: "Schlage Classic",
    outline: "5-pin",
    warding: "C",
    positions,
    secondaryPositions: 0,
    bitting: Array(positions).fill("0"),
    secondaryBitting: [],
    templateId: 'standard-edge',
    metadata: {},
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function normalizeBitting(bitting: string[]): string[] {
  // In a string-based bitting array, we might not want to enforce numbers natively 
  // since angles like "L/C/R" are valid. 
  // For now, we return it as is or sanitize.
  return bitting.map(val => val ? val.toString().toUpperCase().trim() : "0");
}
