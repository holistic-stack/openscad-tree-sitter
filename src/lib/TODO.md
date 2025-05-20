# OpenSCAD Tree-sitter Parser - TODO List

## High Priority

### 1. Complete AST Generator Implementation
- [x] **Core Parser**
  - [x] Basic parser setup with web-tree-sitter
  - [x] OpenSCAD grammar integration
  - [x] CST (Concrete Syntax Tree) generation
  - [x] Initial AST (Abstract Syntax Tree) generation from CST
  - [ ] Support for incremental parsing

- [ ] **AST Generator Refactoring**
  - [x] Create modular structure for AST generation
  - [ ] Refactor existing AST generator to use the modular structure
  - [ ] Implement proper error handling and recovery
  - [ ] Add comprehensive logging for debugging

- [ ] **AST Node Types**
  - [x] Basic primitive shapes (cube)
  - [x] Basic transformations (translate)
  - [ ] Complete primitive shapes (sphere, cylinder, etc.)
  - [ ] Complete transformations (rotate, scale, etc.)
  - [ ] CSG operations (union, difference, intersection)
  - [ ] Control structures (if, for, let, each)
  - [ ] Modules and functions

- [ ] **Tree Traversal**
  - [x] Basic cursor utilities for tree traversal
  - [ ] Implement tree-sitter queries for common patterns
  - [ ] Support for finding specific node types in the tree
  - [ ] Navigation between related nodes (e.g., definition to usage)

- [ ] **Query System**
  - [x] Basic query utilities
  - [ ] Optimize query performance
  - [ ] Add support for complex query patterns
  - [ ] Implement query result caching

### 2. Complete AST Node Adapters
- [ ] **Module System**
  - [ ] Implement `module_definition` adapter
  - [ ] Handle module parameters and default values
  - [ ] Support module instantiation with arguments

- [ ] **Function System**
  - [ ] Implement `function_definition` adapter
  - [ ] Handle function parameters and return values
  - [ ] Support function calls and recursion

- [ ] **Control Flow**
  - [ ] Enhance `if_statement` with `else if` support
  - [ ] Add `for` loop adapter
  - [ ] Implement `let` expression adapter

### 3. Query System Enhancements
- [ ] **Query Optimization**
  - [ ] Implement query result caching
  - [ ] Add query validation
  - [ ] Support query composition

- [ ] **New Query Types**
  - [ ] References and definitions queries
  - [ ] Scope-aware symbol lookup
  - [ ] Type inference queries

## Medium Priority

### 4. Expand AST Generator Capabilities

#### 4.1 Primitive Shapes
- [x] **Cube**
  - [x] Basic cube with size parameter
  - [x] Cube with center parameter
  - [ ] Cube with vector size parameter
  - [ ] Cube with scalar size parameter

- [ ] **Sphere**
  - [ ] Basic sphere with r parameter
  - [ ] Sphere with d parameter
  - [ ] Sphere with $fa, $fs, $fn parameters

- [ ] **Cylinder**
  - [ ] Basic cylinder with h and r parameters
  - [ ] Cylinder with h, r1, r2 parameters (cone)
  - [ ] Cylinder with d, d1, d2 parameters
  - [ ] Cylinder with center parameter
  - [ ] Cylinder with $fa, $fs, $fn parameters

- [ ] **Polyhedron**
  - [ ] Basic polyhedron with points and faces
  - [ ] Polyhedron with triangles parameter
  - [ ] Polyhedron with convexity parameter

- [ ] **2D Primitives**
  - [ ] Circle with r parameter
  - [ ] Square with size parameter
  - [ ] Polygon with points parameter
  - [ ] Text with text parameter

- [ ] **Extrusion Operations**
  - [ ] Linear_extrude with height parameter
  - [ ] Rotate_extrude with angle parameter

#### 4.2 Transformations
- [x] **Translate**
  - [x] Basic translate with vector parameter
  - [x] Translate with named v parameter
  - [x] Translate with child statement
  - [x] Translate with child block

- [ ] **Rotate**
  - [ ] Rotate with scalar angle (z-axis)
  - [ ] Rotate with vector angles [x,y,z]
  - [ ] Rotate with a and v parameters (axis-angle)

- [ ] **Scale**
  - [ ] Scale with vector parameter
  - [ ] Scale with scalar parameter (uniform)

