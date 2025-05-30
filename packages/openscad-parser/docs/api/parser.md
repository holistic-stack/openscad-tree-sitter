# Parser Classes

This document provides comprehensive documentation for all parser classes in the OpenSCAD Parser library.

## OpenscadParser

Basic OpenSCAD parser using Tree-sitter for Concrete Syntax Tree (CST) generation.

### Overview

The `OpenscadParser` class provides low-level access to the Tree-sitter parser for OpenSCAD. For most use cases, prefer `EnhancedOpenscadParser` which provides additional AST generation and error handling capabilities.

### Constructor

```typescript
const parser = new OpenscadParser();
```

Creates a new parser instance. The parser must be initialized before use.

### Methods

#### `init(wasmPath?: string): Promise<void>`

Initialize the parser with the OpenSCAD grammar.

**Parameters:**
- `wasmPath` (optional): Path to the tree-sitter-openscad.wasm file. Defaults to `'./tree-sitter-openscad.wasm'`

**Returns:** Promise that resolves when initialization is complete

**Throws:** Error if WASM loading fails or grammar cannot be loaded

**Example:**
```typescript
const parser = new OpenscadParser();

try {
  await parser.init('./tree-sitter-openscad.wasm');
  console.log('Parser initialized successfully');
} catch (error) {
  console.error('Failed to initialize parser:', error);
}
```

#### `parse(code: string): TreeSitter.Tree | null`

Parse OpenSCAD source code into a Concrete Syntax Tree (CST).

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Tree-sitter Tree object or null if parsing fails

**Throws:** Error if parser is not initialized

**Example:**
```typescript
const tree = parser.parse(`
  difference() {
    cube([20, 20, 20]);
    sphere(10);
  }
`);

console.log(tree?.rootNode.type); // 'source_file'
console.log(tree?.rootNode.childCount); // Number of top-level statements
```

#### `dispose(): void`

Dispose the parser and free associated resources.

**Example:**
```typescript
const parser = new OpenscadParser();
await parser.init();

try {
  const tree = parser.parse('cube(10);');
  // Process the tree...
} finally {
  parser.dispose(); // Always clean up
}
```

### Properties

#### `isInitialized: boolean`

Read-only property indicating whether the parser has been initialized.

**Example:**
```typescript
const parser = new OpenscadParser();
console.log(parser.isInitialized); // false

await parser.init();
console.log(parser.isInitialized); // true
```

## EnhancedOpenscadParser

Enhanced OpenSCAD parser that provides AST generation and comprehensive error handling.

### Overview

The `EnhancedOpenscadParser` extends the basic parser functionality with:
- Structured AST generation using visitor pattern
- Comprehensive error handling and reporting
- Incremental parsing support
- Type-safe AST nodes

### Constructor

```typescript
const parser = new EnhancedOpenscadParser(errorHandler?: IErrorHandler);
```

**Parameters:**
- `errorHandler` (optional): Error handler instance for collecting errors and warnings

**Example:**
```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);
```

### Methods

#### `init(): Promise<void>`

Initialize the enhanced parser.

**Returns:** Promise that resolves when initialization is complete

**Example:**
```typescript
const parser = new EnhancedOpenscadParser();
await parser.init();
```

#### `parseAST(code: string): ASTNode[]`

Parse OpenSCAD code and generate a structured AST.

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Array of AST nodes representing the parsed code

**Example:**
```typescript
const ast = parser.parseAST('cube([10, 20, 30]);');

console.log(ast[0].type); // 'cube'
console.log(ast[0].size); // [10, 20, 30]
```

#### `parseCST(code: string): TreeSitter.Tree | null`

Parse OpenSCAD code to CST (same as basic parser).

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Tree-sitter Tree object or null if parsing fails

#### `update(code: string, startIndex: number, oldEndIndex: number, newEndIndex: number): TreeSitter.Tree | null`

Incrementally update the CST with code changes.

**Parameters:**
- `code`: Updated source code
- `startIndex`: Start position of the change
- `oldEndIndex`: End position of the old content
- `newEndIndex`: End position of the new content

**Returns:** Updated Tree-sitter Tree object

**Example:**
```typescript
const originalCode = 'cube(10);';
const originalTree = parser.parseCST(originalCode);

const updatedCode = 'cube(20);'; // Changed parameter
const startIndex = originalCode.indexOf('10');
const oldEndIndex = startIndex + 2; // '10' is 2 characters
const newEndIndex = startIndex + 2; // '20' is also 2 characters

const updatedTree = parser.update(updatedCode, startIndex, oldEndIndex, newEndIndex);
```

#### `updateAST(code: string, startIndex: number, oldEndIndex: number, newEndIndex: number): ASTNode[]`

Incrementally update the AST with code changes.

**Parameters:**
- `code`: Updated source code
- `startIndex`: Start position of the change
- `oldEndIndex`: End position of the old content
- `newEndIndex`: End position of the new content

**Returns:** Updated AST nodes

#### `dispose(): void`

Dispose the parser and free associated resources.

### Error Handling

The enhanced parser integrates with error handlers to provide comprehensive error reporting:

```typescript
const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);

const invalidCode = 'cube([10, 20, 30);'; // Missing closing bracket

try {
  const ast = parser.parseAST(invalidCode);
  
  // Check collected errors and warnings
  const errors = errorHandler.getErrors();
  const warnings = errorHandler.getWarnings();
  
  console.log('Errors:', errors);
  console.log('Warnings:', warnings);
} catch (error) {
  console.error('Parsing failed:', error);
}
```

## Real Parser Pattern

Both parser classes follow the "Real Parser Pattern" for testing - no mocks are used. Instead, real parser instances are created with proper lifecycle management:

```typescript
describe('Parser Tests', () => {
  let parser: EnhancedOpenscadParser;
  let errorHandler: SimpleErrorHandler;

  beforeEach(async () => {
    errorHandler = new SimpleErrorHandler();
    parser = new EnhancedOpenscadParser(errorHandler);
    await parser.init();
  });

  afterEach(() => {
    parser.dispose();
  });

  it('should parse OpenSCAD code', () => {
    const ast = parser.parseAST('sphere(5);');
    expect(ast[0].type).toBe('sphere');
  });
});
```

## Performance Considerations

### Parser Reuse

For better performance, reuse parser instances:

```typescript
const parser = new EnhancedOpenscadParser();
await parser.init();

// Reuse same parser instance for multiple operations
const codes = ['cube(10);', 'sphere(5);', 'cylinder(h=20, r=3);'];
const results = codes.map(code => parser.parseAST(code));

parser.dispose();
```

### Memory Management

Always dispose parsers when done to prevent memory leaks:

```typescript
const parser = new EnhancedOpenscadParser();

try {
  await parser.init();
  // Use parser...
} finally {
  parser.dispose(); // Always clean up
}
```
