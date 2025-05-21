// Simple cube with size parameter
cube(10);

// Cube with center parameter
cube(10, center=true);

// Cube with named size parameter
cube(size=10);

// Cube with named parameters
cube(size=10, center=true);

// Cube with vector size parameter
cube([10, 20, 30]);

// Cube with named vector size parameter
cube(size=[10, 20, 30]);

// Cube with vector size and center parameters
cube([10, 20, 30], center=true);

// Cube with named vector size and center parameters
cube(size=[10, 20, 30], center=true);

// Cube with default size when no parameters are provided
cube();
