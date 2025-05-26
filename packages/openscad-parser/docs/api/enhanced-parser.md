# EnhancedOpenscadParser API Reference

The `EnhancedOpenscadParser` is the main entry point for parsing OpenSCAD code. It provides both Concrete Syntax Tree (CST) and Abstract Syntax Tree (AST) parsing capabilities.

## Class: EnhancedOpenscadParser

### Constructor

```typescript
constructor(errorHandler?: IErrorHandler)
```

Creates a new instance of the enhanced OpenSCAD parser.

**Parameters:**
- `errorHandler` (optional): Custom error handler implementing `IErrorHandler` interface. If not provided, a default `SimpleErrorHandler` is used.

**Example:**
```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

// With default error handler
const parser = new EnhancedOpenscadParser();

// With custom error handler
const customErrorHandler = new SimpleErrorHandler();
const parserWithCustomHandler = new EnhancedOpenscadParser(customErrorHandler);
```

### Methods

#### init()

```typescript
async init(): Promise<void>
```

Initializes the parser by loading the Tree-sitter WASM module and OpenSCAD grammar.

**Returns:** Promise that resolves when initialization is complete.

**Throws:** Error if initialization fails (e.g., WASM loading issues).

**Example:**
```typescript
const parser = new EnhancedOpenscadParser();
await parser.init();
// Parser is now ready to use
```

#### parseCST()

```typescript
parseCST(code: string): TreeSitter.Tree | null
```

Parses OpenSCAD code and returns the Concrete Syntax Tree.

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Tree-sitter Tree object or null if parsing fails

**Example:**
```typescript
const code = 'cube([10, 20, 30]);';
const cst = parser.parseCST(code);

if (cst) {
  console.log('Root node type:', cst.rootNode.type);
  console.log('Has errors:', cst.rootNode.hasError);
}
```

#### parseAST()

```typescript
parseAST(code: string): ASTNode[]
```

Parses OpenSCAD code and returns a structured Abstract Syntax Tree.

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Array of AST nodes representing the parsed code

**Throws:** Error if parsing fails or AST generation encounters unrecoverable errors

**Example:**
```typescript
const code = `
  difference() {
    cube([20, 20, 20], center=true);
    sphere(10);
  }
`;

const ast = parser.parseAST(code);
console.log('Generated AST nodes:', ast.length);

// Process AST nodes
ast.forEach(node => {
  console.log(`Node type: ${node.type}`);
  if (node.type === 'difference') {
    console.log(`Children: ${node.children.length}`);
  }
});
```

#### parse()

```typescript
parse(code: string): TreeSitter.Tree | null
```

Alias for `parseCST()` method for backward compatibility.

**Parameters:**
- `code`: The OpenSCAD source code to parse

**Returns:** Tree-sitter Tree object or null if parsing fails

#### update()

```typescript
update(newCode: string, startIndex: number, oldEndIndex: number, newEndIndex: number): TreeSitter.Tree | null
```

Performs incremental parsing by updating existing parse tree with new code.

**Parameters:**
- `newCode`: The updated OpenSCAD source code
- `startIndex`: Start position of the edit in the original code
- `oldEndIndex`: End position of the edit in the original code
- `newEndIndex`: End position of the edit in the new code

**Returns:** Updated Tree-sitter Tree object or null if parsing fails

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

#### updateAST()

```typescript
updateAST(newCode: string, startIndex: number, oldEndIndex: number, newEndIndex: number): ASTNode[]
```

Performs incremental parsing and generates a new AST from the updated parse tree.

**Parameters:**
- `newCode`: The updated OpenSCAD source code
- `startIndex`: Start position of the edit in the original code
- `oldEndIndex`: End position of the edit in the original code
- `newEndIndex`: End position of the edit in the new code

**Returns:** Array of AST nodes representing the updated parsed code

**Example:**
```typescript
const originalCode = 'cube(10);';
const originalAST = parser.parseAST(originalCode);

const updatedCode = 'cube(20);'; // Changed parameter
const startIndex = originalCode.indexOf('10');
const oldEndIndex = startIndex + 2; // '10' is 2 characters
const newEndIndex = startIndex + 2; // '20' is also 2 characters

const updatedAST = parser.updateAST(updatedCode, startIndex, oldEndIndex, newEndIndex);
```

#### dispose()

```typescript
dispose(): void
```

Cleans up parser resources and disposes of the Tree-sitter parser instance.

**Important:** Always call this method when finished with the parser to prevent memory leaks.

**Example:**
```typescript
const parser = new EnhancedOpenscadParser();
await parser.init();

try {
  const ast = parser.parseAST(code);
  // Process AST...
} finally {
  parser.dispose(); // Always clean up
}
```

## AST Node Types

The parser generates strongly-typed AST nodes. Here are the main node types:

### Base ASTNode

```typescript
interface ASTNode {
  type: string;
  location: NodeLocation;
  metadata?: any;
}
```

### Primitive Nodes

#### CubeNode
```typescript
interface CubeNode extends ASTNode {
  type: 'cube';
  size: number | [number, number, number];
  center: boolean;
}
```

#### SphereNode
```typescript
interface SphereNode extends ASTNode {
  type: 'sphere';
  radius: number;
  $fn?: number;
  $fa?: number;
  $fs?: number;
}
```

### CSG Nodes

#### DifferenceNode
```typescript
interface DifferenceNode extends ASTNode {
  type: 'difference';
  children: ASTNode[];
}
```

### Transform Nodes

#### TranslateNode
```typescript
interface TranslateNode extends ASTNode {
  type: 'translate';
  vector: [number, number, number];
  children: ASTNode[];
}
```

## Error Handling

The parser integrates with the error handling system to provide comprehensive error reporting:

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);

await parser.init();

try {
  const ast = parser.parseAST(invalidCode);
} catch (error) {
  // Check collected errors and warnings
  const errors = errorHandler.getErrors();
  const warnings = errorHandler.getWarnings();

  console.log('Parsing errors:', errors);
  console.log('Parsing warnings:', warnings);
}
```

## Performance Considerations

### Memory Usage
- Each parser instance uses approximately 5-10MB of memory
- AST generation adds minimal overhead (~10-20% of CST size)
- Proper disposal prevents memory leaks

### Parsing Speed
- Small files (<1KB): ~2ms
- Medium files (10KB): ~15ms
- Large files (100KB): ~120ms

### Best Practices

1. **Reuse Parser Instances**: Create one parser and reuse for multiple files
2. **Proper Cleanup**: Always call `dispose()` when finished
3. **Incremental Parsing**: Use `updateCode()` for small changes
4. **Error Handling**: Always wrap parsing in try-catch blocks

## Examples

See the [examples directory](../examples/) for comprehensive usage examples:

- [Basic Parsing](../examples/basic-parsing.ts)
- [Advanced Usage](../examples/advanced-parsing.ts)
- [Error Handling](../examples/error-handling.ts)
- [Performance Optimization](../examples/performance.ts)
