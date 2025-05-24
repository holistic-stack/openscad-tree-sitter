# Error Handling Implementation Plan

## Overview
This document outlines the implementation strategy for error handling in the OpenSCAD Tree-sitter Parser. The goal is to create a robust, maintainable, and user-friendly error handling system that provides meaningful feedback and enables graceful recovery from common errors.

## Error Handling Architecture

### 1. Error Type Hierarchy

```typescript
// Base error class
export class ParserError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public severity: Severity = Severity.ERROR,
    public context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'ParserError';
    // Capture stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getFormattedMessage(): string {
    // Format error message with context
    return `${this.severity}: [${this.code}] ${this.message}`;
  }
}

// Specific error types
export class SyntaxError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.SYNTAX_ERROR, Severity.ERROR, context);
    this.name = 'SyntaxError';
  }
}

export class TypeError extends ParserError {
  constructor(message: string, context: ErrorContext = {}) {
    super(message, ErrorCode.TYPE_ERROR, Severity.ERROR, context);
    this.name = 'TypeError';
  }
}
```

### 2. Error Context

```typescript
interface ErrorContext {
  line?: number;
  column?: number;
  source?: string;        // Source code snippet
  nodeType?: string;      // Type of the node where error occurred
  expected?: string[];    // Expected token/node types
  found?: string;         // What was actually found
  suggestion?: string;    // Suggested fix
  helpUrl?: string;       // Link to documentation
}

enum Severity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

enum ErrorCode {
  // Syntax errors (100-199)
  SYNTAX_ERROR = 'E100',
  UNEXPECTED_TOKEN = 'E101',
  MISSING_SEMICOLON = 'E102',
  UNCLOSED_BRACKET = 'E103',
  
  // Type errors (200-299)
  TYPE_ERROR = 'E200',
  TYPE_MISMATCH = 'E201',
  INVALID_OPERATION = 'E202',
  
  // Reference errors (300-399)
  REFERENCE_ERROR = 'E300',
  UNDEFINED_VARIABLE = 'E301',
  UNDEFINED_FUNCTION = 'E302',
  
  // Validation errors (400-499)
  VALIDATION_ERROR = 'E400',
  INVALID_ARGUMENTS = 'E401',
  INVALID_MODIFIER = 'E402'
}
```

### 3. Recovery Strategies

```typescript
interface RecoveryStrategy {
  canHandle(error: ParserError): boolean;
  recover(error: ParserError, code: string): string | null;
  getRecoverySuggestion(error: ParserError): string | null;
}

class MissingSemicolonStrategy implements RecoveryStrategy {
  canHandle(error: ParserError): boolean {
    return error instanceof SyntaxError && 
           error.context.nodeType === ';' &&
           error.message.includes('missing');
  }
  
  recover(error: ParserError, code: string): string | null {
    const { line, column } = error.context;
    if (line === undefined || column === undefined) return null;
    
    const lines = code.split('\n');
    if (line >= lines.length) return null;
    
    // Insert semicolon at the end of the line
    const lineContent = lines[line - 1];
    const newLine = lineContent.trimEnd() + ';';
    lines[line - 1] = newLine;
    
    return lines.join('\n');
  }
  
  getRecoverySuggestion(error: ParserError): string {
    return 'Insert missing semicolon';
  }
}
```

### 4. Error Handler

```typescript
class ErrorHandler {
  private errors: ParserError[] = [];
  private recoveryStrategies: RecoveryStrategy[] = [];
  private logger: Logger;
  
  constructor(private options: ErrorHandlerOptions = {}) {
    this.logger = new Logger(options.logLevel);
    this.registerDefaultStrategies();
  }
  
  private registerDefaultStrategies(): void {
    this.registerStrategy(new MissingSemicolonStrategy());
    this.registerStrategy(new UnclosedBracketStrategy());
    this.registerStrategy(new UnknownIdentifierStrategy());
    this.registerStrategy(new TypeMismatchStrategy());
  }
  
  registerStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }
  
  report(error: ParserError): void {
    if (error.severity >= this.options.minSeverity) {
      this.errors.push(error);
      this.logger.log(error);
      
      if (this.options.throwOnError && error.severity >= Severity.ERROR) {
        throw error;
      }
    }
  }
  
  attemptRecovery(error: ParserError, code: string): string | null {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canHandle(error)) {
        try {
          const recoveredCode = strategy.recover(error, code);
          if (recoveredCode) {
            this.logger.info(`Applied recovery: ${strategy.getRecoverySuggestion(error)}`);
            return recoveredCode;
          }
        } catch (recoveryError) {
          this.logger.warn(`Recovery attempt failed: ${recoveryError.message}`);
        }
      }
    }
    return null;
  }
  
  getErrors(): ParserError[] {
    return [...this.errors];
  }
  
  clearErrors(): void {
    this.errors = [];
  }
  
  hasErrors(): boolean {
    return this.errors.some(e => e.severity >= Severity.ERROR);
  }
}
```

