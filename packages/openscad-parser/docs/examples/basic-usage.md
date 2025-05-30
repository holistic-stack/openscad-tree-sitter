# Basic Usage Examples

This document provides practical examples for common OpenSCAD parsing scenarios using the OpenSCAD Parser library.

## Getting Started

### Installation and Setup

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

// Create error handler and parser
const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);

// Initialize the parser (loads WASM)
await parser.init();

// Always clean up when done
try {
  // Your parsing operations here
} finally {
  parser.dispose();
}
```

## Parsing Primitives

### Basic Shapes

```typescript
// Parse a simple cube
const cubeAST = parser.parseAST('cube(10);');
console.log(cubeAST[0]); 
// Output: { type: 'cube', size: 10, center: false }

// Parse a cube with vector dimensions
const vectorCubeAST = parser.parseAST('cube([10, 20, 30]);');
console.log(vectorCubeAST[0].size); 
// Output: [10, 20, 30]

// Parse a centered cube
const centeredCubeAST = parser.parseAST('cube(10, center=true);');
console.log(centeredCubeAST[0].center); 
// Output: true
```

### Spheres and Cylinders

```typescript
// Basic sphere
const sphereAST = parser.parseAST('sphere(5);');
console.log(sphereAST[0]);
// Output: { type: 'sphere', radius: 5 }

// Sphere with resolution
const detailedSphereAST = parser.parseAST('sphere(r=10, $fn=32);');
console.log(detailedSphereAST[0]);
// Output: { type: 'sphere', radius: 10, fn: 32 }

// Basic cylinder
const cylinderAST = parser.parseAST('cylinder(h=20, r=5);');
console.log(cylinderAST[0]);
// Output: { type: 'cylinder', height: 20, radius1: 5, radius2: 5, center: false }

// Cone (cylinder with different radii)
const coneAST = parser.parseAST('cylinder(h=30, r1=10, r2=2);');
console.log(coneAST[0]);
// Output: { type: 'cylinder', height: 30, radius1: 10, radius2: 2, center: false }
```

## Processing Multiple Objects

### Sequential Operations

```typescript
const multipleObjects = `
  cube(10);
  sphere(5);
  cylinder(h=15, r=3);
`;

const ast = parser.parseAST(multipleObjects);
console.log(`Found ${ast.length} objects`);

ast.forEach((node, index) => {
  console.log(`Object ${index + 1}: ${node.type}`);
  
  switch (node.type) {
    case 'cube':
      console.log(`  Size: ${node.size}`);
      break;
    case 'sphere':
      console.log(`  Radius: ${node.radius}`);
      break;
    case 'cylinder':
      console.log(`  Height: ${node.height}, Radius: ${node.radius1}`);
      break;
  }
});
```

### Type-Safe Processing

```typescript
import { isCubeNode, isSphereNode, isCylinderNode } from '@openscad/parser';

function processObjects(ast: ASTNode[]) {
  ast.forEach(node => {
    if (isCubeNode(node)) {
      // TypeScript knows this is a CubeNode
      console.log(`Cube: ${node.size}, centered: ${node.center}`);
    } else if (isSphereNode(node)) {
      // TypeScript knows this is a SphereNode
      console.log(`Sphere: radius ${node.radius}`);
      if (node.fn) {
        console.log(`  Resolution: ${node.fn} facets`);
      }
    } else if (isCylinderNode(node)) {
      // TypeScript knows this is a CylinderNode
      console.log(`Cylinder: h=${node.height}, r1=${node.radius1}, r2=${node.radius2}`);
    }
  });
}
```

## Working with Transformations

### Basic Transformations

```typescript
// Translation
const translateAST = parser.parseAST('translate([10, 20, 30]) cube(5);');
const translateNode = translateAST[0] as TranslateNode;

console.log(`Translation vector: [${translateNode.vector.join(', ')}]`);
console.log(`Children: ${translateNode.children.length}`);
console.log(`Child type: ${translateNode.children[0].type}`);

// Rotation
const rotateAST = parser.parseAST('rotate([0, 0, 45]) cube(10);');
const rotateNode = rotateAST[0] as RotateNode;

