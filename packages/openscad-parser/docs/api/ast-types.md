# AST Types

This document provides comprehensive documentation for all Abstract Syntax Tree (AST) node types in the OpenSCAD Parser library.

## Overview

The OpenSCAD Parser generates strongly-typed AST nodes that represent different OpenSCAD language constructs. All AST nodes extend the base `ASTNode` interface and provide specific properties for their respective operations.

## Base Types

### ASTNode

Base interface for all AST nodes.

```typescript
interface ASTNode {
  type: string;
  sourceLocation?: SourceLocation;
}
```

**Properties:**
- `type`: String identifier for the node type
- `sourceLocation` (optional): Location in the source code

### SourceLocation

Represents a location in the source code.

```typescript
interface SourceLocation {
  start: Position;
  end: Position;
}

interface Position {
  line: number;
  column: number;
}
```

## Primitive Nodes

### CubeNode

Represents a `cube()` primitive.

```typescript
interface CubeNode extends ASTNode {
  type: 'cube';
  size: number | [number, number, number];
  center: boolean;
}
```

**Properties:**
- `size`: Cube dimensions (single number for all sides, or [x, y, z] array)
- `center`: Whether the cube is centered at origin

**Example:**
```typescript
// cube(10);
{
  type: 'cube',
  size: 10,
  center: false
}

// cube([10, 20, 30], center=true);
{
  type: 'cube',
  size: [10, 20, 30],
  center: true
}
```

### SphereNode

Represents a `sphere()` primitive.

```typescript
interface SphereNode extends ASTNode {
  type: 'sphere';
  radius: number;
  fa?: number;
  fs?: number;
  fn?: number;
}
```

**Properties:**
- `radius`: Sphere radius
- `fa`, `fs`, `fn` (optional): Resolution parameters

**Example:**
```typescript
// sphere(5);
{
  type: 'sphere',
  radius: 5
}

// sphere(r=10, $fn=32);
{
  type: 'sphere',
  radius: 10,
  fn: 32
}
```

### CylinderNode

Represents a `cylinder()` primitive.

```typescript
interface CylinderNode extends ASTNode {
  type: 'cylinder';
  height: number;
  radius1: number;
  radius2: number;
  center: boolean;
  fa?: number;
  fs?: number;
  fn?: number;
}
```

**Properties:**
- `height`: Cylinder height
- `radius1`: Bottom radius
- `radius2`: Top radius (for cones)
- `center`: Whether centered at origin
- `fa`, `fs`, `fn` (optional): Resolution parameters

**Example:**
```typescript
// cylinder(h=10, r=5);
{
  type: 'cylinder',
  height: 10,
  radius1: 5,
  radius2: 5,
  center: false
}

// cylinder(h=20, r1=10, r2=5, center=true);
{
  type: 'cylinder',
  height: 20,
  radius1: 10,
  radius2: 5,
  center: true
}
```

### PolyhedronNode

Represents a `polyhedron()` primitive.

```typescript
interface PolyhedronNode extends ASTNode {
  type: 'polyhedron';
  points: number[][];
  faces: number[][];
  convexity?: number;
}
```

**Properties:**
- `points`: Array of 3D points [x, y, z]
- `faces`: Array of face definitions (indices into points array)
- `convexity` (optional): Convexity parameter

## 2D Primitive Nodes

### SquareNode

Represents a `square()` 2D primitive.

```typescript
interface SquareNode extends ASTNode {
  type: 'square';
  size: number | [number, number];
  center: boolean;
}
```

### CircleNode

Represents a `circle()` 2D primitive.

```typescript
interface CircleNode extends ASTNode {
  type: 'circle';
  radius: number;
  fa?: number;
  fs?: number;
  fn?: number;
}
```

### PolygonNode

Represents a `polygon()` 2D primitive.

```typescript
interface PolygonNode extends ASTNode {
  type: 'polygon';
  points: number[][];
  paths?: number[][];
  convexity?: number;
}
```

## Transform Nodes

### TranslateNode

Represents a `translate()` transformation.

```typescript
interface TranslateNode extends ASTNode {
  type: 'translate';
  vector: [number, number, number];
  children: ASTNode[];
}
```

