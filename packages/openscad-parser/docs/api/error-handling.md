# Error Handling

This document provides comprehensive documentation for error handling in the OpenSCAD Parser library.

## Overview

The OpenSCAD Parser provides robust error handling through a flexible error handler system. Error handlers collect and manage parsing errors, warnings, and other diagnostic information during the parsing process.

## Error Handler Interface

### IErrorHandler

Base interface for all error handlers.

```typescript
interface IErrorHandler {
  handleError(error: ParseError): void;
  handleWarning(warning: ParseWarning): void;
  getErrors(): ParseError[];
  getWarnings(): ParseWarning[];
  clear(): void;
}
```

**Methods:**
- `handleError(error)`: Process a parsing error
- `handleWarning(warning)`: Process a parsing warning
- `getErrors()`: Retrieve all collected errors
- `getWarnings()`: Retrieve all collected warnings
- `clear()`: Clear all collected errors and warnings

## SimpleErrorHandler

Basic implementation of the error handler interface.

### Constructor

```typescript
const errorHandler = new SimpleErrorHandler();
```

Creates a new error handler instance that collects errors and warnings in memory.

### Methods

#### `handleError(error: ParseError): void`

Handle a parsing error by adding it to the internal collection.

**Parameters:**
- `error`: The parsing error to handle

#### `handleWarning(warning: ParseWarning): void`

Handle a parsing warning by adding it to the internal collection.

**Parameters:**
- `warning`: The parsing warning to handle

#### `getErrors(): ParseError[]`

Get all collected parsing errors.

**Returns:** Array of ParseError objects

#### `getWarnings(): ParseWarning[]`

Get all collected parsing warnings.

**Returns:** Array of ParseWarning objects

#### `clear(): void`

Clear all collected errors and warnings.

### Example Usage

```typescript
import { EnhancedOpenscadParser, SimpleErrorHandler } from '@openscad/parser';

const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);

await parser.init();

// Parse code with syntax errors
const invalidCode = 'cube([10, 20, 30);'; // Missing closing bracket

try {
  const ast = parser.parseAST(invalidCode);
  
  // Check for errors and warnings
  const errors = errorHandler.getErrors();
  const warnings = errorHandler.getWarnings();
  
  if (errors.length > 0) {
    console.log('Parsing errors found:');
    errors.forEach(error => {
      console.log(`- ${error.message} at line ${error.line}, column ${error.column}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('Parsing warnings:');
    warnings.forEach(warning => {
      console.log(`- ${warning.message}`);
    });
  }
} catch (error) {
  console.error('Critical parsing error:', error);
} finally {
  parser.dispose();
}
```

## Error Types

### ParseError

Represents a parsing error.

```typescript
interface ParseError {
  message: string;
  line: number;
  column: number;
  severity: 'error';
  code?: string;
  source?: string;
}
```

**Properties:**
- `message`: Human-readable error description
- `line`: Line number where error occurred (1-based)
- `column`: Column number where error occurred (1-based)
- `severity`: Always 'error' for ParseError
- `code` (optional): Error code for programmatic handling
- `source` (optional): Source code snippet where error occurred

### ParseWarning

Represents a parsing warning.

```typescript
interface ParseWarning {
  message: string;
  line?: number;
  column?: number;
  severity: 'warning';
  code?: string;
  source?: string;
}
```

**Properties:**
- `message`: Human-readable warning description
- `line` (optional): Line number where warning occurred
- `column` (optional): Column number where warning occurred
- `severity`: Always 'warning' for ParseWarning
- `code` (optional): Warning code for programmatic handling
- `source` (optional): Source code snippet where warning occurred

## Custom Error Handlers

You can create custom error handlers by implementing the `IErrorHandler` interface:

```typescript
class CustomErrorHandler implements IErrorHandler {
  private errors: ParseError[] = [];
  private warnings: ParseWarning[] = [];

  handleError(error: ParseError): void {
    // Custom error processing
    console.error(`[ERROR] ${error.message} at ${error.line}:${error.column}`);
    
    // Store error
    this.errors.push(error);
    
    // Send to external logging service
    this.sendToLoggingService(error);
  }

  handleWarning(warning: ParseWarning): void {
    // Custom warning processing
    console.warn(`[WARNING] ${warning.message}`);
    
    // Store warning
    this.warnings.push(warning);
  }

