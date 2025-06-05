# For Loop Statement Examples

## Overview

This document provides comprehensive examples of OpenSCAD for loop statement parsing using the OpenSCAD Parser. The ForLoopVisitor provides complete support for all OpenSCAD for loop patterns with 100% test coverage.

## Basic Usage

```typescript
import { EnhancedOpenscadParser } from '@openscad/parser';

const parser = new EnhancedOpenscadParser();

// Parse basic for loop
const basicLoop = `
  for (i = [0:5]) {
    cube(i);
  }
`;

const ast = parser.parseAST(basicLoop);
console.log(JSON.stringify(ast, null, 2));
```

## For Loop Patterns

### 1. Basic For Loop

**OpenSCAD Code:**
```openscad
for (i = [0:5]) {
  cube(i);
}
```

**Generated AST:**
```json
{
  "type": "for_loop",
  "variables": [
    {
      "name": "i",
      "range": {
        "type": "expression",
        "expressionType": "range",
        "start": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0
        },
        "end": {
          "type": "expression",
          "expressionType": "literal",
          "value": 5
        }
      }
    }
  ],
  "body": [
    {
      "type": "module_instantiation",
      "name": "cube",
      "args": [
        {
          "type": "positional",
          "value": {
            "type": "expression",
            "expressionType": "variable",
            "name": "i"
          }
        }
      ],
      "children": []
    }
  ]
}
```

### 2. For Loop with Step

**OpenSCAD Code:**
```openscad
for (i = [0:0.5:5]) {
  translate([i, 0, 0]) cube(1);
}
```

**Generated AST:**
```json
{
  "type": "for_loop",
  "variables": [
    {
      "name": "i",
      "range": {
        "type": "expression",
        "expressionType": "range",
        "start": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0
        },
        "step": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0.5
        },
        "end": {
          "type": "expression",
          "expressionType": "literal",
          "value": 5
        }
      },
      "step": 0.5
    }
  ],
  "body": [
    {
      "type": "module_instantiation",
      "name": "translate",
      "args": [
        {
          "type": "positional",
          "value": {
            "type": "expression",
            "expressionType": "array",
            "elements": [
              {
                "type": "expression",
                "expressionType": "variable",
                "name": "i"
              },
              {
                "type": "expression",
                "expressionType": "literal",
                "value": 0
              },
              {
                "type": "expression",
                "expressionType": "literal",
                "value": 0
              }
            ]
          }
        }
      ],
      "children": [
        {
          "type": "module_instantiation",
          "name": "cube",
          "args": [
            {
              "type": "positional",
              "value": {
                "type": "expression",
                "expressionType": "literal",
                "value": 1
              }
            }
          ],
          "children": []
        }
      ]
    }
  ]
}
```

### 3. Multiple Variables

**OpenSCAD Code:**
```openscad
for (i = [0:5], j = [0:5]) {
  translate([i, j, 0]) cube(1);
}
```

**Generated AST:**
```json
{
  "type": "for_loop",
  "variables": [
    {
      "name": "i",
      "range": {
        "type": "expression",
        "expressionType": "range",
        "start": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0
        },
        "end": {
          "type": "expression",
          "expressionType": "literal",
          "value": 5
        }
      }
    },
    {
      "name": "j",
      "range": {
        "type": "expression",
        "expressionType": "range",
        "start": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0
        },
        "end": {
          "type": "expression",
          "expressionType": "literal",
          "value": 5
        }
      }
    }
  ],
  "body": [
    {
      "type": "module_instantiation",
      "name": "translate",
      "args": [
        {
          "type": "positional",
          "value": {
            "type": "expression",
            "expressionType": "array",
            "elements": [
              {
                "type": "expression",
                "expressionType": "variable",
                "name": "i"
              },
              {
                "type": "expression",
                "expressionType": "variable",
                "name": "j"
              },
              {
                "type": "expression",
                "expressionType": "literal",
                "value": 0
              }
            ]
          }
        }
      ],
      "children": [
        {
          "type": "module_instantiation",
          "name": "cube",
          "args": [
            {
              "type": "positional",
              "value": {
                "type": "expression",
                "expressionType": "literal",
                "value": 1
              }
            }
          ],
          "children": []
        }
      ]
    }
  ]
}
```