console.log(`Rotation angles: [${rotateNode.angles.join(', ')}]`);

// Scale
const scaleAST = parser.parseAST('scale([2, 1, 0.5]) sphere(5);');
const scaleNode = scaleAST[0] as ScaleNode;

console.log(`Scale factors: [${scaleNode.factors.join(', ')}]`);
```

### Nested Transformations

```typescript
const nestedTransforms = `
  translate([10, 0, 0])
    rotate([0, 0, 45])
      scale([2, 1, 1])
        cube(5);
`;

const ast = parser.parseAST(nestedTransforms);
const outerTransform = ast[0] as TranslateNode;

console.log(`Outer: ${outerTransform.type}`);
console.log(`Middle: ${outerTransform.children[0].type}`);
console.log(`Inner: ${(outerTransform.children[0] as RotateNode).children[0].type}`);
console.log(`Primitive: ${((outerTransform.children[0] as RotateNode).children[0] as ScaleNode).children[0].type}`);
```

## CSG Operations

### Boolean Operations

```typescript
// Union
const unionAST = parser.parseAST(`
  union() {
    cube(10);
    sphere(8);
  }
`);

const unionNode = unionAST[0] as UnionNode;
console.log(`Union with ${unionNode.children.length} children`);

// Difference
const differenceAST = parser.parseAST(`
  difference() {
    cube([20, 20, 20]);
    translate([10, 10, 10]) sphere(8);
  }
`);

const diffNode = differenceAST[0] as DifferenceNode;
console.log(`Difference operation`);
console.log(`Base object: ${diffNode.children[0]?.type || 'none'}`);
console.log(`Subtracted object: ${diffNode.children[1]?.type || 'none'}`);

// Intersection
const intersectionAST = parser.parseAST(`
  intersection() {
    cube(15);
    sphere(10);
  }
`);

const intNode = intersectionAST[0] as IntersectionNode;
console.log(`Intersection with ${intNode.children.length} objects`);
```

## Error Handling

### Basic Error Detection

```typescript
const invalidCode = 'cube([10, 20, 30);'; // Missing closing bracket

