// all-features-openscad.scad
// A comprehensive demonstration of OpenSCAD features with deep nested variations
// Created for the openscad-parser project

// =============== PART 1: BASIC SYNTAX AND VARIABLES ===============

// Basic variable assignments
x = 10;
y = 20;
z = 30;

// Different data types
number_int = 42;
number_float = 3.14159;
string_value = "Hello OpenSCAD";
boolean_true = true;
boolean_false = false;
undefined_value = undef;
vector_2d = [10, 20];
vector_3d = [10, 20, 30];
range_value = [0:5];
range_with_step = [0:0.5:10];
nested_vector = [[1, 2], [3, 4], [5, 6]];

// Arithmetic operations
sum = 10 + 5;
difference = 10 - 5;
product = 10 * 5;
quotient = 10 / 5;
modulo = 10 % 3;
exponent = 10 ^ 2;

// Comparison operations
equal = (10 == 10);
not_equal = (10 != 5);
less_than = (5 < 10);
less_than_equal = (5 <= 5);
greater_than = (10 > 5);
greater_than_equal = (10 >= 10);

// Logical operations
logical_and = true && true;
logical_or = true || false;
logical_not = !false;

// Conditional (ternary) operator
conditional = (10 > 5) ? "Greater" : "Less or Equal";

// =============== PART 2: SPECIAL VARIABLES ===============

// Resolution-related special variables
$fa = 5;    // Minimum angle (in degrees) for a fragment
$fs = 0.5;  // Minimum size of a fragment
$fn = 36;   // Number of fragments

// Animation-related special variable
$t = 0.5;   // Animation step (0.0 to 1.0)

// Viewport-related special variables
// $vpr = [0, 0, 0];    // Viewport rotation angles in degrees
// $vpt = [0, 0, 0];    // Viewport translation
// $vpd = 500;          // Viewport camera distance
// $vpf = 22.5;         // Viewport camera field of view

// Preview mode check (commented out as $preview might not be supported in all versions)
// preview_check = $preview ? "Preview mode" : "Render mode";

// Custom special variables
$my_special_var = 42;

// =============== PART 3: MODULES AND FUNCTIONS ===============

// Basic module definition
module basic_cube(size) {
    cube(size, center = true);
}

// Module with default parameters
module complex_shape(size = 10, height = 20, center = false, detail = 36) {
    $fn = detail;
    translate([0, 0, center ? 0 : height/2]) {
        cylinder(h = height, r = size/2, center = center);
    }
}

// Module with children
module frame(width, height, thickness) {
    difference() {
        square([width, height], center = true);
        square([width - thickness*2, height - thickness*2], center = true);
    }
    children(); // Pass through any children
}

// Recursive module
module tree(size, levels) {
    if (levels > 0) {
        cylinder(h = size, r1 = size/10, r2 = size/20);
        translate([0, 0, size]) {
            for (angle = [0:45:359]) {
                rotate([20, 0, angle]) {
                    tree(size * 0.6, levels - 1);
                }
            }
        }
    }
}

// Basic function definition
function square_area(side) = side * side;

// Function with multiple parameters and default values
function calculate_volume(width = 10, depth = 10, height = 10) = width * depth * height;

// Recursive function
function factorial(n) = (n <= 0) ? 1 : n * factorial(n - 1);

// Function with vector operations
function normalize(v) = v / norm(v);

// Function (alternative to function literal)
function scale_function(x) = x * 2;

// =============== PART 4: 2D SHAPES ===============

// Basic 2D shapes
module basic_2d_shapes() {
    // Circle
    translate([-30, 30, 0]) circle(r = 10);

    // Square
    translate([0, 30, 0]) square(20, center = true);

    // Polygon with points
    translate([30, 30, 0])
        polygon(points = [[0,0], [10,0], [5,10]]);

    // Polygon with points and paths
    translate([-30, 0, 0])
        polygon(
            points = [[0,0], [10,0], [10,10], [0,10], [3,5]],
            paths = [[0,1,2,3], [4]]
        );

