# OpenSCAD Deprecated Features

This document outlines the deprecated features in OpenSCAD and provides recommendations for handling them in our parser.

## Overview

OpenSCAD has evolved over time, and some features have been deprecated in favor of newer, more flexible alternatives. While these deprecated features may still work in current versions of OpenSCAD, they will be removed in future releases. Our parser should handle these features appropriately to ensure backward compatibility while encouraging the use of modern alternatives.

## Deprecated Features

### 1. `polyhedron()` with `triangles` parameter

**Status**: Deprecated since OpenSCAD 2014.03

**Description**: The `triangles` parameter in the `polyhedron()` function has been deprecated in favor of the more flexible `faces` parameter.

**Old syntax**:
```openscad
polyhedron(points = [...], triangles = [...], convexity = N);
```

**New syntax**:
```openscad
polyhedron(points = [...], faces = [...], convexity = N);
```

**Recommendation**: Our parser should support both syntaxes for backward compatibility but issue a warning when the `triangles` parameter is used. The AST should represent both forms in a consistent way, with a flag indicating whether the deprecated syntax was used.

### 2. `assign()` statement

**Status**: Deprecated since OpenSCAD 2015.03

**Description**: The `assign()` statement has been deprecated in favor of direct variable assignments or the `let()` statement.

**Old syntax**:
```openscad
assign(a = 1, b = 2) {
    // Use a and b
}
```

**New syntax**:
```openscad
// Direct assignment
a = 1;
b = 2;
// Use a and b

// Or using let
let(a = 1, b = 2) {
    // Use a and b
}
```

**Recommendation**: Our parser should support the `assign()` statement for backward compatibility but issue a warning when it is used. The AST should represent both forms in a consistent way, with a flag indicating whether the deprecated syntax was used.

### 3. DXF-related functions

**Status**: Deprecated (exact version unclear)

**Description**: Several DXF-related functions have been deprecated:
- `dxf_cross()`
- `dxf_dim()`

**Recommendation**: Our parser should support these functions for backward compatibility but issue a warning when they are used. The AST should represent these functions in a consistent way, with a flag indicating that deprecated syntax was used.

### 4. Mathematical functions

**Status**: Deprecated since OpenSCAD 2014.03

**Description**: Some mathematical functions have been deprecated in favor of more consistently named alternatives:
- `norm()` → replaced by `norm()`
- `cross()` → replaced by `cross()`

**Recommendation**: Our parser should support both the old and new function names for backward compatibility but issue a warning when the deprecated names are used. The AST should represent both forms in a consistent way, with a flag indicating whether the deprecated syntax was used.

### 5. Range with start > end

**Status**: Deprecated since OpenSCAD 2015.03

**Description**: Using a range where the start value is greater than the end value without a negative step (e.g., `[3:0]`) has been deprecated.

**Old behavior**: OpenSCAD would interpret `[3:0]` as `[0:1:3]`

**New behavior**: A negative step must be explicitly specified, e.g., `[3:-1:0]`

**Recommendation**: Our parser should support both forms for backward compatibility but issue a warning when a range with start > end without a negative step is used. The AST should represent both forms in a consistent way, with a flag indicating whether the deprecated syntax was used.

## Implementation Strategy

To handle deprecated features in our parser, we should:

1. **Support both old and new syntax**: Ensure the parser can parse both deprecated and modern syntax correctly.

2. **Flag deprecated usage**: Include a flag in the AST nodes that indicates when deprecated syntax is used.

3. **Provide warnings**: When deprecated syntax is detected, the parser should issue warnings that include:
   - The deprecated feature being used
   - The recommended alternative
   - A note that the feature will be removed in future OpenSCAD versions

4. **Documentation**: Document all deprecated features and their alternatives in our parser documentation.

5. **Migration utilities**: Consider providing utilities to help users migrate from deprecated to modern syntax.

## Example Warning Messages

When deprecated syntax is detected, the parser should issue warnings like:

- "Warning: The 'triangles' parameter in polyhedron() is deprecated. Use 'faces' parameter instead."
- "Warning: The assign() statement is deprecated. Use direct variable assignments or the let() statement instead."
- "Warning: The dxf_cross() function is deprecated."
- "Warning: Range with start > end without negative step is deprecated. Use [start:step:end] with negative step instead."

## Conclusion

By supporting deprecated features while providing clear warnings and migration paths, our parser can maintain backward compatibility with existing OpenSCAD code while encouraging the use of modern syntax. This approach ensures that our parser remains useful for both legacy code and new development.
