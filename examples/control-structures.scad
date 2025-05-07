// OpenSCAD Control Structures Example
// This file demonstrates various control structures in OpenSCAD

// Basic for loop with if-else inside
for (i = [0:5]) {
    translate([i * 10, 0, 0]) {
        if (i % 2 == 0) {
            cube(5);
        } else {
            sphere(3);
        }
    }
}

// Conditional operator
result = i < 3 ? "small" : "large";

// Nested for loops
for (x = [0:2]) {
    for (y = [0:2]) {
        translate([x * 10, y * 10, 0]) {
            if (x == y) {
                cylinder(h=5, r=2);
            } else if (x > y) {
                cube(3);
            } else {
                sphere(2);
            }
        }
    }
}

// For loop with step
for (i = [0:0.5:3]) {
    translate([0, i * 10, 0]) {
        scale([1, 1, i]) {
            cube(3, center=true);
        }
    }
}

// Complex conditional expressions
a = 5;
b = 10;
c = a < b ? (a + b) : (a - b);
d = a < 0 ? "negative" : a == 0 ? "zero" : "positive";

// If-else chain
if (a < 0) {
    echo("negative");
} else if (a == 0) {
    echo("zero");
} else if (a > 0 && a < 5) {
    echo("small positive");
} else if (a >= 5 && a < 10) {
    echo("medium positive");
} else {
    echo("large positive");
}

// For loop with list comprehension
points = [for (i = [0:5]) [i, i*i, 0]];
cubes = [for (p = points) if (p.x % 2 == 0) p];

// Using for loop with conditional to create alternating pattern
for (i = [0:10]) {
    translate([i * 5, 20, 0]) {
        rotate([0, 0, i * 15]) {
            color(i % 2 == 0 ? "red" : "blue") {
                i % 3 == 0 ? cube(3) : i % 3 == 1 ? sphere(2) : cylinder(h=4, r=1.5);
            }
        }
    }
}
