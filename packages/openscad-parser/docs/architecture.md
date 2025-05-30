# Architecture

This document provides a comprehensive technical deep dive into the OpenSCAD Parser architecture, design patterns, and implementation details.

## Overview

The OpenSCAD Parser follows a layered architecture that separates concerns and provides flexibility for different use cases. The design emphasizes type safety, performance, and maintainability.

## High-Level Architecture

```mermaid
graph TD
    A[OpenSCAD Source Code] --> B[Tree-sitter Parser]
    B --> C[Concrete Syntax Tree]
    C --> D[Enhanced Parser]
    D --> E[Visitor Chain]
    E --> F[PrimitiveVisitor]
    E --> G[TransformVisitor]
    E --> H[CSGVisitor]
    E --> I[ExpressionVisitor]
    F --> J[Structured AST]
    G --> J
    H --> J
    I --> J
    J --> K[Type-Safe AST Nodes]
    
    L[Error Handler] --> D
    L --> M[Error Collection]
    L --> N[Warning Collection]
    
    style A fill:#e1f5fe
    style K fill:#e8f5e8
    style L fill:#fff3e0
```

## Core Components

### 1. Parser Layer

The parser layer provides the foundation for OpenSCAD code processing:

```mermaid
classDiagram
    class OpenscadParser {
        -parser: TreeSitter.Parser
        -language: TreeSitter.Language
        +isInitialized: boolean
        +init(wasmPath?: string): Promise~void~
        +parse(code: string): TreeSitter.Tree
        +dispose(): void
    }
    
    class EnhancedOpenscadParser {
        -baseParser: OpenscadParser
        -errorHandler: IErrorHandler
        -visitors: BaseASTVisitor[]
        +init(): Promise~void~
        +parseCST(code: string): TreeSitter.Tree
        +parseAST(code: string): ASTNode[]
        +update(code, start, oldEnd, newEnd): TreeSitter.Tree
        +updateAST(code, start, oldEnd, newEnd): ASTNode[]
        +dispose(): void
    }
    
    OpenscadParser <|-- EnhancedOpenscadParser
```

#### Design Decisions

1. **Separation of Concerns**: Basic CST parsing is separated from AST generation
2. **Resource Management**: Explicit initialization and disposal for memory management
3. **Incremental Parsing**: Support for efficient updates to large documents
4. **Error Handling**: Pluggable error handling system

### 2. Visitor Pattern

The visitor pattern converts CST nodes to structured AST nodes:

```mermaid
classDiagram
    class BaseASTVisitor {
        <<abstract>>
        #errorHandler: IErrorHandler
        +visit(node: TreeSitter.SyntaxNode): ASTNode[]
        +visitStatement(node): ASTNode
        +visitExpression(node): ASTNode
        +visitBlock(node): ASTNode[]
        #createASTNodeForFunction(name, args): ASTNode
    }
    
    class PrimitiveVisitor {
        +visitAccessorExpression(node): ASTNode
        +createCubeNode(node): CubeNode
        +createSphereNode(node): SphereNode
        +createCylinderNode(node): CylinderNode
    }
    
    class TransformVisitor {
        +visitModuleInstantiation(node): ASTNode
        +createTranslateNode(node): TranslateNode
        +createRotateNode(node): RotateNode
        +createScaleNode(node): ScaleNode
    }
    
    class CSGVisitor {
        +visitModuleInstantiation(node): ASTNode
        +createUnionNode(node): UnionNode
        +createDifferenceNode(node): DifferenceNode
        +createIntersectionNode(node): IntersectionNode
    }
    
    class ExpressionVisitor {
        +visitExpression(node): ASTNode
        +visitBinaryExpression(node): BinaryExpressionNode
        +visitVariableReference(node): VariableNode
    }
    
    BaseASTVisitor <|-- PrimitiveVisitor
    BaseASTVisitor <|-- TransformVisitor
    BaseASTVisitor <|-- CSGVisitor
    BaseASTVisitor <|-- ExpressionVisitor
```

#### Visitor Chain Processing

```mermaid
sequenceDiagram
    participant EP as EnhancedParser
    participant PV as PrimitiveVisitor
    participant TV as TransformVisitor
    participant CV as CSGVisitor
    participant EV as ExpressionVisitor
    
    EP->>PV: visitStatement(node)
    PV->>PV: Check if primitive
    alt Is Primitive
        PV->>EP: Return PrimitiveNode
    else Not Primitive
        PV->>TV: Delegate to next visitor
        TV->>TV: Check if transform
        alt Is Transform
            TV->>EP: Return TransformNode
        else Not Transform
            TV->>CV: Delegate to next visitor
            CV->>CV: Check if CSG
            alt Is CSG
                CV->>EP: Return CSGNode
            else Not CSG
                CV->>EV: Delegate to next visitor
                EV->>EP: Return ExpressionNode or null
            end
        end
    end
```