    // Text
    translate([0, 0, 0])
        text("OpenSCAD", size = 5, halign = "center", valign = "center");

    // Import (commented out as it requires a file)
    // translate([30, 0, 0]) import("example.dxf");
}

// =============== PART 5: 3D SHAPES ===============

// Basic 3D shapes
module basic_3d_shapes() {
    // Sphere
    translate([-30, 30, 0]) sphere(r = 10);

    // Cube
    translate([0, 30, 0]) cube(20, center = true);

    // Cylinder
    translate([30, 30, 0]) cylinder(h = 20, r = 10, center = true);

    // Cylinder with different top and bottom radii
    translate([-30, 0, 0]) cylinder(h = 20, r1 = 10, r2 = 5, center = true);

    // Polyhedron
    translate([0, 0, 0])
        polyhedron(
            points = [
                [10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], // base
                [0, 0, 10] // apex
            ],
            faces = [
                [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], // triangular faces
                [0, 3, 2, 1] // base
            ],
            convexity = 1
        );

    // Import 3D (commented out as it requires a file)
    // translate([30, 0, 0]) import("example.stl");
}

// =============== PART 6: TRANSFORMATIONS ===============

// Basic transformations
module basic_transformations() {
    // Translate
    translate([20, 0, 0]) cube(5, center = true);

    // Rotate
    translate([0, 20, 0]) rotate([0, 0, 45]) cube(5, center = true);

    // Scale
    translate([-20, 0, 0]) scale([1, 2, 0.5]) cube(5, center = true);

    // Mirror
    translate([0, -20, 0]) mirror([1, 0, 0]) translate([2.5, 0, 0]) cube(5, center = true);

    // Resize
    translate([-20, -20, 0]) resize([10, 5, 2]) cube(5, center = true);

    // Color
    translate([20, -20, 0]) color("red", 0.8) cube(5, center = true);

    // Multmatrix
    translate([20, 20, 0]) multmatrix([
        [1, 0, 0.5, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]) cube(5, center = true);
}

// =============== PART 7: BOOLEAN OPERATIONS ===============

// Basic boolean operations
module basic_boolean_operations() {
    // Union
    translate([-20, 20, 0])
        union() {
            cube(5, center = true);
            translate([3, 3, 0]) sphere(2);
        }

    // Difference
    translate([0, 20, 0])
        difference() {
            cube(5, center = true);
            sphere(3);
        }

    // Intersection
    translate([20, 20, 0])
        intersection() {
            cube(5, center = true);
            sphere(3);
        }

    // Minkowski
    translate([-20, 0, 0])
        minkowski() {
            cube(3, center = true);
            sphere(1);
        }

    // Hull
    translate([0, 0, 0])
        hull() {
            translate([-2, -2, 0]) cylinder(r = 1, h = 5, center = true);
            translate([2, 2, 0]) cylinder(r = 1, h = 5, center = true);
        }
}

// =============== PART 8: 2D TO 3D OPERATIONS ===============

// 2D to 3D operations
module extrusion_operations() {
    // Linear extrude
    translate([-20, 0, 0])
        linear_extrude(height = 10, twist = 90, scale = 0.5, center = true)
            square(5, center = true);

    // Rotate extrude
    translate([0, -20, 0])
        rotate_extrude($fn = 100)
            translate([5, 0, 0])
                circle(2);

    // Projection
    translate([20, 0, 0])
        projection(cut = true)
            translate([0, 0, 5])
                sphere(10);

    // Surface (commented out as it requires a file)
    // translate([0, 20, 0]) surface(file = "example.dat", center = true);
}

// =============== PART 9: CONTROL FLOW ===============

// If statement
module if_example(condition) {
    if (condition) {
        sphere(5);
    } else {
        cube(8, center = true);
    }
}

// For loop
module for_example() {
    // Basic for loop with range
    for (i = [0:3]) {
        translate([i*10, 0, 0])
            cube(5, center = true);
    }