- [ ] **Mirror**
  - [ ] Mirror with normal vector parameter

- [ ] **Multmatrix**
  - [ ] Multmatrix with 4x4 transformation matrix

- [ ] **Color**
  - [ ] Color with name parameter
  - [ ] Color with hex value
  - [ ] Color with rgb/rgba vector
  - [ ] Color with alpha parameter

- [ ] **Offset**
  - [ ] Offset with r parameter
  - [ ] Offset with delta parameter
  - [ ] Offset with chamfer parameter

#### 4.3 Boolean Operations
- [ ] **Union**
  - [ ] Basic union of multiple children

- [ ] **Difference**
  - [ ] Basic difference with multiple children

- [ ] **Intersection**
  - [ ] Basic intersection of multiple children

- [ ] **Hull**
  - [ ] Hull of multiple children

- [ ] **Minkowski**
  - [ ] Minkowski sum of multiple children

#### 4.4 Control Structures
- [ ] **Conditional Statements**
  - [ ] If statement with single child
  - [ ] If-else statement
  - [ ] Conditional operator (a ? b : c)

- [ ] **Loops**
  - [ ] For loop with range [start:end]
  - [ ] For loop with range [start:step:end]
  - [ ] For loop with array/list
  - [ ] For loop with multiple variables

- [ ] **Let Statement**
  - [ ] Let with single variable
  - [ ] Let with multiple variables
  - [ ] Nested let statements

- [ ] **Each Statement**
  - [ ] Each with array/list

#### 4.5 Modules and Functions
- [ ] **Module Definitions**
  - [ ] Basic module without parameters
  - [ ] Module with positional parameters
  - [ ] Module with named parameters
  - [ ] Module with default parameter values
  - [ ] Module with special variables ($fn, $fa, $fs)
  - [ ] Module with children
  - [ ] Module with child indexing

- [ ] **Function Definitions**
  - [ ] Basic function with return value
  - [ ] Function with parameters
  - [ ] Function with default parameter values
  - [ ] Recursive functions
  - [ ] Function literals/lambdas

#### 4.6 Imports and Includes
- [ ] **File Operations**
  - [ ] Include statement
  - [ ] Use statement
  - [ ] Import statement
  - [ ] Surface statement

#### 4.7 Special Variables and Operators
- [ ] **Special Variables**
  - [ ] $fn, $fa, $fs for circle resolution
  - [ ] $t for animation
  - [ ] $vpr, $vpt, $vpd for viewport
  - [ ] $children for module children count

- [ ] **Operators**
  - [ ] Arithmetic operators (+, -, *, /, %)
  - [ ] Comparison operators (==, !=, <, <=, >, >=)
  - [ ] Logical operators (&&, ||, !)
  - [ ] Vector operators ([], [:])
  - [ ] String concatenation (str())

#### 4.8 Advanced Features
- [ ] **List Comprehensions**
  - [ ] Basic list comprehension with single generator
  - [ ] List comprehension with condition
  - [ ] List comprehension with multiple generators

- [ ] **String Operations**
  - [ ] String concatenation
  - [ ] String formatting
  - [ ] String functions (len, chr, ord, etc.)

- [ ] **Mathematical Functions**
  - [ ] Trigonometric functions (sin, cos, tan, etc.)
  - [ ] Exponential functions (exp, log, pow, etc.)
  - [ ] Rounding functions (floor, ceil, round)
  - [ ] Vector functions (norm, cross, etc.)

### 5. Testing Infrastructure
- [x] **Basic Test Coverage**
  - [x] Unit tests for core components
  - [x] Integration tests for AST generation

