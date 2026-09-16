import { z } from "zod";
import { KeyFamily } from "@/types";

const KeyFamilySchema = z.enum([
  "standard-pin-tumbler",
  "dimple",
  "cabinet",
  "automotive",
  "padlock",
  "custom"
]);

export const ProfileSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  family: KeyFamilySchema,
  type: z.string().max(50),
  outline: z.string().max(50),
  warding: z.string().max(50).optional(),
  positions: z.number().int().min(1).max(20),
  bitting: z.array(z.number().int().min(0).max(100)),
  templateId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).refine(data => data.bitting.length === data.positions, {
  message: "Bitting array length must match positions count",
  path: ["bitting"]
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export function validateProfile(profile: unknown) {
  return ProfileSchema.parse(profile);
}

export function validateProfileSafe(profile: unknown) {
  return ProfileSchema.safeParse(profile);
}