try {
  const ast = parser.parseAST(invalidCode);
  
  // Check for parsing errors
  const errors = errorHandler.getErrors();
  const warnings = errorHandler.getWarnings();
  
  if (errors.length > 0) {
    console.log('Parsing errors found:');
    errors.forEach(error => {
      console.log(`- Line ${error.line}, Column ${error.column}: ${error.message}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('Parsing warnings:');
    warnings.forEach(warning => {
      console.log(`- ${warning.message}`);
    });
  }
  
  // AST might still contain partial results
  console.log(`Generated ${ast.length} AST nodes despite errors`);
  
} catch (error) {
  console.error('Critical parsing error:', error);
}
```

### Error Recovery

```typescript
const mixedValidInvalid = `
  cube(10);           // Valid
  sphere([5, 10);     // Invalid - wrong parameter type
  cylinder(h=20, r=5); // Valid - parser recovers
  translate([1, 2, 3) // Invalid - missing bracket
    cube(5);          // Valid - but might be affected
`;

const ast = parser.parseAST(mixedValidInvalid);
const errors = errorHandler.getErrors();

console.log(`Generated ${ast.length} AST nodes`);
console.log(`Found ${errors.length} errors`);

// Process valid nodes
ast.forEach((node, index) => {
  console.log(`Node ${index}: ${node.type}`);
});

// Report errors
errors.forEach((error, index) => {
  console.log(`Error ${index + 1}: ${error.message} at line ${error.line}`);
});
```

## Working with CST

### Direct CST Access

```typescript
// Get the concrete syntax tree
const code = 'translate([5, 0, 0]) cube(10);';
const cst = parser.parseCST(code);

if (cst) {
  console.log(`Root node type: ${cst.rootNode.type}`);
  console.log(`Has errors: ${cst.rootNode.hasError}`);
  console.log(`Child count: ${cst.rootNode.childCount}`);
  
  // Walk the CST
  const cursor = cst.walk();
  
  function walkNode(depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${cursor.nodeType}: "${cursor.nodeText}"`);
    
    if (cursor.gotoFirstChild()) {
      do {
        walkNode(depth + 1);
      } while (cursor.gotoNextSibling());
      cursor.gotoParent();
    }
  }
  
  walkNode();
}
```

### CST to AST Comparison

```typescript
const code = 'cube(10);';

// Get CST
const cst = parser.parseCST(code);
console.log('CST representation:');
console.log(cst?.rootNode.toString());

// Get AST
const ast = parser.parseAST(code);
console.log('\nAST representation:');
console.log(JSON.stringify(ast, null, 2));
```

## Performance Optimization

### Parser Reuse

```typescript
// Efficient: Reuse parser for multiple operations
const codes = [
  'cube(10);',
  'sphere(5);',
  'cylinder(h=20, r=3);',
  'translate([10, 0, 0]) cube(5);'
];

console.time('Batch parsing');
const results = codes.map(code => parser.parseAST(code));
console.timeEnd('Batch parsing');

console.log(`Processed ${results.length} code snippets`);
results.forEach((ast, index) => {
  console.log(`Code ${index + 1}: ${ast.length} nodes, first type: ${ast[0]?.type}`);
});
```

### Memory Management

```typescript
// Proper cleanup pattern
async function parseMultipleFiles(files: string[]) {
  const errorHandler = new SimpleErrorHandler();
  const parser = new EnhancedOpenscadParser(errorHandler);
  
  try {
    await parser.init();
    
    const results = [];
    for (const file of files) {
      // Clear errors between files
      errorHandler.clear();
      
      const ast = parser.parseAST(file);
      results.push({
        ast,
        errors: errorHandler.getErrors().slice(), // Copy errors
        warnings: errorHandler.getWarnings().slice() // Copy warnings
      });
    }
    
    return results;
  } finally {
    // Always dispose to prevent memory leaks
    parser.dispose();
  }
}
```

## Real-World Example

### Complete Processing Pipeline

```typescript
import { 
  EnhancedOpenscadParser, 
  SimpleErrorHandler,
  isCubeNode,
  isTransformNode,
  walkAST 
} from '@openscad/parser';

async function analyzeOpenSCADFile(code: string) {
  const errorHandler = new SimpleErrorHandler();
  const parser = new EnhancedOpenscadParser(errorHandler);
  
  try {
    await parser.init();
    
    // Parse the code
    const ast = parser.parseAST(code);
    
    // Collect statistics
    const stats = {
      totalNodes: 0,
      primitives: 0,
      transforms: 0,
      cubes: 0,
      errors: errorHandler.getErrors().length,
      warnings: errorHandler.getWarnings().length
    };
    
    // Walk the AST and collect statistics
    walkAST(ast, (node) => {
      stats.totalNodes++;
      
      if (isCubeNode(node)) {
        stats.primitives++;
        stats.cubes++;
      } else if (isTransformNode(node)) {
        stats.transforms++;
      }
    });
    
    // Report results
    console.log('Analysis Results:');
    console.log(`- Total nodes: ${stats.totalNodes}`);
    console.log(`- Primitives: ${stats.primitives}`);
    console.log(`- Transforms: ${stats.transforms}`);
    console.log(`- Cubes: ${stats.cubes}`);
    console.log(`- Errors: ${stats.errors}`);
    console.log(`- Warnings: ${stats.warnings}`);
    
    // Report errors if any
    if (stats.errors > 0) {
      console.log('\nErrors found:');
      errorHandler.getErrors().forEach((error, index) => {
        console.log(`${index + 1}. Line ${error.line}: ${error.message}`);
      });
    }
    
    return { ast, stats };
    
  } finally {
    parser.dispose();
  }
}

// Usage
const openscadCode = `
  difference() {
    union() {
      cube([20, 20, 20]);
      translate([10, 0, 0]) cube([10, 20, 20]);
    }
    translate([10, 10, 10]) sphere(8);
  }
`;

analyzeOpenSCADFile(openscadCode).then(result => {
  console.log('Analysis complete');
});
```