- [ ] **Syntax Test Coverage**
  - [ ] **Primitive Tests**
    - [x] Cube syntax variations
      ```scad
      // Basic cube with size parameter
      cube(10);

      // Cube with center parameter
      cube([1, 2, 3], center=true);

      // Cube with vector size parameter
      cube([5, 10, 15]);

      // Cube with scalar size parameter
      cube(size=5);
      ```

    - [ ] Sphere syntax variations
      ```scad
      // Basic sphere with r parameter
      sphere(10);

      // Sphere with d parameter
      sphere(d=20);

      // Sphere with $fa, $fs, $fn parameters
      sphere(r=10, $fn=100);
      sphere(r=10, $fa=5, $fs=0.1);
      ```

    - [ ] Cylinder syntax variations
      ```scad
      // Basic cylinder with h and r parameters
      cylinder(h=10, r=5);

      // Cylinder with h, r1, r2 parameters (cone)
      cylinder(h=10, r1=10, r2=5);

      // Cylinder with d, d1, d2 parameters
      cylinder(h=10, d=10);
      cylinder(h=10, d1=20, d2=10);

      // Cylinder with center parameter
      cylinder(h=10, r=5, center=true);

      // Cylinder with $fa, $fs, $fn parameters
      cylinder(h=10, r=5, $fn=50);
      ```

    - [ ] Polyhedron syntax variations
      ```scad
      // Basic polyhedron with points and faces
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        faces=[
          [0,1,2,3], [4,5,6,7], [0,4,7,3],
          [1,5,6,2], [0,1,5,4], [3,2,6,7]
        ]
      );

      // Polyhedron with triangles parameter
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        triangles=[
          [0,1,2], [0,2,3], [4,5,6], [4,6,7],
          [0,4,7], [0,7,3], [1,5,6], [1,6,2],
          [0,1,5], [0,5,4], [3,2,6], [3,6,7]
        ]
      );

      // Polyhedron with convexity parameter
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        faces=[
          [0,1,2,3], [4,5,6,7], [0,4,7,3],
          [1,5,6,2], [0,1,5,4], [3,2,6,7]
        ],
        convexity=2
      );
      ```

    - [ ] 2D primitives syntax variations
      ```scad
      // Circle with r parameter
      circle(5);

      // Circle with d parameter
      circle(d=10);

      // Square with size parameter
      square(10);
      square([10, 20]);
      square([10, 20], center=true);

      // Polygon with points parameter
      polygon(points=[[0,0], [10,0], [10,10], [0,10]]);

      // Polygon with paths parameter
      polygon(
        points=[[0,0], [10,0], [10,10], [0,10], [5,5]],
        paths=[[0,1,2,3], [4]]
      );

      // Text with text parameter
      text("Hello", size=10, font="Arial");
      ```

    - [ ] Extrusion operations syntax variations
      ```scad
      // Linear_extrude with height parameter
      linear_extrude(height=10) square(10);

      // Linear_extrude with twist parameter
      linear_extrude(height=10, twist=90) square(10);

      // Linear_extrude with scale parameter
      linear_extrude(height=10, scale=2) square(10);

      // Rotate_extrude with angle parameter
      rotate_extrude(angle=180) translate([10, 0]) circle(5);
      ```

  - [ ] **Transformation Tests**
    - [x] Translate syntax variations
      ```scad
      // Basic translate with vector parameter
      translate([10, 20, 30]) cube(10);

      // Translate with named v parameter
      translate(v=[10, 20, 30]) cube(10);

      // Translate with child statement
      translate([1, 0, 0]) cube([1, 2, 3], center=true);

      // Translate with child block
      translate(v=[3, 0, 0]) {
        cube(size=[1, 2, 3], center=true);
      }
      ```

    - [ ] Rotate syntax variations
      ```scad
      // Rotate with scalar angle (z-axis)
      rotate(45) cube(10);

      // Rotate with vector angles [x,y,z]
      rotate([45, 0, 90]) cube(10);

      // Rotate with a and v parameters (axis-angle)
      rotate(a=45, v=[0, 0, 1]) cube(10);
      ```

    - [ ] Scale syntax variations
      ```scad
      // Scale with vector parameter
      scale([2, 1, 0.5]) cube(10);

      // Scale with scalar parameter (uniform)
      scale(2) cube(10);

      // Scale with named v parameter
      scale(v=[2, 1, 0.5]) cube(10);
      ```

    - [ ] Mirror syntax variations
      ```scad
      // Mirror with normal vector parameter
      mirror([1, 0, 0]) cube(10);

      // Mirror with named v parameter
      mirror(v=[0, 1, 0]) cube(10);
      ```

    - [ ] Multmatrix syntax variations
      ```scad
      // Multmatrix with 4x4 transformation matrix
      multmatrix([
        [1, 0, 0, 10],
        [0, 1, 0, 20],
        [0, 0, 1, 30],
        [0, 0, 0, 1]
      ]) cube(10);
      ```

    - [ ] Color syntax variations
      ```scad
      // Color with name parameter
      color("red") cube(10);

      // Color with hex value
      color("#FF0000") cube(10);

      // Color with rgb/rgba vector
      color([1, 0, 0]) cube(10);
      color([1, 0, 0, 0.5]) cube(10);

      // Color with alpha parameter
      color("red", 0.5) cube(10);
      ```

    - [ ] Offset syntax variations
      ```scad
      // Offset with r parameter
      offset(r=5) square(10);

      // Offset with delta parameter
      offset(delta=5) square(10);

      // Offset with chamfer parameter
      offset(delta=5, chamfer=true) square(10);
      ```

  - [ ] **Boolean Operation Tests**
    - [ ] Union syntax variations
      ```scad
      // Basic union of multiple children
      union() {
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }

      // Implicit union (no union keyword)
      {
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }
      ```

    - [ ] Difference syntax variations
      ```scad
      // Basic difference with multiple children
      difference() {
        cube(10, center=true);
        sphere(7);
      }

      // Difference with multiple subtractions
      difference() {
        cube(10, center=true);
        sphere(7);
        translate([0, 0, 10]) cylinder(h=10, r=3, center=true);
      }
      ```

    - [ ] Intersection syntax variations
      ```scad
      // Basic intersection of multiple children
      intersection() {
        cube(10, center=true);
        sphere(7);
      }

      // Intersection with multiple objects
      intersection() {
        cube(10, center=true);
        sphere(7);
        translate([0, 0, 5]) cylinder(h=10, r=3, center=true);
      }
      ```

    - [ ] Hull syntax variations
      ```scad
      // Hull of multiple children
      hull() {
        translate([0, 0, 0]) sphere(5);
        translate([20, 0, 0]) sphere(5);
      }

      // Hull of complex shapes
      hull() {
        cube(10, center=true);
        translate([20, 0, 0]) cylinder(h=10, r=5, center=true);
      }
      ```

    - [ ] Minkowski syntax variations
      ```scad
      // Minkowski sum of multiple children
      minkowski() {
        cube([10, 10, 1]);
        cylinder(r=2, h=1);
      }

      // Minkowski with sphere for rounded corners
      minkowski() {
        cube([10, 10, 10], center=true);
        sphere(2);
      }
      ```

  - [ ] **Control Structure Tests**
    - [ ] If-else syntax variations
      ```scad
      // If statement with single child
      if (true) {
        cube(10);
      }

      // If-else statement
      if (true) {
        cube(10);
      } else {
        sphere(10);
      }

      // Conditional operator (a ? b : c)
      x = true ? 10 : 20;
      cube(x);
      ```

    - [ ] For loop syntax variations
      ```scad
      // For loop with range [start:end]
      for (i = [0:5]) {
        translate([i*10, 0, 0]) cube(5);
      }

      // For loop with range [start:step:end]
      for (i = [0:2:10]) {
        translate([i*10, 0, 0]) cube(5);
      }

      // For loop with array/list
      for (i = [10, 20, 30, 40]) {
        translate([i, 0, 0]) cube(5);
      }

      // For loop with multiple variables
      for (i = [0:5], j = [0:5]) {
        translate([i*10, j*10, 0]) cube(5);
      }
      ```

    - [ ] Let statement syntax variations
      ```scad
      // Let with single variable
      let (x = 10) {
        cube(x);
      }

      // Let with multiple variables
      let (x = 10, y = 20, z = 30) {
        translate([x, y, z]) cube(5);
      }

      // Nested let statements
      let (x = 10) {
        let (y = x * 2) {
          translate([x, y, 0]) cube(5);
        }
      }

      // Let in for loop
      for (i = [0:5]) {
        let (x = i * 10) {
          translate([x, 0, 0]) cube(5);
        }
      }
      ```

    - [ ] Each statement syntax variations
      ```scad
      // Each with array/list
      points = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
      for (p = points) {
        translate(p) cube(5);
      }

      // Each with flatten
      points = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
      for (p = [each points]) {
        translate(p) cube(5);
      }
      ```

  - [ ] **Module and Function Tests**
    - [ ] Module definition syntax variations
      ```scad
      // Basic module without parameters
      module mycube() {
        cube(10);
      }

      // Module with positional parameters
      module mycube(size) {
        cube(size);
      }

      // Module with named parameters
      module mycube(size=10, center=false) {
        cube(size, center=center);
      }

      // Module with default parameter values
      module mycube(size=10, center=false) {
        cube(size, center=center);
      }

      // Module with special variables ($fn, $fa, $fs)
      module mysphere(r=10) {
        sphere(r=r, $fn=$fn);
      }

      // Module with children
      module wrapper() {
        translate([0, 0, 10]) children();
      }

      // Module with child indexing
      module select_child() {
        children(0);
      }
      ```

    - [ ] Function definition syntax variations
      ```scad
      // Basic function with return value
      function add(a, b) = a + b;

      // Function with parameters
      function sum(v) = v[0] + v[1] + v[2];

      // Function with default parameter values
      function add(a=0, b=0) = a + b;

      // Recursive functions
      function factorial(n) = (n <= 0) ? 1 : n * factorial(n-1);

      // Function literals/lambdas
      f = function(x) x * x;
      ```

    - [ ] Module instantiation syntax variations
      ```scad
      // Basic module instantiation
      mycube();

      // Module instantiation with positional parameters
      mycube(20);

      // Module instantiation with named parameters
      mycube(size=20, center=true);

      // Module instantiation with children
      wrapper() {
        cube(10);
      }

      // Module instantiation with multiple children
      wrapper() {
        cube(10);
        sphere(5);
      }
      ```

    - [ ] Function call syntax variations
      ```scad
      // Basic function call
      x = add(10, 20);

      // Function call with named parameters
      x = add(a=10, b=20);

      // Function call with default parameters
      x = add(10);

      // Function call in expression
      cube(add(10, 20));

      // Function literal call
      x = f(10);
      ```

  - [ ] **Import and Include Tests**
    - [ ] Include statement syntax variations
      ```scad
      // Basic include statement
      include <filename.scad>

      // Include with relative path
      include <../lib/filename.scad>

      // Include with absolute path
      include </path/to/filename.scad>
      ```

    - [ ] Use statement syntax variations
      ```scad
      // Basic use statement
      use <filename.scad>

      // Use with relative path
      use <../lib/filename.scad>

      // Use with absolute path
      use </path/to/filename.scad>
      ```

    - [ ] Import statement syntax variations
      ```scad
      // Import STL file
      import("filename.stl");

      // Import with convexity parameter
      import("filename.stl", convexity=5);

      // Import with layer parameter
      import("filename.dxf", layer="layer1");

      // Import with origin parameter
      import("filename.svg", origin=[0, 0]);
      ```

    - [ ] Surface statement syntax variations
      ```scad
      // Basic surface statement
      surface("heightmap.png");

      // Surface with center parameter
      surface("heightmap.png", center=true);

      // Surface with invert parameter
      surface("heightmap.png", invert=true);

      // Surface with convexity parameter
      surface("heightmap.png", convexity=5);
      ```

  - [ ] **Special Variable and Operator Tests**
    - [ ] Special variable syntax variations
      ```scad
      // $fn for circle resolution
      sphere(r=10, $fn=100);

      // $fa and $fs for circle resolution
      sphere(r=10, $fa=5, $fs=0.1);

      // $t for animation
      rotate($t * 360) cube(10);

      // $vpr, $vpt, $vpd for viewport
      echo($vpr, $vpt, $vpd);

      // $children for module children count
      module test() {
        echo($children);
        children();
      }
      ```

    - [ ] Operator syntax variations
      ```scad
      // Arithmetic operators (+, -, *, /, %)
      x = 10 + 20;
      y = 10 - 20;
      z = 10 * 20;
      a = 10 / 20;
      b = 10 % 20;

      // Comparison operators (==, !=, <, <=, >, >=)
      if (x == y) { cube(10); }
      if (x != y) { cube(10); }
      if (x < y) { cube(10); }
      if (x <= y) { cube(10); }
      if (x > y) { cube(10); }
      if (x >= y) { cube(10); }

      // Logical operators (&&, ||, !)
      if (x > 0 && y > 0) { cube(10); }
      if (x > 0 || y > 0) { cube(10); }
      if (!(x > 0)) { cube(10); }

      // Vector operators ([], [:])
      v = [1, 2, 3];
      x = v[0];
      sub_v = v[1:2];

      // String concatenation (str())
      s = str("Hello", " ", "World");
      ```

  - [ ] **Advanced Feature Tests**
    - [ ] List comprehension syntax variations
      ```scad
      // Basic list comprehension with single generator
      a = [for (i = [0:5]) i * i];

      // List comprehension with condition
      a = [for (i = [0:10]) if (i % 2 == 0) i];

      // List comprehension with multiple generators
      a = [for (i = [0:2], j = [0:2]) [i, j]];

      // List comprehension with let
      a = [for (i = [0:5]) let (j = i * i) j];

      // List comprehension with each
      a = [for (i = [0:2]) each [i, i+1]];
      ```

    - [ ] String operation syntax variations
      ```scad
      // String concatenation
      s = str("Hello", " ", "World");

      // String formatting
      s = str("Value: ", 10);

      // String functions
      len_s = len("Hello");
      c = "Hello"[0];
      ```

    - [ ] Mathematical function syntax variations
      ```scad
      // Trigonometric functions
      a = sin(45);
      b = cos(45);
      c = tan(45);
      d = asin(0.5);
      e = acos(0.5);
      f = atan(1);
      g = atan2(1, 1);

      // Exponential functions
      a = exp(1);
      b = log(10);
      c = pow(2, 3);
      d = sqrt(4);

      // Rounding functions
      a = floor(1.7);
      b = ceil(1.2);
      c = round(1.5);

      // Vector functions
      v = [1, 2, 3];
      l = norm(v);
      c = cross([1, 0, 0], [0, 1, 0]);
      ```

