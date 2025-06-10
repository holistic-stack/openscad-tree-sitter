// OpenSCAD Indentation and Folding Test File
// This file contains various OpenSCAD constructs to test indentation and folding

// Basic module definition with nested blocks
module complex_module(size = 10, height = 20) {
    // Local variables
    radius = size / 2;
    
    // Nested transformations
    translate([0, 0, 0]) {
        rotate([0, 0, 45]) {
            cube([size, size, height]);
        }
    }
    
    // Conditional structure
    if (size > 5) {
        sphere(radius);
    } else {
        cylinder(h = height, r = radius);
    }
    
    // For loop with nested structure
    for (i = [0:5]) {
        translate([i * 10, 0, 0]) {
            cube(size = 5);
        }
    }
}

// Function definition with complex expression
function calculate_volume(width, depth, height) = 
    let(
        area = width * depth,
        volume = area * height
    )
    volume;

// Intersection for loop
intersection_for(n = [0:5]) {
    rotate([0, 0, n * 60]) {
        translate([5, 0, 0]) {
            sphere(r = 5);
        }
    }
}

// CSG operations
difference() {
    cube([30, 30, 30], center = true);
    
    union() {
        translate([0, 0, 0]) {
            cylinder(h = 40, r = 5, center = true);
        }
        
        translate([0, 0, 0]) {
            rotate([90, 0, 0]) {
                cylinder(h = 40, r = 5, center = true);
            }
        }
    }
}

// Vector expressions
points = [
    [0, 0, 0],
    [10, 0, 0],
    [10, 10, 0],
    [0, 10, 0],
    [5, 5, 10]
];

// Module instantiation with block
translate([0, 0, 0]) {
    cube(10);
    sphere(5);
    cylinder(h = 10, r = 2);
}

// Multi-line comment for folding test
/* This is a multi-line comment
   that should be foldable in editors
   that support code folding based on
   tree-sitter queries.
   
   It contains multiple paragraphs
   to test the folding capabilities.
*/

// Multi-line string
text_value = "This is a multi-line string
that should also be foldable
in editors that support code folding
based on tree-sitter queries.";

// Let expression
result = let(
    a = 10,
    b = 20,
    c = a + b,
    d = c * 2
) d + 5;

// Nested module calls
translate([0, 0, 0])
    rotate([0, 0, 0])
        scale([1, 1, 1])
            cube(10);

// Main showcase function to test everything together
module showcase() {
    // Base
    translate([0, 0, 0]) {
        cube([100, 100, 5], center = true);
    }
    
    // Complex nested structure
    translate([0, 0, 10]) {
        difference() {
            union() {
                for (i = [0:3]) {
                    rotate([0, 0, i * 90]) {
                        translate([20, 0, 0]) {
                            if (i % 2 == 0) {
                                sphere(5);
                            } else {
                                cube(8, center = true);
                            }
                        }
                    }
                }
            }
            
            // Cutout
            cylinder(h = 30, r = 10, center = true);
        }
    }
}

// Call the showcase function
showcase();
