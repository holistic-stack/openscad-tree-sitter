// OpenSCAD Sample File
// This file demonstrates various OpenSCAD language features

// Include and use statements
include <MCAD/boxes.scad>;
use <MCAD/units.scad>;

// Variables and constants
$fn = 50;  // Special variable for facets
radius = 10;
height = 20;
wall_thickness = 2;
PI = 3.14159;

// Function definition
function cylinder_volume(r, h) = PI * r * r * h;
function calculate_offset(base, ratio=0.5) = base * ratio;

// Module definition
module hollow_cylinder(r, h, wall) {
    difference() {
        cylinder(r=r, h=h);
        translate([0, 0, -1])
            cylinder(r=r-wall, h=h+2);
    }
}

// Control structures and expressions
detail_level = 5;
use_details = true;

if (use_details && detail_level > 3) {
    echo("High detail level selected");
} else {
    echo("Standard detail level");
}

// Module instantiation with modifiers
translate([0, 0, 0]) {
    // Basic 3D shapes
    union() {
        cube([5, 5, 5]);
        
        // Transformation
        translate([10, 0, 0])
            sphere(r=3);
            
        // Boolean operations
        translate([20, 0, 0])
            difference() {
                cube([5, 5, 5], center=true);
                sphere(r=3);
            }
    }
    
    // Module instantiation with children
    translate([0, -15, 0])
        hollow_cylinder(r=radius/2, h=height/2, wall=wall_thickness);
        
    // Debug and other modifiers
    translate([15, -15, 0]) {
        #cylinder(r=2, h=10);  // Highlight for debugging
        %sphere(r=5);         // Background
    }
}

// For loops and conditionals
step = 5;
max_steps = 5;

for (i = [0 : step : max_steps * step]) {
    translate([i, 20, 0])
        cylinder(r=2, h=i);
        
    // Conditional operator
    color(i < max_steps * step / 2 ? "red" : "blue")
        translate([i, 25, 0])
            cube([3, 3, 3]);
}

// Let expression
translate([0, 30, 0])
    let(
        width = 10,
        depth = 5,
        height = 15
    ) {
        cube([width, depth, height]);
    }

// Vector operations
points = [[0,0], [10,0], [10,10], [0,10]];
indices = [0,1,2,3];

translate([20, 30, 0])
    for (i = indices) {
        translate([points[i][0], points[i][1], 0])
            cylinder(r=1, h=3);
    }

// Range expressions
range1 = [0:5];
range2 = [0:0.5:3];

echo("Range 1:", range1);
echo("Range 2:", range2);

// Nested modules with parameters
module pattern(count=3, spacing=10) {
    for (i = [0:count-1]) {
        translate([i * spacing, 0, 0])
            children();
    }
}

// Using the pattern module with children
translate([0, 40, 0])
    pattern(count=4, spacing=7) {
        cylinder(r=2, h=5);
    }

/* 
   Multi-line comment demonstrating complex structures
*/

// End of sample file 