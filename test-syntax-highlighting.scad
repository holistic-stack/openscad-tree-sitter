// Test OpenSCAD syntax highlighting features

// Variables
width = 20;
height = 15;
radius = 8;

// Built-in modules
cube([width, height, 10]);
sphere(r = radius);
cylinder(h = height, r = 5);

// Transformations
translate([30, 0, 0])
rotate([0, 90, 0])
  cube(10);

// Control structures
for (i = [0:2:8]) {
  translate([i * 12, 20, 0])
    sphere(3);
}

// Conditional
if (width > 15) {
  echo("Width is greater than 15");
}

// Custom module
module my_part(size = 10) {
  difference() {
    cube(size, center = true);
    cylinder(h = size + 2, r = size/4, center = true);
  }
}

// Boolean operations
union() {
  cube(15);
  translate([10, 0, 0])
    sphere(8);
}

difference() {
  cylinder(h = 20, r = 10);
  translate([0, 0, -1])
    cylinder(h = 22, r = 6);
}

// Special variables and functions
echo("Preview time: ", $t);
echo("Fragment count: ", $fn);
