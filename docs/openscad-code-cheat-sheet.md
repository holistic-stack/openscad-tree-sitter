# OpenSCAD Syntax Cheat Sheet

This document provides a quick reference to common OpenSCAD syntax, declarations, statements, functions, and patterns.

## Table of Contents

- [Comments](#comments)
- [Variables](#variables)
- [Constants](#constants)
- [Data Types](#data-types)
- [Operators](#operators)
  - [Mathematical](#mathematical-operators)
  - [Logical](#logical-operators)
  - [Comparison](#comparison-operators)
  - [Ternary Conditional](#ternary-conditional-operator)
- [Modules](#modules)
- [Functions](#functions)
- [Flow Control](#flow-control)
  - [`if`/`else`](#ifelse)
  - [`for` loop](#for-loop)
  - [`intersection_for` loop](#intersection_for-loop)
  - [`let` statement](#let-statement)
  - [`assign` statement](#assign-statement)
- [2D Primitives](#2d-primitives)
- [3D Primitives](#3d-primitives)
- [Transformations](#transformations)
- [Boolean Operations (CSG)](#boolean-operations-csg)
- [Special Variables](#special-variables)
- [Modifier Characters](#modifier-characters)
- [Other Language Features](#other-language-features)
- [Lists (Vectors)](#lists-vectors)
- [List Comprehensions](#list-comprehensions)
- [Built-in Functions](#built-in-functions)
  - [Mathematical Functions](#mathematical-functions)
  - [List/Vector Functions](#listvector-functions)
  - [String Functions](#string-functions)
  - [Type Checking Functions](#type-checking-functions)
  - [Other Utility Functions](#other-utility-functions)

---

## Comments

```openscad
// Single-line comment
single_line = 1; // This comment explains the variable
/*
  This is a
  multi-line comment.
*/
multi_line = 2;
```

## Variables

Variables hold values that can be used later in the script. They are assigned using the `=` operator.

```openscad
width = 10;
message = "Hello";
angle = 45.5;
enabled = true;
point = [5, 10, 0];
range_of_values = [0:1:10]; // Range [0, 1, 2, ..., 10]

cube(width);
echo(message);
```

**Scope:**
- Variables have lexical scope, generally defined within the block (`{ ... }`) they are declared in (e.g., within a module or loop).
- **Important:** OpenSCAD evaluates variables differently than many procedural languages. A variable's value is fixed at the point it's defined *based on the state of the script at that point*. Reassigning a variable later in the *same scope* does **not** change its value earlier in that scope. This is a functional programming concept.

```openscad
a = 10;
echo("Initial a:", a); // Outputs: Initial a: 20 (!!) - Because 'a = 20;' below defines the final value in this scope.

a = 20;
echo("Final a:", a); // Outputs: Final a: 20

module test_scope() {
  b = 5;
  echo("Inside module b:", b); // Outputs: Inside module b: 5
}
test_scope();
// echo(b); // Error: b is not defined outside the module scope.
```

**Edge Case:** Using a variable before its 'final' assignment in the same scope might yield unexpected results due to the evaluation model.

## Constants

OpenSCAD doesn't have a dedicated `const` keyword like some languages. Variables are effectively constant within their scope once evaluated.

The closest concept is defining variables at the top level that are intended not to be changed.

```openscad
// Define 'constants' at the top
PI_APPROX = 3.14159;
DEFAULT_HEIGHT = 50;

function circle_area(radius) = PI_APPROX * radius * radius;
cylinder(h = DEFAULT_HEIGHT, r=10);
```

**Special Constants:**
- `undef`: Represents an undefined value. Useful for optional parameters or checking if a value exists.
- `$fa`, `$fs`, `$fn`: Special variables controlling rendering detail (facet angle, size, number). See [Special Variables](#special-variables).

## Data Types

OpenSCAD supports several basic data types:

- **Number:** Integers (`10`) or floating-point (`3.14`). Can be expressed in scientific notation (`1.5e3`).
- **Boolean:** `true` or `false`.
- **String:** Sequence of characters enclosed in double quotes (`"Hello, World!"`). Supports C-style escape sequences (`\n`, `\t`, `\\`, `\"`).
- **Vector (List):** Ordered collection of values enclosed in square brackets (`[1, 2, 3]`, `["a", true, 5.5]`). Elements can be of mixed types. Accessed via zero-based index (`my_vector[0]`).
- **Range:** A special type of vector defined using colons (`start:step:end` or `start:end`). `step` defaults to 1 if omitted. Ranges are inclusive.
  ```openscad
  numeric_range = [0:2:10]; // [0, 2, 4, 6, 8, 10]
  simple_range = [1:5]; // [1, 2, 3, 4, 5]
  echo(numeric_range[1]); // Outputs: 2
  ```
- **`undef`:** Represents the undefined value.

```openscad
my_num = 123.45;
is_active = false;
my_string = "Test string with \"quotes\" and newline\n";
my_vector = [my_num, is_active, my_string, [10, 20]];
my_range = [1:3]; // Equivalent to [1, 2, 3]
optional_value = undef;

echo("Type check:", is_num(my_num)); // true
echo("Type check:", is_bool(is_active)); // true
echo("Type check:", is_string(my_string)); // true
echo("Type check:", is_list(my_vector)); // true
echo("Type check:", is_list(my_range)); // true (Ranges are lists)
echo("Type check:", is_undef(optional_value)); // true
```

## Operators

### Mathematical Operators

Operators perform calculations and comparisons.

```openscad
a = 10; b = 3;
sum = a + b;      // 13
diff = a - b;     // 7
prod = a * b;     // 30
div = a / b;      // 3.333...
mod = a % b;      // 1 (Modulo)
power = pow(a, 2); // 100 (use pow() function for exponentiation)
neg = -a;         // -10

// Vector operations are often element-wise:
vec1 = [1, 2, 3];
vec2 = [4, 5, 6];
vec_sum = vec1 + vec2; // [5, 7, 9]
vec_scaled = vec1 * 2; // [2, 4, 6]
```

*   **Note:** `^` for exponentiation is deprecated; use `pow()`.
*   **Vector Math:** Basic arithmetic operators (`+`, `-`, `*`, `/`, `%`) work element-wise on vectors of the same length. Scalar multiplication/division applies to each element.

### Logical Operators

Combine boolean values.

```openscad
x = true; y = false;
and_op = x && y;  // false (logical AND)
or_op = x || y;   // true (logical OR)
not_op = !x;      // false (logical NOT)
```

### Comparison Operators

Compare values, resulting in `true` or `false`.

```openscad
n = 5; m = 10;
eq = (n == 5);    // true
neq = (n != m);   // true
lt = (n < m);     // true
lte = (n <= 5);   // true
gt = (m > n);     // true
gte = (m >= 10);  // true

// Comparing vectors (element-wise for == and !=, generally not useful for <, >, etc.)
vec_eq = ([1, 2] == [1, 2]); // true
vec_neq = ([1, 2] != [1, 3]); // true
```

*   **Floating Point:** Be cautious comparing floats for exact equality due to precision issues. Use a tolerance: `abs(a - b) < 0.0001`.

### Ternary Conditional Operator

A shorthand for `if`/`else`, usable within expressions.

```openscad
condition = true;
result = condition ? "Yes" : "No"; // result is "Yes"
```

## Modules

Modules are reusable blocks of code that generate geometry or perform actions. They are defined using the `module` keyword and called like functions.

```openscad
// Definition
module rounded_cube(size, radius) {
  hull() {
    for (x = [0,1], y = [0,1], z = [0,1]) {
      translate([size/2 * (2*x-1), size/2 * (2*y-1), size/2 * (2*z-1)])
        sphere(r=radius);
    }
  }
}

// Usage
rounded_cube(size=10, radius=1);
translate([15, 0, 0]) rounded_cube(8, 0.5);
```

*   **Parameters:** Can have default values (`module box(size=10) { ... }`). Parameters are passed by name or position.
*   **`children()`:** A special statement within a module that instantiates child elements passed to the module call. This allows creating transformative modules (like `translate`, `rotate`, `scale`).
    ```openscad
    module place_at(pos) {
      translate(pos) children();
    }
    place_at([10, 5, 0]) cube(5); // Cube is a child of place_at
    ```
*   **`children(index)`:** Access specific child elements passed to a module by their 0-based index.
*   **Scope:** Variables defined inside a module are local to that module.

## Functions

Functions are defined using the `function` keyword. They take parameters and **must return a single value** (Number, Boolean, String, Vector, Range, or `undef`). They cannot directly generate geometry or have side effects like modules.

```openscad
// Simple function
function double(x) = x * 2;
my_val = double(5); // my_val is 10

// Recursive function (Factorial)
function factorial(n) = n <= 1 ? 1 : n * factorial(n - 1);
echo(factorial(4)); // Outputs: ECHO: 24

// Function returning a vector
function point_on_circle(angle, radius=1) = [radius * cos(angle), radius * sin(angle)];
p1 = point_on_circle(45);
echo(p1); // Outputs: ECHO: [0.707107, 0.707107]
```

*   **Purity:** Functions should ideally be pure: their output depends only on their inputs and globally defined constants/functions. They cannot use `assign` or modify external state. They *can* read global variables.
*   **Return Value:** Must return exactly one value (Number, Boolean, String, List, or `undef`).
*   **Usage:** Often used for calculations, creating data structures (vectors), or encapsulating complex expressions.

## Flow Control

Control the execution path and repetition in scripts.

### `if`/`else`

Conditionally executes one block of code or another based on a boolean expression. `else` is optional.

```openscad
score = 75;
if (score > 90) {
  echo("A");
} else if (score > 80) {
  echo("B");
} else {
  echo("C or lower");
}

// Can be nested
if (score > 90) { echo("A"); } else if (score > 80) { echo("B"); } else { echo("C or lower"); }

// `if` can also be used directly with geometry - it includes the geometry if true
include_cube = true;
if (include_cube) {
  cube(10);
}
```

### `for` loop

Iterates over a vector or range, instantiating its child elements for each item in the sequence. The loop variable takes on each value from the sequence.

```openscad
// Iterate over a range
for (i = [0:5:20]) {
  translate([i, 0, 0]) sphere(r=2);
}

// Iterate over a list
colors = ["red", "green", "blue"];
for (i = [0:len(colors)-1]) {
  color([i/len(colors), 0, 1 - i/len(colors)])
    translate([i * 12, 0, 0]) sphere(r=5);
}

// Nested loops
for (x = [0:10:20], y = [0:5:10]) {
  translate([x, y, 0]) sphere(1);
}
```

### `intersection_for` loop

Similar to `for`, but creates the intersection of all generated child elements.

```openscad
// Example: Find intersection of overlapping spheres
intersection_for(i = [0:2]) {
  translate([i * 10, 0, 0]) sphere(r=8);
}
```

### `let` statement

Defines temporary, locally scoped variables within a block (`{ ... }`) or expression `let(...) ...`.

Useful for breaking down complex calculations without polluting the outer scope.

```openscad
let(angle = 45, radius = 10) {
  translate([radius * cos(angle), radius * sin(angle), 0]) sphere(r=2);
}

// Variable 'radius' is local to the let block
// echo(radius); // Error: radius is not defined here

// Block form
{
  let (temp_height = 5);
  cylinder(h=temp_height, r=2);
} // temp_height no longer exists here
```

### `assign` statement

Allows modification of variables in an outer scope (use with caution, can make code harder to follow). Often used within loops to accumulate values, but list comprehensions or recursive functions are often cleaner alternatives.

```openscad
// Example (generally discouraged - prefer functional approaches)
total_sum = 0;
for (i = [1:5]) {
  assign(total_sum = total_sum + i); // Modifies total_sum in the outer scope
}
echo(total_sum); // Outputs: ECHO: 15
```

---

## 2D Primitives

Create basic 2D shapes. These are often used as the base for `linear_extrude` or `rotate_extrude`.

```openscad
square(10); // Square with side 10, corner at [0,0]
square([15, 5], center=true); // Rectangle 15x5 centered at origin

circle(r=5); // Circle with radius 5
circle(d=12); // Circle with diameter 12
// Using $fn for resolution:
circle(r=8, $fn=6); // Hexagon (6 sides)
circle(r=8, $fn=100); // Smooth circle (100 facets)

polygon([[0,0], [10,5], [5,15]]); // Triangle defined by points
polygon(points=[[0,0],[10,0],[10,10],[0,10]], paths=[[1],[2],[3],[0]]); // Square with specific path order
// Polygon with a hole:
polygon(points=[[0,0],[10,0],[10,10],[0,10], [2,2],[8,2],[8,8],[2,8]],
        paths=[[0,1,2,3], [4,5,6,7]]); // Outer path, then inner (hole) path

import("my_shape.dxf", layer="outline"); // Import 2D shape from DXF file

text("Hi", size=10, font="Liberation Sans"); // Create text geometry
```

*   **`center`:** If `true`, centers the shape at the origin `[0,0]`; otherwise, a corner is usually at `[0,0]`.
*   **Polygon:**
    *   Points define the vertices.
    *   `paths` (optional) defines the order to connect points and allows defining holes. If omitted, points are connected in order.
    *   Points should be defined consistently (e.g., clockwise) for correct winding order, especially for holes.
*   **Resolution:** `$fn`, `$fa`, `$fs` control the smoothness of curves in `circle`. See [Special Variables](#special-variables).

## 3D Primitives

Create basic 3D geometric shapes.

```openscad
sphere(r=5); // Sphere with radius 5
sphere(d=12, $fn=100); // Smooth sphere with diameter 12

cube(10); // Cube with side 10, corner at [0,0,0]
cube([15, 5, 8], center=true); // Box 15x5x8 centered at origin

cylinder(h=20, r=5); // Cylinder height 20, radius 5
cylinder(h=15, d=8, center=true); // Centered cylinder, height 15, diameter 8
cylinder(h=10, r1=5, r2=2, $fn=50); // Cone (tapered cylinder)

polyhedron(
  points=[[0,0,0],[10,0,0],[10,10,0],[0,10,0], [5,5,10]], // Base points + apex
  faces=[[0,1,2,3], [0,1,4], [1,2,4], [2,3,4], [3,0,4]] // Base face + 4 side faces
); // Pyramid

linear_extrude(height=10) circle(r=5); // Extrude a 2D circle into a cylinder
linear_extrude(height=5, twist=-90, slices=50) square(8, center=true);
// rotate_extrude(angle=360, convexity=10) translate([10,0,0]) square(2); // Create a torus/ring

import("model.stl"); // Import 3D model from STL file
```

*   **`center`:** If `true`, centers the shape at the origin `[0,0,0]`; otherwise, a corner is usually at `[0,0,0]`.
*   **Polyhedron:** Defines a shape using vertices (`points`) and faces (lists of point indices). Face indices should be ordered consistently (e.g., counter-clockwise when viewed from outside).
*   **Extrusions:** `linear_extrude` stretches a 2D shape along the Z-axis. `rotate_extrude` spins a 2D shape around the Z-axis.
*   **Resolution:** `$fn`, `$fa`, `$fs` control the smoothness of curves in `sphere`, `cylinder`, and extrusions of `circle`. See [Special Variables](#special-variables).

## Transformations

Modify the position, orientation, size, or color of child objects. Transformations are applied hierarchically.

```openscad
// Basic Transformations
translate([x, y, z]) { /* children */ } // Move children
rotate([ax, ay, az]) { /* children */ } // Rotate children around X, Y, Z axes (degrees)
rotate(a=[ax,ay,az], v=[vx,vy,vz]) { /* children */ } // Rotate around vector v by angle a
scale([sx, sy, sz]) { /* children */ } // Scale children along axes
resize([nx, ny, nz], auto=false) { /* children */ } // Resize to new dimensions (auto adjusts other axes if needed)
mirror([nx, ny, nz]) { /* children */ } // Mirror across a plane defined by normal vector [nx,ny,nz]

// Coloring
color("red") { /* children */ } // Color children red (uses named colors)
color([r, g, b, a]) { /* children */ } // Color using RGB[A] values (0 to 1)

// Other Transformations
multmatrix(m=[[...],[...],[...],[...]]) { /* children */ } // Apply a 4x4 transformation matrix
hull() { /* children */ } // Create the convex hull (shrink wrap) around children
minkowski() { /* children */ } // Minkowski sum (sweep shape B around shape A)

// Example:
translate([10, 5, 0]) {
  rotate([0, 0, 45]) {
    scale([1, 1, 2]) {
      color("blue")
      cylinder(h=10, r=3);
    }
  }
}
```

*   **`center`:** If `true`, centers the shape at the origin `[0,0,0]`; otherwise, a corner is usually at `[0,0,0]`.
*   **Polyhedron:** Defines a shape using vertices (`points`) and faces (lists of point indices). Face indices should be ordered consistently (e.g., counter-clockwise when viewed from outside).
*   **Extrusions:** `linear_extrude` stretches a 2D shape along the Z-axis. `rotate_extrude` spins a 2D shape around the Z-axis.
*   **Resolution:** `$fn`, `$fa`, `$fs` control the smoothness of curves in `sphere`, `cylinder`, and extrusions of `circle`. See [Special Variables](#special-variables).

## Boolean Operations (CSG)

Combine shapes using Constructive Solid Geometry (CSG).

```openscad
union() { // Combine all children into one object (the default if no operation is specified)
  cube(10);
  translate([5,5,5]) sphere(r=7);
}

difference() { // Subtract subsequent children (2nd, 3rd, ...) from the first child
  cube(10, center=true);
  sphere(r=7); // Cut a sphere from the cube
}

intersection() { // Keep only the parts where ALL children overlap
  cube([15,15,5], center=true);
  cylinder(h=10, r=6, center=true);
}
```

*   **Structure:** Typically `operation() { child1; child2; ... }`
*   **`union()`:** Merges shapes. It's the default behavior if shapes are just listed in sequence within a scope.
*   **`difference()`:** The first child is the base object. All following children are subtracted from it.
*   **`intersection()`:** Only the volume common to *all* children remains.
*   **Clarity:** Use comments (`//`) or separate modules to make complex CSG trees understandable.
*   **Epsilon:** Sometimes adding a tiny amount (e.g., `0.01`) to the size/height of subtracting objects in `difference()` ensures cleaner cuts, preventing coincident surfaces.

## Special Variables

These variables control the resolution and rendering of curved geometry (`sphere`, `cylinder`, `circle`, and extrusions involving curves).

```openscad
$fn = 100; // Set default number of fragments for circles/spheres globally
sphere(r=10, $fn=6); // Low-poly sphere (effectively an icosahedron if centered properly)
sphere(r=10, $fn=50); // Smoother sphere
cylinder(h=10, r=5, $fa=10); // Cylinder with facets approx 10 degrees apart
cylinder(h=10, r=5, $fs=0.5); // Cylinder with facets approx 0.5 units long
rotate_extrude($fn=50) translate([10,0]) circle(2, $fn=6); // Ring made of hexagons
```

*   **`$fn` (fragments number):** Specifies the *total* number of facets used to approximate a full 360-degree curve. If set to 0 (the default), OpenSCAD calculates the number of fragments based on `$fa` and `$fs`.
*   **`$fa` (fragment angle):** Specifies the *maximum angle* (in degrees) for each fragment. Smaller angles mean more fragments and smoother curves. Default is 12 degrees.
*   **`$fs` (fragment size):** Specifies the *maximum length* (in model units) of each fragment edge. Smaller sizes mean more fragments and smoother curves, especially for large objects. Default is 2.0 units.
*   **Precedence:** If `$fn` is set (non-zero), it usually overrides `$fa` and `$fs`. If `$fn` is 0, OpenSCAD uses `$fa` and `$fs` to determine the number of fragments, typically choosing the calculation that results in *more* fragments (smoother result) based on the object's size.
*   **Scope:** These variables can be set globally at the top level of the script, or locally within a module or block `{ ... }` to affect only the children within that scope.
*   **Performance:** Higher values (more fragments) result in smoother models but increase rendering time and file size.

## Modifier Characters

Prefix characters that alter the behavior of the immediately following object or operation.

*   **`*` (disable):** Comments out the following single statement or block. Useful for temporarily removing parts of a model without deleting code.
    ```openscad
    *cube(10); // This cube will not be rendered

    *difference() { // This entire difference operation is disabled
      sphere(r=10);
      cube(15, center=true);
    }
    ```
*   **`!` (root):** Marks the following object as a root node in the CSG tree. Even if nested inside transformations or boolean operations, it will be rendered independently. Useful for keeping helper geometry separate from the main model.
    ```openscad
    difference() {
      cube(10);
      !translate([5,5,5]) sphere(5); // The sphere is marked as a root, so it's NOT subtracted
                                     // Both cube and sphere are rendered separately.
    }
    ```
*   **`#` (debug):** Highlights the bounding box of the following object in pink/purple. Does not affect the final render (F6), only the preview (F5).
    ```openscad
    #translate([10,0,0]) sphere(5); // The sphere's bounding box is highlighted
    ```
*   **`%` (transparent):** Renders the following object as transparent (like glass) in the preview. Does not affect the final render (F6).
    ```openscad
    %cube([20,20,20], center=true); // Outer box is transparent
    sphere(5); // Inner sphere is visible inside
    ```
*   **`include <path/to/file.scad>`:** Acts like a C `#include`. The entire content of the included file is inserted at this point. Variables, modules, and functions from the included file become available. The semicolon at the end is optional.
    ```openscad
    // main.scad
    include <parts/gears.scad>; // With semicolon
    include <parts/utils.scad>  // Without semicolon (also valid)
    bevel_gear(teeth=12);
    ```
*   **`use <path/to/file.scad>`:** Similar to `include`, but only makes the modules and functions available from the used file. It does *not* execute top-level code (like variable assignments or object instantiations) from the used file. Generally preferred over `include` for modularity. The semicolon at the end is optional.
    ```openscad
    // main.scad
    use <utils/shapes.scad>; // With semicolon
    use <utils/math.scad>    // Without semicolon (also valid)
    rounded_box([10,20,5], r=1);
    ```
*   **`echo(...)`:** Prints values or messages to the OpenSCAD console during preview (F5). Useful for debugging, displaying calculated values, or showing warnings.
    ```openscad
    width = 10;
    height = width * 1.5;
    echo("Calculated height:", height); // Outputs: ECHO: "Calculated height:", 15

    echo(version=version()); // Show OpenSCAD version: ECHO: version = [2021, 1]
    ```

## Other Language Features

*   **`include <filename.scad>`:** Makes variables, modules, and functions from filename.scad available as if they were defined directly in the current file. The semicolon at the end is optional.
*   **`use <filename.scad>`:** Makes modules and functions (but NOT variables) from filename.scad available. Prevents variable name collisions between files. The semicolon at the end is optional.
*   **`echo(...)`:** Prints values or messages to the OpenSCAD console during preview (F5). Useful for debugging, displaying calculated values, or showing warnings.
*   **`str(...)`:** Converts arguments to a string.
*   **`search(...)`:** Finds occurrences of a value or sublist within lists or strings. Returns a list of indices.
*   **`assert(...)`:** Checks conditions during evaluation. Halts execution and reports an error if the condition is false. Good for validating module inputs.
*   **`lookup(...)`:** Retrieves values from a lookup table (list of key-value pairs).
*   **`version` and `version_num`:** Get the OpenSCAD version.

## Lists (Vectors)

Ordered collections of values, also known as vectors. Can contain numbers, booleans, strings, other lists, or `undef`.

```openscad
coords = [10, 20, 5]; // Often used for coordinates [x, y, z]
mixed = [1, true, "text", ["nested", list], undef];
empty = [];

// Accessing elements (0-indexed)
x_coord = coords[0]; // 10
nested_val = mixed[3][0]; // "nested"
last_item = coords[len(coords)-1]; // 5 (using len)

// Slicing [start:end] (end is exclusive) or [start:step:end]
first_two = coords[0:2]; // [10, 20]
slice_with_step = [0,1,2,3,4,5][1:5:2]; // [1, 3]

// Concatenation
combined = coords + [0, 0]; // [10, 20, 5, 0, 0]

// Common Functions
num_elements = len(coords); // 3
idx = search("text", mixed); // [2] (returns list of indices)
```

*   **Indexing:** `list[index]` starts from 0. Negative indices count from the end (`list[-1]` is the last element).
*   **Slicing:** Creates a new list containing a subset of elements.
*   **Mutability:** Lists are immutable. Operations like concatenation create new lists.
*   **Ranges:** `[start:end]` or `[start:step:end]` generate lists of numbers.

## List Comprehensions

A concise way to create lists based on existing lists or ranges, often combined with `for` and `if`.

```openscad
// Generate a list of squares
squares = [for (i = [0:4]) i * i]; // [0, 1, 4, 9, 16]

// Generate points on a circle
points = [for (a = [0:30:360-30]) [cos(a)*10, sin(a)*10] ];
// points will be [[10,0], [8.66,5], ..., [8.66,-5]]

// Filtering values
positive_coords = [for (p = [[1,2], [-3,4], [5,-6]]) if (p[0] > 0 && p[1] > 0) p];
// positive_coords is [[1,2]]

// Using `let` for intermediate calculations
scaled_points = [
    for (p = points)
    let (scale = 1.5)
    [p[0] * scale, p[1] * scale]
];

// Nested loops to create a grid of points
grid = [for (x = [0:2], y = [0:1]) [x*10, y*10] ];
// grid is [[0,0], [0,10], [10,0], [10,10], [20,0], [20,10]]
```

*   **Syntax:** `[ for (variable = iterable) <expression> ]`
*   **With `if`:** `[ for (variable = iterable) if (condition) <expression> ]`
*   **With `let`:** `[ for (variable = iterable) let (temp_var = ...) <expression> ]`
*   **Nested:** `[ for (v1 = it1) for (v2 = it2) ... <expression> ]`
*   **Power:** Extremely useful for generating geometry based on calculated positions or parameters.

## Built-in Functions

OpenSCAD provides numerous built-in functions for various operations.

### Mathematical Functions

```openscad
// Trigonometry (angles in degrees)
s = sin(90); // 1
c = cos(180); // -1
t = tan(45); // 1
a_s = asin(1); // 90
a_c = acos(-1); // 180
a_t = atan(1); // 45
a_t2 = atan2(1, 1); // 45 (handles quadrants)

// Exponents and Logs
p = pow(2, 3); // 8 (2^3)
sq = sqrt(16); // 4
e = exp(1); // ~2.718 (e^1)
ln = log(e); // 1 (natural log)
lg = log10(100); // 2 (base-10 log)

// Rounding and Absolute Value
rd = round(3.7); // 4
fl = floor(3.7); // 3
cl = ceil(3.1); // 4
ab = abs(-5); // 5

// Min/Max
mn = min(3, 1, 4); // 1
mx = max([5, 2, 8]); // 8 (can take list or multiple args)

// Other
sg = sign(-10); // -1
norm_vec = norm([3, 4]); // 5 (vector length/magnitude)
cross_prod = cross([1,0,0], [0,1,0]); // [0,0,1] (cross product)
```

### List/Vector Functions

```openscad
list = [10, "a", [2,3], 40];
l = len(list); // 4
conc = concat([1,2], ["b", "c"]); // [1, 2, "b", "c"]
idx = search("a", list); // [1] (returns list of indices)

// Lookup (key-value pairs)
table = [[1,"one"], [2,"two"]];
val = lookup(2, table); // "two"

// Generate vectors
vec = [for (i=[1:3]) i*10]; // [10, 20, 30]
```

### String Functions

```openscad
message = str("Value: ", 42, ", List: ", [1,2]);
// message is "Value: 42, List: [1, 2]"
echo(message);
```

### Type Checking Functions

```openscad
is_num(10); // true
is_bool(false); // true
is_string("hi"); // true
is_list([1,2]); // true
is_undef(undef); // true
is_function(cos); // true
is_module(cube); // (Not a function, typically used internally)
```

### Other Utility Functions

```openscad
v = version(); // [year, month, day] e.g., [2021, 1, 0]
vn = version_num(); // number e.g., 20210100

parent_mod_name = parent_module(1); // Name of the parent module
// More specialized functions exist for specific tasks (e.g., parent_module(n))