### 4. Complex Expressions

**OpenSCAD Code:**
```openscad
for (i = [0:len(points)-1]) {
  translate(points[i]) sphere(1);
}
```

**Generated AST:**
```json
{
  "type": "for_loop",
  "variables": [
    {
      "name": "i",
      "range": {
        "type": "expression",
        "expressionType": "range",
        "start": {
          "type": "expression",
          "expressionType": "literal",
          "value": 0
        },
        "end": {
          "type": "expression",
          "expressionType": "binary",
          "operator": "-",
          "left": {
            "type": "expression",
            "expressionType": "function_call",
            "functionName": "len",
            "args": [
              {
                "type": "positional",
                "value": {
                  "type": "expression",
                  "expressionType": "variable",
                  "name": "points"
                }
              }
            ]
          },
          "right": {
            "type": "expression",
            "expressionType": "literal",
            "value": 1
          }
        }
      }
    }
  ],
  "body": [
    {
      "type": "module_instantiation",
      "name": "translate",
      "args": [
        {
          "type": "positional",
          "value": {
            "type": "expression",
            "expressionType": "array_access",
            "array": {
              "type": "expression",
              "expressionType": "variable",
              "name": "points"
            },
            "index": {
              "type": "expression",
              "expressionType": "variable",
              "name": "i"
            }
          }
        }
      ],
      "children": [
        {
          "type": "module_instantiation",
          "name": "sphere",
          "args": [
            {
              "type": "positional",
              "value": {
                "type": "expression",
                "expressionType": "literal",
                "value": 1
              }
            }
          ],
          "children": []
        }
      ]
    }
  ]
}
```

## Advanced Examples

### Nested For Loops

```openscad
for (x = [0:10]) {
  for (y = [0:10]) {
    translate([x, y, 0]) cube(1);
  }
}
```

### For Loops with Conditionals

```openscad
for (i = [0:10]) {
  if (i % 2 == 0) {
    translate([i, 0, 0]) cube(1);
  }
}
```

### For Loops with Complex Bodies

```openscad
for (angle = [0:30:360]) {
  rotate([0, 0, angle]) {
    translate([10, 0, 0]) {
      cube([2, 1, 1]);
      translate([0, 2, 0]) sphere(0.5);
    }
  }
}
```

## Error Handling

The ForLoopVisitor provides comprehensive error handling:

```typescript
// Invalid for loop structure
const invalidCode = `for (invalid syntax) { cube(1); }`;

try {
  const ast = parser.parseAST(invalidCode);
  // Check for error nodes
  if (ast.type === 'error') {
    console.log('Parse error:', ast.message);
  }
} catch (error) {
  console.log('Parser error:', error.message);
}
```

## Integration with Other Features

### With Range Expressions

For loops seamlessly integrate with range expressions:

```openscad
// All these range patterns work in for loops
for (i = [0:5]) { /* basic range */ }
for (i = [0:2:10]) { /* range with step */ }
for (i = [start:end]) { /* variable ranges */ }
for (i = [0:step:max]) { /* variable step */ }
```

### With Function Calls

```openscad
for (i = [0:len(array)-1]) {
  echo(array[i]);
}
```

### With Complex Expressions

```openscad
for (i = [0:count], j = [start:increment:end]) {
  translate([i*spacing, j*offset, height]) {
    rotate([0, 0, i*angle]) {
      cube([width, depth, thickness]);
    }
  }
}
```

## Performance Notes

- For loops are parsed efficiently with minimal memory overhead
- Complex expressions in ranges are properly delegated to expression visitors
- Step extraction is optimized for common patterns
- Error recovery is fast and doesn't impact performance

## See Also

- [Range Expression Examples](range-expressions.md) - Range expression patterns
- [ForLoopVisitor API](../visitors/for-loop-visitor.md) - Technical implementation details
- [AST Types](../api/ast-types.md) - ForLoopNode interface definition
- [Basic Usage](basic-usage.md) - Getting started with the parser