## Integration with Parser

### 1. Parser Initialization

```typescript
class OpenscadParser {
  private errorHandler: ErrorHandler;
  
  constructor(options: ParserOptions = {}) {
    this.errorHandler = new ErrorHandler({
      logLevel: options.logLevel || 'warn',
      throwOnError: options.throwOnError !== false,
      minSeverity: options.minSeverity || 'warning'
    });
  }
  
  // ... rest of the parser implementation
}
```

### 2. Error Reporting in Visitors

```typescript
class BinaryExpressionVisitor extends BaseVisitor {
  visitBinaryExpression(node: TSNode): ast.BinaryExpression {
    try {
      const left = this.visit(node.child(0));
      const operator = node.child(1)?.text || '';
      const right = this.visit(node.child(2));
      
      // Type checking
      if (!this.isValidOperation(left.type, operator, right.type)) {
        this.errorHandler.report(
          new TypeError(
            `Invalid operation: ${left.type} ${operator} ${right.type}`,
            {
              line: node.startPosition.row + 1,
              column: node.startPosition.column + 1,
              source: node.text,
              expected: ['matching types for operator'],
              found: `${left.type} ${operator} ${right.type}`
            }
          )
        );
      }
      
      return {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: this.getSourceLocation(node)
      };
    } catch (error) {
      // Handle visitor errors
      this.errorHandler.report(
        new ParserError(
          error.message,
          ErrorCode.VISITOR_ERROR,
          Severity.ERROR,
          {
            nodeType: node.type,
            source: node.text,
            line: node.startPosition.row + 1,
            column: node.startPosition.column + 1
          }
        )
      );
      // Return a placeholder to allow continuation
      return {
        type: 'ErrorExpression',
        message: 'Error in binary expression',
        loc: this.getSourceLocation(node)
      };
    }
  }
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  
  beforeEach(() => {
    errorHandler = new ErrorHandler({ throwOnError: false });
  });
  
  test('should report errors with correct severity', () => {
    const error = new SyntaxError('Test error', { line: 1, column: 1 });
    errorHandler.report(error);
    
    expect(errorHandler.getErrors()).toHaveLength(1);
    expect(errorHandler.hasErrors()).toBe(true);
  });
  
  test('should recover from missing semicolon', () => {
    const error = new SyntaxError('Missing semicolon', {
      line: 1,
      column: 10,
      nodeType: ';',
      message: 'missing semicolon'
    });
    
    const code = 'x = 5\ny = 10';
    const recovered = errorHandler.attemptRecovery(error, code);
    
    expect(recovered).toBe('x = 5;\ny = 10');
  });
});
```

### 2. Integration Tests

```typescript
describe('Parser Error Recovery', () => {
  let parser: OpenscadParser;
  
  beforeAll(async () => {
    parser = new OpenscadParser({
      throwOnError: false,
      minSeverity: 'warning'
    });
    await parser.init();
  });
  
  afterAll(() => {
    parser.dispose();
  });
  
  test('should recover from missing semicolon', () => {
    const code = 'x = 5\ny = 10';
    const ast = parser.parseAST(code);
    const errors = parser.getErrorHandler().getErrors();
    
    // Should have recovered and produced valid AST
    expect(ast).toBeDefined();
    // Should report the missing semicolon
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(ErrorCode.MISSING_SEMICOLON);
  });
});
```

## Implementation Plan

### Phase 1: Core Infrastructure (1-2 days)
1. Implement base error classes and type hierarchy
2. Set up error codes and severity levels
3. Create basic error context tracking
4. Implement logging system

### Phase 2: Recovery Strategies (2-3 days)
1. Implement common syntax error recoveries
2. Add type checking and validation
3. Implement reference resolution
4. Add suggestion system

### Phase 3: Integration (1-2 days)
1. Integrate with existing parser
2. Add error reporting to all visitors
3. Implement incremental parsing with error recovery
4. Add source map support

### Phase 4: Testing and Documentation (1-2 days)
1. Write comprehensive unit tests
2. Add integration tests
3. Document error codes and recovery strategies
4. Create user guide for error handling

## Performance Considerations

1. **Error Collection**:
   - Use lazy evaluation for expensive error context
   - Limit the number of errors collected (configurable)
   - Batch error reporting where possible

2. **Recovery Strategies**:
   - Cache recovery results
   - Implement quick checks before expensive operations
   - Use memoization for repeated operations

3. **Memory Management**:
   - Clear error state between parses
   - Use weak references for large context objects
   - Implement cleanup in dispose pattern