**Properties:**
- `vector`: Translation vector [x, y, z]
- `children`: Child nodes to transform

**Example:**
```typescript
// translate([10, 20, 30]) cube(5);
{
  type: 'translate',
  vector: [10, 20, 30],
  children: [{
    type: 'cube',
    size: 5,
    center: false
  }]
}
```

### RotateNode

Represents a `rotate()` transformation.

```typescript
interface RotateNode extends ASTNode {
  type: 'rotate';
  angles: [number, number, number];
  children: ASTNode[];
}
```

**Properties:**
- `angles`: Rotation angles [x, y, z] in degrees
- `children`: Child nodes to transform

### ScaleNode

Represents a `scale()` transformation.

```typescript
interface ScaleNode extends ASTNode {
  type: 'scale';
  factors: [number, number, number];
  children: ASTNode[];
}
```

### MirrorNode

Represents a `mirror()` transformation.

```typescript
interface MirrorNode extends ASTNode {
  type: 'mirror';
  normal: [number, number, number];
  children: ASTNode[];
}
```

## CSG Nodes

### UnionNode

Represents a `union()` boolean operation.

```typescript
interface UnionNode extends ASTNode {
  type: 'union';
  children: ASTNode[];
}
```

**Example:**
```typescript
// union() { cube(10); sphere(5); }
{
  type: 'union',
  children: [
    { type: 'cube', size: 10, center: false },
    { type: 'sphere', radius: 5 }
  ]
}
```

### DifferenceNode

Represents a `difference()` boolean operation.

```typescript
interface DifferenceNode extends ASTNode {
  type: 'difference';
  children: ASTNode[];
}
```

### IntersectionNode

Represents an `intersection()` boolean operation.

```typescript
interface IntersectionNode extends ASTNode {
  type: 'intersection';
  children: ASTNode[];
}
```

## Expression Nodes

### VariableNode

Represents a variable reference.

```typescript
interface VariableNode extends ASTNode {
  type: 'variable';
  name: string;
}
```

### LiteralNode

Represents literal values.

```typescript
interface LiteralNode extends ASTNode {
  type: 'literal';
  value: number | string | boolean | number[];
}
```

### BinaryExpressionNode

Represents binary operations.

```typescript
interface BinaryExpressionNode extends ASTNode {
  type: 'binary_expression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}
```

### RangeExpressionNode

Represents OpenSCAD range expressions like `[0:5]` and `[0:2:10]`.

```typescript
interface RangeExpressionNode extends ExpressionNode {
  type: 'expression';
  expressionType: 'range_expression';
  start: ExpressionNode;
  end: ExpressionNode;
  step?: ExpressionNode;
  location: SourceLocation;
}
```

**Properties:**
- `start`: Starting value of the range
- `end`: Ending value of the range
- `step` (optional): Step size for the range
- `location`: Source location information

**Example AST Output:**
Range expressions are parsed when used in proper OpenSCAD contexts:

```typescript
// For loop: for (i = [0:5]) { ... }
// The range [0:5] produces:
{
  type: 'expression',
  expressionType: 'range_expression',
  start: { type: 'literal', value: 0 },
  end: { type: 'literal', value: 5 }
}

// For loop: for (i = [0:2:10]) { ... }
// The range [0:2:10] produces:
{
  type: 'expression',
  expressionType: 'range_expression',
  start: { type: 'literal', value: 0 },
  step: { type: 'literal', value: 2 },
  end: { type: 'literal', value: 10 }
}

// Variable assignment: range = [start:end];
// The range [start:end] produces:
{
  type: 'expression',
  expressionType: 'range_expression',
  start: { type: 'variable', name: 'start' },
  end: { type: 'variable', name: 'end' }
}
```

**Integration with ExpressionVisitor:**
Range expressions are fully integrated into the main ExpressionVisitor system and work seamlessly in all contexts including:
- For loops: `for (i = [0:5]) { ... }`
- List comprehensions: `[for (i = [0:2:10]) i*2]`
- Variable assignments: `range = [1:0.5:5];`

## Control Structure Nodes

### ForLoopNode

Represents a `for()` loop.