    // For loop with step
    for (i = [0:2.5:10]) {
        translate([0, i, 0])
            sphere(1);
    }

    // For loop with list
    for (i = [5, 7, 11, 13]) {
        translate([i, i, 0])
            cylinder(r = 1, h = i);
    }

    // Nested for loops
    for (x = [-10:10:10]) {
        for (y = [-10:10:10]) {
            translate([x, y, 0])
                cylinder(r = 2, h = 5, center = true);
        }
    }
}

// Intersection for loop
module intersection_for_example() {
    intersection_for(n = [1:6]) {
        rotate([0, 0, n*60])
            translate([5, 0, 0])
                sphere(5);
    }
}

// Variable assignment in module (alternative to let statement)
module let_example() {
    r = 10;
    h = 20;
    cylinder(r = r, h = h);
}

// =============== PART 10: LIST COMPREHENSIONS ===============

// Basic list comprehension
function range(n) = [for (i = [0:n-1]) i];

// Conditional list comprehension
function even_numbers(n) = [for (i = [0:n-1]) if (i % 2 == 0) i];

// Complex list comprehension
function complex_list() = [
    for (i = [0:5], j = [0:5])
        if (i != j)
            [i, j, i+j]
];

// List comprehension with calculated values
function points_on_circle(n, r) = [
    for (i = [0:n-1])
        [r * cos(i * 360 / n), r * sin(i * 360 / n)]
];

// List comprehension with nested loops (alternative to 'each' keyword)
function flatten(list) = [for (i = [0:len(list)-1], j = [0:len(list[i])-1]) list[i][j]];

// =============== PART 11: MODIFIERS ===============

// Root modifier (!)
module root_modifier_example() {
    !cube(5); // Only this object will be rendered
}

// Debug modifier (#)
module debug_modifier_example() {
    #sphere(5); // Highlighted in transparent red
}

// Background modifier (%)
module background_modifier_example() {
    %cylinder(r = 5, h = 10); // Transparent
}

// Disable modifier (*)
module disable_modifier_example() {
    *cube(5); // Not rendered
}

// =============== PART 12: ADVANCED FEATURES ===============

// Echo statements
echo("Basic echo statement");
echo("Multiple values:", 42, true, [1, 2, 3]);
echo(str("Concatenated ", "string ", 123));

// Assert statement
assert(true, "This assertion will not fail");
// assert(false, "This assertion would fail");

// Children selection
module select_children() {
    children(0); // First child
    translate([10, 0, 0]) children(1); // Second child
    translate([20, 0, 0]) children($children-1); // Last child
}

// Render
module render_example() {
    render(convexity = 5)
        difference() {
            sphere(5);
            cylinder(r = 2, h = 10, center = true);
        }
}

// =============== PART 13: COMPLEX NESTED EXAMPLES ===============

// Complex nested example 1: Gear
module gear(num_teeth = 20, thickness = 5, hole_diameter = 5) {
    difference() {
        union() {
            cylinder(r = num_teeth * 0.5, h = thickness, center = true);

            for (i = [0:num_teeth-1]) {
                rotate([0, 0, i * 360 / num_teeth])
                    translate([num_teeth * 0.5, 0, 0])
                        cube([2, 2, thickness], center = true);
            }
        }

        // Center hole
        cylinder(r = hole_diameter / 2, h = thickness + 1, center = true);
    }
}

// Complex nested example 2: Fractal cube
module fractal_cube(size, depth) {
    if (depth > 0) {
        // Draw current cube
        color([depth/5, 0.2, 1 - depth/5, 0.5 + depth/10])
            cube(size, center = true);

        // Recursive smaller cubes
        new_size = size * 0.5;
        for (x = [-1, 1], y = [-1, 1], z = [-1, 1]) {
            translate([x * size/2, y * size/2, z * size/2])
                fractal_cube(new_size, depth - 1);
        }
    }
}

// Complex nested example 3: Parametric vase
module parametric_vase(height = 50, base_radius = 10, top_radius = 15,
                       thickness = 2, twist = 360, $fn = 100) {
    difference() {
        // Outer shape
        linear_extrude(height = height, twist = twist, slices = height, scale = top_radius/base_radius)
            circle(r = base_radius);

        // Inner shape (hollow)
        translate([0, 0, -1])
            linear_extrude(height = height + 2, twist = twist, slices = height,
                          scale = (top_radius - thickness)/(base_radius - thickness))
                circle(r = base_radius - thickness);
    }
}

// Complex nested example 4: Spiral staircase
module spiral_staircase(steps = 20, inner_radius = 10, step_width = 20,
                        step_height = 5, step_depth = 10, angle = 15) {
    for (i = [0:steps-1]) {
        rotate([0, 0, i * angle])
            translate([inner_radius + step_width/2, 0, i * step_height]) {
                difference() {
                    cube([step_width, step_depth, step_height], center = true);
                    translate([-step_width/2, 0, 0])
                        cylinder(r = inner_radius, h = step_height + 1, center = true);
                }
            }
    }

    // Center column
    cylinder(r = inner_radius/2, h = steps * step_height);
}

// =============== PART 14: DEMONSTRATION ===============

// Uncomment sections to view different examples

// Basic shapes
// translate([-50, 0, 0]) basic_2d_shapes();
// translate([50, 0, 0]) basic_3d_shapes();

// Transformations and boolean operations
// translate([-50, -50, 0]) basic_transformations();
// translate([50, -50, 0]) basic_boolean_operations();

// Extrusions
// translate([0, 50, 0]) extrusion_operations();

// Control flow examples
// translate([-50, 0, 0]) if_example(true);
// translate([0, 0, 0]) for_example();
// translate([50, 0, 0]) intersection_for_example();

// Complex examples
// translate([-50, -50, 0]) gear();
// translate([0, -50, 0]) fractal_cube(20, 3);
// translate([50, -50, 0]) parametric_vase();
// translate([0, 50, 0]) spiral_staircase();

// Main showcase - a complex scene with multiple features
module showcase() {
    // Base plate
    color("SlateGray")
        translate([0, 0, -5])
            cube([150, 150, 10], center = true);