### 3. AST Type System

The AST type system provides strong typing for OpenSCAD constructs:

```mermaid
classDiagram
    class ASTNode {
        <<interface>>
        +type: string
        +sourceLocation?: SourceLocation
    }
    
    class PrimitiveNode {
        <<interface>>
    }
    
    class TransformNode {
        <<interface>>
        +children: ASTNode[]
    }
    
    class CSGNode {
        <<interface>>
        +children: ASTNode[]
    }
    
    class CubeNode {
        +type: 'cube'
        +size: number | [number, number, number]
        +center: boolean
    }
    
    class SphereNode {
        +type: 'sphere'
        +radius: number
        +fa?: number
        +fs?: number
        +fn?: number
    }
    
    class TranslateNode {
        +type: 'translate'
        +vector: [number, number, number]
        +children: ASTNode[]
    }
    
    class UnionNode {
        +type: 'union'
        +children: ASTNode[]
    }
    
    ASTNode <|-- PrimitiveNode
    ASTNode <|-- TransformNode
    ASTNode <|-- CSGNode
    PrimitiveNode <|-- CubeNode
    PrimitiveNode <|-- SphereNode
    TransformNode <|-- TranslateNode
    CSGNode <|-- UnionNode
```

### 4. Error Handling System

```mermaid
classDiagram
    class IErrorHandler {
        <<interface>>
        +handleError(error: ParseError): void
        +handleWarning(warning: ParseWarning): void
        +getErrors(): ParseError[]
        +getWarnings(): ParseWarning[]
        +clear(): void
    }
    
    class SimpleErrorHandler {
        -errors: ParseError[]
        -warnings: ParseWarning[]
        +handleError(error): void
        +handleWarning(warning): void
        +getErrors(): ParseError[]
        +getWarnings(): ParseWarning[]
        +clear(): void
    }
    
    class ParseError {
        +message: string
        +line: number
        +column: number
        +severity: 'error'
        +code?: string
        +source?: string
    }
    
    class ParseWarning {
        +message: string
        +line?: number
        +column?: number
        +severity: 'warning'
        +code?: string
        +source?: string
    }
    
    IErrorHandler <|-- SimpleErrorHandler
    SimpleErrorHandler --> ParseError
    SimpleErrorHandler --> ParseWarning
```

## Data Flow

### Parsing Pipeline

```mermaid
flowchart TD
    A[OpenSCAD Code] --> B[Tree-sitter Parser]
    B --> C{Parse Success?}
    C -->|Yes| D[CST Generation]
    C -->|No| E[Syntax Errors]
    E --> F[Error Handler]
    D --> G[Enhanced Parser]
    G --> H[Visitor Chain]
    H --> I[AST Node Creation]
    I --> J[Type Validation]
    J --> K{Valid?}
    K -->|Yes| L[Structured AST]
    K -->|No| M[Semantic Errors]
    M --> F
    F --> N[Error Collection]
    L --> O[Final Result]
    N --> O
    
    style A fill:#e1f5fe
    style O fill:#e8f5e8
    style F fill:#ffebee
```

### Memory Management

```mermaid
sequenceDiagram
    participant U as User Code
    participant EP as EnhancedParser
    participant OP as OpenscadParser
    participant TS as Tree-sitter
    participant V as Visitors
    
    U->>EP: new EnhancedParser()
    EP->>OP: new OpenscadParser()
    U->>EP: init()
    EP->>OP: init()
    OP->>TS: Load WASM & Grammar
    EP->>V: Initialize visitors
    
    loop Parsing Operations
        U->>EP: parseAST(code)
        EP->>OP: parse(code)
        OP->>TS: parse(code)
        TS-->>OP: Tree
        OP-->>EP: Tree
        EP->>V: visit(tree.rootNode)
        V-->>EP: ASTNode[]
        EP-->>U: ASTNode[]
    end
    
    U->>EP: dispose()
    EP->>OP: dispose()
    OP->>TS: delete parser
    EP->>V: cleanup
```

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| CST Parsing | O(n) | Linear with input size |
| AST Generation | O(n) | Single pass through CST |
| Node Lookup | O(1) | Direct access via type guards |
| Tree Traversal | O(n) | Visits each node once |
| Incremental Update | O(log n) | Tree-sitter incremental parsing |

### Space Complexity

| Component | Space Usage | Notes |
|-----------|-------------|-------|
| CST | O(n) | Preserves all syntax information |
| AST | O(k) | Where k < n (structured representation) |
| Error Collection | O(e) | Where e = number of errors |
| Parser State | O(1) | Constant overhead |