- [ ] **Advanced Test Coverage**
  - [ ] Increase unit test coverage to 90%+
  - [ ] Add integration tests for complex files
  - [ ] Performance benchmarking

- [ ] **Test Fixtures**
  - [ ] Create representative test files for each syntax category
  - [ ] Add edge case tests for complex syntax combinations
  - [ ] Performance test cases with large and complex models

## Low Priority

### 6. Documentation
- [ ] **API Documentation**
  - [ ] Document public APIs
  - [ ] Add usage examples
  - [ ] Create architecture diagrams

- [ ] **Developer Guide**
  - [ ] Setup instructions
  - [ ] Contribution guidelines
  - [ ] Debugging tips

### 7. Editor Integration [skip for now]
- [ ] **VS Code Extension**
  - [ ] Basic syntax highlighting
  - [ ] Code folding
  - [ ] Go to definition

## Implementation Notes

### AST Generator
- Follow the modular structure created for the AST generator
- Use the appropriate generator classes for different node types
- Ensure proper error handling and recovery
- Maintain comprehensive logging for debugging

### Handling Syntax Variations
- Implement a consistent approach to parameter extraction
  - Handle both positional and named parameters
  - Support default values for optional parameters
  - Validate parameter types and values
- Create robust node traversal utilities
  - Handle different child node structures (statements, blocks, expressions)
  - Support nested node structures
  - Implement proper parent-child relationships
