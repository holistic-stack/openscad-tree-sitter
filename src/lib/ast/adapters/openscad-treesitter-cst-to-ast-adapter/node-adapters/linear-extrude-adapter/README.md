# LinearExtrudeTransform Adapter

## Overview

The LinearExtrudeTransform adapter converts OpenSCAD linear_extrude transformations from the tree-sitter CST (Concrete Syntax Tree) to the AST (Abstract Syntax Tree) representation. This transformation is crucial for converting 2D shapes into 3D objects in OpenSCAD.

## Linear Extrude in OpenSCAD

Linear extrusion is a fundamental operation in OpenSCAD that takes a 2D shape and extends it into the third dimension, creating a 3D object. It can apply additional transformations during the extrusion, such as twisting or scaling.

## Parameters Supported

The adapter handles the following parameters for linear extrusion:

- `height`: Required - The height of the extrusion (distance to extrude)
- `center`: Optional - Whether to center the extrusion on the z-axis
- `convexity`: Optional - Hint for OpenSCAD's renderer to handle complex shapes
- `twist`: Optional - Degrees of twist from bottom to top
- `slices`: Optional - Number of intermediate points along the height
- `scale`: Optional - Scaling factor from bottom to top
- `$fn`: Optional - Facet number special variable
- `$fa`: Optional - Facet angle special variable
- `$fs`: Optional - Facet size special variable

## Implementation Details

The LinearExtrudeTransform adapter:

1. Processes a tree-sitter `transform_statement` node with a `linear_extrude` identifier
2. Extracts all parameters from the arguments node, including both required and optional parameters
3. Extracts all child nodes from the transformation's block statement
4. Creates a properly structured LinearExtrudeTransform AST node
5. Maintains correct position information for each node
6. Follows established patterns for consistent code structure

## Usage in OpenSCAD

In OpenSCAD, linear extrusion can be used in various ways:

```openscad
// Basic linear extrusion with just height
linear_extrude(height=10) {
    square(20, center=true);
}

// Linear extrusion with twist
linear_extrude(height=10, twist=45) {
    square(20, center=true);
}

// Linear extrusion with multiple parameters
linear_extrude(height=20, twist=180, slices=100, scale=0.5, center=true) {
    circle(r=10);
}

// Linear extrusion with multiple 2D shapes
linear_extrude(height=15) {
    square(20, center=true);
    translate([15, 15]) circle(r=5);
}
```

## AST Representation

The adapter produces a `LinearExtrudeTransform` AST node with the following structure:

```typescript
{
    type: 'LinearExtrudeTransform',
    height: Expression,
    center?: Expression,
    convexity?: Expression,
    twist?: Expression,
    slices?: Expression,
    scale?: Expression | [Expression, Expression],
    $fn?: Expression,
    $fa?: Expression,
    $fs?: Expression,
    children: ASTNode[],
    position: {
        startLine: number,
        startColumn: number,
        endLine: number,
        endColumn: number
    }
}
```

## Test Coverage

The adapter includes comprehensive tests that verify:

1. Basic conversion of linear_extrude nodes to AST
2. Correct extraction of all parameters
3. Proper handling of optional parameters
4. Correct position information
5. Proper child node extraction

## Implementation Notes

- The adapter uses a cursor-based approach for better performance and reduced memory usage
- Default values are provided for required parameters when not specified
- The code is structured following the DRY (Don't Repeat Yourself) principle
- Type safety is ensured through proper type guards and interfaces
