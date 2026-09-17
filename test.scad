module kwikset_warding_profile() {
  polygon(points=[
    [0, 0], [2, 0], 
    [2, 3], [1.5, 3.5], [2, 4],
    [2, 8.6], 
    [0, 8.6], 
    [0, 6.5], [0.5, 6.0], [0, 5.5],
    [0, 4.5], [0.8, 4.0], [0, 3.5]
  ]);
}

module key_blank() {
  union() {
    // Realistic Bow (Head of the key)
    translate([-12, 1, 3.3])
    rotate([90, 0, 0])
    difference() {
      // Main rounded bow shape
      hull() {
        translate([7, 0, 0]) cylinder(r=5.3, h=2, center=true);
        translate([-6, 0, 0]) cylinder(r=12.5, h=2, center=true);
      }
      // Keyring hole
      translate([-12, 0, 0])
      cylinder(r=3.5, h=4, center=true);
    }
    
    // Neck (Connects bow to blade)
    translate([-5, 0, -1])
    cube([5, 2, 8.6]);
    
    // Shoulder Stop
    translate([-2, -0.5, -1.5])
    cube([2, 3, 9.6]);
    
    // Blade rendering
    translate([0, 0, -1])
    rotate([90, 0, 90])
    linear_extrude(height=30)
    kwikset_warding_profile();
  }
}

key_blank();
