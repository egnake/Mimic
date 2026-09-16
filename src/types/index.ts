export type KeyFamily = 
  | "standard-pin-tumbler"
  | "dimple"
  | "cabinet"
  | "automotive"
  | "padlock"
  | "custom";

export interface KeyProfile {
  id: string;
  name: string;
  family: KeyFamily;
  type: string;
  outline: string;
  warding?: string;
  positions: number;
  secondaryPositions?: number;
  bitting: string[];
  secondaryBitting?: string[];
  templateId?: string;
  metadata: Record<string, unknown>;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileTemplate {
  id: string;
  name: string;
  family: KeyFamily;
  type: string;
  outline: string;
  warding?: string;
  positions: number;
}