```typescript
interface ForLoopNode extends ASTNode {
  type: 'for_loop';
  variable: string;
  range: ASTNode;
  body: ASTNode[];
}
```

### IfStatementNode

Represents an `if()` conditional.

```typescript
interface IfStatementNode extends ASTNode {
  type: 'if_statement';
  condition: ASTNode;
  thenBody: ASTNode[];
  elseBody?: ASTNode[];
}
```

### ModuleDefinitionNode

Represents a module definition.

```typescript
interface ModuleDefinitionNode extends ASTNode {
  type: 'module_definition';
  name: string;
  parameters: ParameterNode[];
  body: ASTNode[];
}
```

### ModuleInstantiationNode

Represents a module call.

```typescript
interface ModuleInstantiationNode extends ASTNode {
  type: 'module_instantiation';
  name: string;
  arguments: ArgumentNode[];
  children?: ASTNode[];
}
```

## Type Guards

The library provides type guards for safe type checking:

```typescript
import { isCubeNode, isSphereNode, isTransformNode } from '@openscad/parser';

function processNode(node: ASTNode) {
  if (isCubeNode(node)) {
    console.log(`Cube with size: ${node.size}`);
  } else if (isSphereNode(node)) {
    console.log(`Sphere with radius: ${node.radius}`);
  } else if (isTransformNode(node)) {
    console.log(`Transform with ${node.children.length} children`);
  }
}
```

## Statement Nodes

### AssertStatementNode

Represents an `assert()` statement for runtime validation.

```typescript
interface AssertStatementNode extends ASTNode {
  type: 'assert';
  condition: ExpressionNode;
  message?: ExpressionNode;
}
```

**Properties:**
- `condition`: The boolean expression to evaluate
- `message`: Optional error message to display if assertion fails

**Examples:**
```openscad
assert(x > 0);
assert(y < 100, "y value out of range");
assert(len(points) >= 3, "Need at least 3 points for polygon");
```

### AssignStatementNode

Represents an `assign()` statement for variable scoping (deprecated in OpenSCAD).

```typescript
interface AssignStatementNode extends ASTNode {
  type: 'assign';
  assignments: AssignmentNode[];
  body: ASTNode;
}

interface AssignmentNode extends ASTNode {
  type: 'assignment';
  variable: string;
  value: ExpressionNode;
}
```

**Properties:**
- `assignments`: Array of variable assignments within the assign statement
- `body`: The statement or block to execute with the assigned variables

**Examples:**
```openscad
assign(x = 5) cube(x);
assign(x = 5, y = 10) cube([x, y, 1]);
assign(r = 10) { sphere(r); translate([r*2, 0, 0]) sphere(r); }
```

**Note:** Assign statements are deprecated in OpenSCAD but still supported for legacy code compatibility.

## Usage Examples

### Processing AST Nodes

```typescript
function processAST(nodes: ASTNode[]) {
  nodes.forEach(node => {
    switch (node.type) {
      case 'cube':
        const cube = node as CubeNode;
        console.log(`Cube: ${cube.size}, centered: ${cube.center}`);
        break;

      case 'translate':
        const translate = node as TranslateNode;
        console.log(`Translate by [${translate.vector.join(', ')}]`);
        processAST(translate.children); // Process children recursively
        break;

      case 'difference':
        const diff = node as DifferenceNode;
        console.log(`Difference with ${diff.children.length} children`);
        processAST(diff.children);
        break;

      case 'assert':
        const assert = node as AssertStatementNode;
        console.log(`Assert: ${assert.condition}`);
        if (assert.message) {
          console.log(`  Message: ${assert.message}`);
        }
        break;

      case 'assign':
        const assign = node as AssignStatementNode;
        console.log(`Assign: ${assign.assignments.length} assignments`);
        assign.assignments.forEach(assignment => {
          console.log(`  ${assignment.variable} = ${assignment.value}`);
        });
        processAST([assign.body]); // Process body
        break;
    }
  });
}
```

### Type-Safe Node Creation

```typescript
const cubeNode: CubeNode = {
  type: 'cube',
  size: [10, 20, 30],
  center: true
};

const translateNode: TranslateNode = {
  type: 'translate',
  vector: [5, 0, 0],
  children: [cubeNode]
};
```
