# IntersectionOperation Adapter

## Overview

The IntersectionOperation adapter converts OpenSCAD intersection operations from the tree-sitter CST (Concrete Syntax Tree) to the AST (Abstract Syntax Tree) representation. It handles the extraction of child nodes and maintains proper position information, following cursor-based traversal for better performance and memory management.

## Intersection Operation in OpenSCAD

In OpenSCAD, the intersection operation is one of the three primary Boolean operations used for Constructive Solid Geometry (CSG) modeling, along with union and difference. It creates a shape that represents the volume where all input objects overlap.

## Implementation Details

The IntersectionOperation adapter:

1. Processes a tree-sitter `operation_statement` node with an `intersection` identifier
2. Extracts all child nodes from the operation's block statement
3. Recursively adapts each child node to its AST representation
4. Preserves the order of child nodes
5. Maintains correct position information for debugging and error reporting
6. Handles edge cases like empty intersection operations (with no children)

## Usage in OpenSCAD

In OpenSCAD, intersection operations can be used in various ways:

```openscad
// Basic intersection of a cube and sphere
intersection() {
    cube(10, center=true);
    sphere(6);
}

// Intersection with multiple objects
intersection() {
    cube(10, center=true);
    sphere(8);
    cylinder(h=12, r=5, center=true);
}

// Empty intersection (valid syntax but produces no geometry)
intersection() { }
```

## AST Representation

The adapter produces an `IntersectionOperation` AST node with the following structure:

```typescript
{
    type: 'IntersectionOperation',
    children: ASTNode[], // Array of child nodes
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

1. Basic conversion of intersection nodes to AST
2. Correct extraction of multiple children
3. Proper position information
4. Child node ordering preservation
5. Graceful handling of edge cases

## Integration with CSG Operations

This adapter completes the set of core Boolean operations for CSG modeling in OpenSCAD:

- Union (combines objects)
- Difference (subtracts objects)
- Intersection (keeps common volume)

Together, these operations enable the creation of complex shapes by combining simpler primitives, which is the foundation of parametric modeling in OpenSCAD.
