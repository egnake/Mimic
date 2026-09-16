import { describe, it, expect } from 'vitest';
import { validateProfileSafe } from '@/lib/profile/validation';
import key01 from '../fixtures/key-01.json';

describe('Calibration & Validation Engine', () => {
  it('should successfully validate a well-formed golden profile fixture', () => {
    // We need to inject timestamps and some mock data to pass Zod schema
    const testProfile = {
      ...key01,
      family: "standard-pin-tumbler",
      type: "cylinder",
      outline: "standard",
      metadata: {},
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = validateProfileSafe(testProfile);
    expect(result.success).toBe(true);
  });

  it('should reject a profile where bitting array length does not match positions', () => {
    const testProfile = {
      ...key01,
      family: "standard-pin-tumbler",
      type: "cylinder",
      outline: "standard",
      metadata: {},
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      positions: 5,
      bitting: [0, 2, 4] // Invalid! Only 3 elements.
    };
    
    const result = validateProfileSafe(testProfile);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Bitting array length must match positions count");
    }
  });
});