### Optimization Strategies

1. **Parser Reuse**: Reuse parser instances for multiple operations
2. **Incremental Parsing**: Use tree-sitter's incremental parsing for large files
3. **Lazy Evaluation**: Generate AST nodes only when needed
4. **Memory Pooling**: Reuse AST node objects where possible

## Design Patterns

### 1. Visitor Pattern

**Purpose**: Separate AST node processing logic from node structure

**Benefits**:
- Easy to add new operations without modifying node classes
- Supports different processing strategies
- Maintains type safety

**Implementation**:
```typescript
abstract class BaseASTVisitor {
  abstract visit(node: TreeSitter.SyntaxNode): ASTNode | null;
  
  protected visitChildren(node: TreeSitter.SyntaxNode): ASTNode[] {
    const results: ASTNode[] = [];
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child) {
        const result = this.visit(child);
        if (result) results.push(result);
      }
    }
    return results;
  }
}
```

### 2. Chain of Responsibility

**Purpose**: Allow multiple visitors to process the same node

**Benefits**:
- Flexible processing pipeline
- Easy to add/remove processors
- Fail-safe delegation

### 3. Factory Pattern

**Purpose**: Create appropriate AST nodes based on CST node types

**Benefits**:
- Centralized node creation logic
- Type-safe node instantiation
- Easy to extend with new node types

### 4. Strategy Pattern

**Purpose**: Different error handling strategies

**Benefits**:
- Pluggable error handling
- Different strategies for different contexts
- Easy testing with mock handlers

## Integration Points

### Tree-sitter Integration

```mermaid
graph LR
    A[OpenSCAD Grammar] --> B[tree-sitter-openscad]
    B --> C[WASM Binary]
    C --> D[OpenscadParser]
    D --> E[CST]
    E --> F[EnhancedParser]
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style E fill:#f3e5f5
```

### Monorepo Integration

```mermaid
graph TD
    A[packages/tree-sitter-openscad] --> B[Grammar Definition]
    B --> C[WASM Build]
    C --> D[packages/openscad-parser]
    D --> E[TypeScript Parser]
    E --> F[packages/openscad-editor]
    E --> G[packages/openscad-demo]
    
    style A fill:#e8f5e8
    style D fill:#e1f5fe
    style F fill:#fff3e0
    style G fill:#f3e5f5
```

## Testing Architecture

### Real Parser Pattern

The library follows the "Real Parser Pattern" for testing:

```mermaid
sequenceDiagram
    participant T as Test
    participant P as Parser
    participant TS as Tree-sitter
    
    T->>P: new EnhancedParser()
    T->>P: init()
    P->>TS: Load real WASM
    
    loop Each Test
        T->>P: parseAST(testCode)
        P->>TS: Real parsing
        TS-->>P: Real CST
        P-->>T: Real AST
        T->>T: Assert on real results
    end
    
    T->>P: dispose()
    P->>TS: Cleanup real resources
```

**Benefits**:
- Tests real integration between components
- Catches actual parsing issues
- Provides confidence in production behavior
- No mock maintenance overhead

## Extension Points

### Custom Visitors

```typescript
class CustomVisitor extends BaseASTVisitor {
  visit(node: TreeSitter.SyntaxNode): ASTNode | null {
    // Custom processing logic
    switch (node.type) {
      case 'custom_construct':
        return this.createCustomNode(node);
      default:
        return super.visit(node);
    }
  }
  
  private createCustomNode(node: TreeSitter.SyntaxNode): CustomNode {
    // Custom node creation
  }
}
```

### Custom Error Handlers

```typescript
class LoggingErrorHandler implements IErrorHandler {
  handleError(error: ParseError): void {
    console.error(`Parse error: ${error.message}`);
    // Send to logging service
  }
  
  handleWarning(warning: ParseWarning): void {
    console.warn(`Parse warning: ${warning.message}`);
  }
  
  // ... other methods
}
```

### Custom AST Nodes

```typescript
interface CustomNode extends ASTNode {
  type: 'custom';
  customProperty: string;
}

function isCustomNode(node: ASTNode): node is CustomNode {
  return node.type === 'custom';
}
```

## Future Considerations

### Scalability

1. **Streaming Parser**: For very large files
2. **Worker Thread Support**: Offload parsing to web workers
3. **Caching**: Cache parsed results for unchanged code
4. **Lazy Loading**: Load grammar modules on demand

### Extensibility

1. **Plugin System**: Allow third-party extensions
2. **Custom Grammars**: Support for OpenSCAD extensions
3. **Multiple Backends**: Support different parsing engines
4. **Language Server**: IDE integration capabilities
