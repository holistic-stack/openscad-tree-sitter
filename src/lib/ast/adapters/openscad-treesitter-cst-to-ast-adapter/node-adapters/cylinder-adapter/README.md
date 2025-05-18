# Cylinder3D Adapter

## Overview

The Cylinder3D adapter converts OpenSCAD cylinder primitives from the tree-sitter CST (Concrete Syntax Tree) to the AST (Abstract Syntax Tree) representation. It handles various cylinder parameters and supports both cursor-based traversal for better performance and memory usage.

## Parameters Supported

The adapter handles the following OpenSCAD cylinder parameters:

- `h`: Height of the cylinder
- `r`: Radius (for both top and bottom)
- `r1`: Bottom radius
- `r2`: Top radius (when different from r1, creates a cone)
- `d`: Diameter (for both top and bottom)
- `d1`: Bottom diameter
- `d2`: Top diameter
- `center`: Whether the cylinder is centered on the z-axis
- `$fn`: Facet number special variable
- `$fa`: Facet angle special variable
- `$fs`: Facet size special variable

## Usage in OpenSCAD

In OpenSCAD, cylinders can be defined in multiple ways:

```openscad
// Basic cylinder with height and radius
cylinder(h=10, r=5);

// Cylinder with different top and bottom radii (cone)
cylinder(h=10, r1=5, r2=2);

// Cylinder specified with diameter instead of radius
cylinder(h=10, d=10);

// Centered cylinder
cylinder(h=10, r=5, center=true);

// Cylinder with special variables
cylinder(h=10, r=5, $fn=36);
```

## Implementation Notes

- The adapter follows a cursor-based traversal approach for improved performance
- When diameter parameters are used, they are automatically converted to radius values
- Default values are provided for height and radius when not specified
- Position information is properly extracted from the CST nodes
- Both circular cylinders and cones (cylinders with different top and bottom radii) are supported
- Special variables ($fn, $fa, $fs) are handled as optional parameters

## Examples

### Example 1: Basic Cylinder

```openscad
cylinder(h=10, r=5);
```

This generates a Cylinder3D with height=10 and radius1=5.

### Example 2: Cone

```openscad
cylinder(h=20, r1=8, r2=2);
```

This generates a Cylinder3D with height=20, radius1=8, and radius2=2.

### Example 3: Centered Cylinder with Diameter

```openscad
cylinder(h=15, d=12, center=true);
```

This generates a Cylinder3D with height=15, radius1=6, and center=true.
