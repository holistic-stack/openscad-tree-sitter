// Simple sphere with radius parameter
sphere(10);

// Sphere with named radius parameter
sphere(r=15);

// Sphere with diameter parameter
sphere(d=20);

// Sphere with $fn parameter
sphere(r=10, $fn=100);

// Sphere with $fa and $fs parameters
sphere(r=10, $fa=5, $fs=0.1);

// Sphere with all resolution parameters
sphere(r=10, $fn=100, $fa=5, $fs=0.1);

// Sphere with default radius when no parameters are provided
sphere();

// Sphere with both radius and diameter parameters (diameter should take precedence)
sphere(r=10, d=30);
