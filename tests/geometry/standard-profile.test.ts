import { describe, it, expect } from 'vitest';
import { calculateEdgeCuts, getTipX, getBladeLength } from '@/lib/templates/index';
import { KeyProfile } from '@/types';
import key01 from '../fixtures/key-01.json';

describe('Geometry Engine - Standard Profile', () => {
  it('should calculate the correct blade length and tip X for a 5-pin key', () => {
    // 5 pins: FIRST_PIN_OFFSET (60) + 4 * SPACING (40) + SPACING * 1.5 (60) = 280
    expect(getBladeLength(key01.positions)).toBe(280);
    // SHOULDER_X (120) + 280 = 400
    expect(getTipX(key01.positions)).toBe(400);
  });

  it('should generate deterministic SVG paths for bitting [0, 2, 4, 6, 8] without regression', () => {
    // startY = 50, inverted = false
    const path = calculateEdgeCuts(key01 as unknown as KeyProfile, 50, false);
    
    // The path should start at SHOULDER_X (120)
    expect(path).toMatch(/^L 120,50\.0/);
    
    // The path should end at Tip X (400)
    expect(path).toMatch(/L 400,\d+\.\d+ $/);

    // Snapshot testing guarantees that if anyone changes the math, this test will fail!
    expect(path).toMatchSnapshot();
  });
});