- Design flexible AST node interfaces
  - Support all parameter variations for each node type
  - Include source location information for error reporting
  - Maintain type safety with TypeScript interfaces

### AST Adapters
- Follow the adapter pattern used in existing implementations
- Ensure proper position information is preserved
- Handle edge cases and invalid inputs gracefully

### Query System
- Keep queries in separate `.scm` files
- Document query patterns and their purpose
- Consider performance implications of complex queries

### Testing
- Each new feature should include tests
- Test both valid and invalid inputs
- Include performance tests for critical paths

## Blockers

1. Current AST generator implementation needs to be fully refactored to use the modular structure
2. Need to implement more AST node types to support complex OpenSCAD files
3. Handling all syntax variations requires comprehensive test cases
4. Some tree-sitter query patterns need optimization
5. Performance testing infrastructure needed
6. Need to handle edge cases in parameter extraction and validation
7. Complex nested structures (like modules with control structures) need special handling

## Dependencies

- web-tree-sitter
- TypeScript
- Jest for testing

## Related Files

- `src/lib/openscad-parser/cst/query-utils.ts` - Core query utilities
- `src/lib/openscad-parser/ast/ast-types.ts` - AST node type definitions
- `src/lib/openscad-parser/ast/ast-generator.ts` - Main AST generator
- `src/lib/openscad-parser/ast/generators/` - Specialized AST generators
- `src/lib/openscad-parser/ast/utils/` - Utility functions for AST generation
- `src/lib/openscad-parser/ast/extractors/` - Value and argument extractors
- `src/lib/openscad-parser/cst/adapters/` - Node adapters
- `queries/` - Tree-sitter query files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Submit a pull request

## License

[Specify License]
