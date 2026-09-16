import { describe, it, expect } from 'vitest';
import { generateScad } from '@/lib/export/scad-generator';
import key01 from '../fixtures/key-01.json';

describe('Geometry Engine - OpenSCAD Generator', () => {
  it('should generate valid OpenSCAD boolean subtractions for a given bitting', () => {
    const scad = generateScad(key01);
    
    // Check for base polygon (warding profile)
    expect(scad).toContain('module kwikset_warding_profile()');
    
    // Check for physical Kwikset spacing metrics
    expect(scad).toContain('translate([6.27'); // FIRST_PIN_OFFSET
    
    // Check if difference (boolean subtraction) is utilized
    expect(scad).toContain('difference() {');
    expect(scad).toContain('v_cut(');
    
    // Golden snapshot to ensure 3D geometry matrix never accidentally drifts
    expect(scad).toMatchSnapshot();
  });
});