    // Fractal tree at the center
    color("ForestGreen")
        translate([0, 0, 0])
            tree(20, 3);

    // Gears in one corner
    translate([-50, -50, 10]) {
        color("Gold") gear(15, 5, 5);
        translate([0, 0, 7])
            color("Silver")
                rotate([0, 0, 12])
                    gear(10, 5, 5);
    }

    // Spiral staircase in another corner
    translate([50, -50, 0])
        color("Crimson")
            spiral_staircase(15, 5, 10, 2, 5, 24);

    // Parametric vase in another corner
    translate([-50, 50, 0])
        color([0.2, 0.5, 0.8, 0.7])
            parametric_vase(40, 8, 12, 1, 720);

    // Fractal cube in the last corner
    translate([50, 50, 10])
        fractal_cube(15, 2);

    // Text floating above
    translate([0, 0, 50])
        rotate([90, 0, 0])
            color("Black")
                linear_extrude(height = 1)
                    text("OpenSCAD", size = 10, halign = "center", valign = "center");
}

// Uncomment to show the showcase
showcase();

// Echo some calculated values to demonstrate functions
echo("Area of a 5x5 square:", square_area(5));
echo("Volume of a 3x4x5 box:", calculate_volume(3, 4, 5));
echo("Factorial of 5:", factorial(5));
echo("Normalized vector [3,4,5]:", normalize([3, 4, 5]));
echo("List of first 5 numbers:", range(5));
echo("Even numbers up to 10:", even_numbers(10));
echo("Points on a circle (r=10, n=6):", points_on_circle(6, 10));

// Animation example - rotating showcase
// Uncomment to enable animation
// rotate([0, 0, $t * 360]) showcase();
