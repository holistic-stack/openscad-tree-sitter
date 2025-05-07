// OpenSCAD indentation and folding test file

// Module definition
module test_module(param1, param2) {
    cube([10, 10, 10]);
    sphere(5);
}

// Function definition
function test_function(x, y) = x * y + 10;

// If statement
if (true) {
    cube([5, 5, 5]);
} else {
    sphere(3);
}

// For loop
for (i = [0:5]) {
    translate([i * 10, 0, 0]) {
        cube([5, 5, 5]);
    }
}

// Module instantiation with block
translate([0, 0, 10]) {
    cube([10, 10, 10]);
}

// Module instantiation with children
module test_children() {
    children();
}

test_children() {
    cube([5, 5, 5]);
}

// Array literals
a = [1, 2, 3, 4, 5];

// List comprehension
b = [for (i = [0:5]) i * i];

// Object literal
c = {
    "key1": "value1",
    "key2": 42,
    "key3": [1, 2, 3]
};

// Nested structures
module complex_example() {
    if (true) {
        for (i = [0:5]) {
            translate([i * 10, 0, 0]) {
                if (i % 2 == 0) {
                    cube([5, 5, 5]);
                } else {
                    sphere(3);
                }
            }
        }
    } else {
        cube([20, 20, 20]);
    }
}

complex_example();