  getErrors(): ParseError[] {
    return [...this.errors]; // Return copy
  }

  getWarnings(): ParseWarning[] {
    return [...this.warnings]; // Return copy
  }

  clear(): void {
    this.errors = [];
    this.warnings = [];
  }

  private sendToLoggingService(error: ParseError): void {
    // Implementation for external logging
  }
}
```

## Error Recovery

The parser attempts to recover from errors and continue parsing when possible:

```typescript
const errorHandler = new SimpleErrorHandler();
const parser = new EnhancedOpenscadParser(errorHandler);

await parser.init();

const codeWithErrors = `
  cube(10);           // Valid
  sphere([5, 10);     // Error: invalid sphere parameters
  cylinder(h=20, r=5); // Valid - parser recovers
`;

const ast = parser.parseAST(codeWithErrors);

// AST may contain partial results
console.log(`Generated ${ast.length} AST nodes`);

// Check errors
const errors = errorHandler.getErrors();
console.log(`Found ${errors.length} errors`);

errors.forEach(error => {
  console.log(`Error: ${error.message} at line ${error.line}`);
});
```

## Error Codes

Common error codes that may be encountered:

### Syntax Errors
- `SYNTAX_ERROR`: General syntax error
- `MISSING_BRACKET`: Missing opening or closing bracket
- `MISSING_SEMICOLON`: Missing semicolon
- `UNEXPECTED_TOKEN`: Unexpected token in input

### Semantic Errors
- `INVALID_PARAMETER`: Invalid parameter value
- `MISSING_PARAMETER`: Required parameter missing
- `TYPE_MISMATCH`: Parameter type doesn't match expected type
- `UNDEFINED_VARIABLE`: Reference to undefined variable

### Warning Codes
- `DEPRECATED_SYNTAX`: Use of deprecated syntax
- `UNUSED_VARIABLE`: Variable defined but not used
- `PERFORMANCE_WARNING`: Code that may have performance implications

## Testing Error Handling

When testing error handling, use the Real Parser Pattern:

```typescript
describe('Error Handling', () => {
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

  it('should handle syntax errors gracefully', () => {
    const invalidCode = 'cube([10, 20, 30);'; // Missing closing bracket
    
    // Parser should not throw, but collect errors
    const ast = parser.parseAST(invalidCode);
    
    const errors = errorHandler.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('bracket');
  });

  it('should collect multiple errors', () => {
    const multipleErrors = `
      cube([10, 20);     // Error 1: incomplete vector
      sphere(;           // Error 2: missing parameter
      cylinder(h=20, r=; // Error 3: incomplete parameter
    `;
    
    parser.parseAST(multipleErrors);
    
    const errors = errorHandler.getErrors();
    expect(errors.length).toBe(3);
  });

  it('should clear errors between parses', () => {
    parser.parseAST('invalid(');
    expect(errorHandler.getErrors().length).toBeGreaterThan(0);
    
    errorHandler.clear();
    expect(errorHandler.getErrors().length).toBe(0);
    expect(errorHandler.getWarnings().length).toBe(0);
  });
});
```

## Best Practices

### Error Handler Lifecycle

1. **Create error handler** before parser initialization
2. **Pass to parser** during construction
3. **Check for errors** after parsing operations
4. **Clear errors** between parsing sessions if reusing handler
5. **Handle errors appropriately** based on application needs

### Error Reporting

```typescript
function reportErrors(errorHandler: IErrorHandler): void {
  const errors = errorHandler.getErrors();
  const warnings = errorHandler.getWarnings();

  if (errors.length > 0) {
    console.group('Parsing Errors:');
    errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error.message}`);
      if (error.line && error.column) {
        console.error(`   Location: line ${error.line}, column ${error.column}`);
      }
      if (error.source) {
        console.error(`   Source: ${error.source}`);
      }
    });
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group('Parsing Warnings:');
    warnings.forEach((warning, index) => {
      console.warn(`${index + 1}. ${warning.message}`);
    });
    console.groupEnd();
  }
}
```

### Error Recovery Strategies

1. **Continue parsing** after recoverable errors
2. **Provide partial results** when possible
3. **Collect all errors** in a single pass
4. **Offer suggestions** for common mistakes
5. **Maintain source location** information for debugging
