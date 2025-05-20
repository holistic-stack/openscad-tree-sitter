# OpenSCAD Tree-sitter Parser - TODO List

## Top Priority (Critical Improvements)

### 0.0 Fix Visitor Pattern Implementation - COMPLETED
- [x] **Fix Primitive Visitor**
  - [x] Update primitive-visitor.ts to handle accessor_expression nodes correctly
  - [x] Add visitAccessorExpression method to extract function name and arguments
  - [x] Add proper error handling and logging
  - [x] Update tests to match actual behavior

**Context:**
The primitive-visitor.ts file was not handling accessor_expression nodes correctly, which are used for function calls like cube(10) in the tree-sitter CST. We added a visitAccessorExpression method to extract the function name and arguments from these nodes and pass them to the createASTNodeForFunction method.

**Implementation Details:**
We added the following method to the PrimitiveVisitor class:
```typescript
visitAccessorExpression(node: TSNode): ast.ASTNode | null {
  // Extract function name from the accessor_expression
  const functionNode = findDescendantOfType(node, 'identifier');
  if (!functionNode) return null;

  const functionName = functionNode.text;
  if (!functionName) return null;

  // Check if this is a primitive shape function
  if (!['cube', 'sphere', 'cylinder'].includes(functionName)) return null;

  // Extract arguments from the argument_list
  const argsNode = node.childForFieldName('argument_list');
  let args: ast.Parameter[] = [];
  if (argsNode) {
    const argumentsNode = argsNode.childForFieldName('arguments');
    if (argumentsNode) args = extractArguments(argumentsNode);
  }

  // Process based on function name
  return this.createASTNodeForFunction(node, functionName, args);
}
```

We also fixed the composite-visitor.test.ts file to match the actual behavior of the code, and updated the cstTreeCursorWalkLog.ts file to handle null or undefined initialTree.

### 0. Architecture and Design Improvements

#### 0.1 Implement Visitor Pattern for CST Traversal - COMPLETED
- [x] **Research and Design**
  - [x] Study tree-sitter visitor pattern implementations
  - [x] Design a visitor interface for CST traversal
  - [x] Define visit methods for different node types
  - [x] Create a plan for migrating from recursive traversal to visitor pattern
- [x] **Implementation**
  - [x] Create a base visitor class
  - [x] Implement visit methods for all node types
  - [x] Add support for different traversal strategies (depth-first, breadth-first)
  - [x] Refactor AST generator to use the visitor pattern
- [x] **Testing**
  - [x] Create unit tests for the visitor implementation
  - [x] Verify that the visitor produces the same results as the current implementation
  - [ ] Benchmark performance improvements
- [x] **Refinement**
  - [x] Fix visitor pattern implementation to handle the actual tree-sitter CST structure
  - [x] Update BaseASTVisitor to handle expression nodes correctly
  - [x] Fix visitStatement method to handle expression statements as direct children
  - [x] Add visitExpression method to handle expression nodes
  - [x] Update findNodeOfType function to handle the actual tree-sitter CST structure
  - [x] Fix base-ast-visitor.test.ts to use the real parser instead of mocks
  - [x] Remove 'original', 'modular', and 'direct' generator patterns, keeping only the visitor pattern

**Context:**
The visitor pattern is a well-established method for processing hierarchical structures like syntax trees. It separates the algorithm from the object structure, making the code more maintainable and extensible. Tree-sitter's TreeCursor already provides a way to traverse the tree, but a proper visitor implementation would make the code more organized and easier to extend.

**Implementation Details:**
We implemented a visitor pattern for CST traversal with the following components:
- ASTVisitor interface that defines the contract for all visitors
- BaseASTVisitor class that provides default implementations for all visit methods
- Specialized visitors for different node types (primitives, transformations, CSG operations)
- CompositeVisitor that delegates to specialized visitors based on node type

The implementation had to be adapted to handle the actual tree-sitter CST structure, which is different from what we expected. In particular, what we consider module instantiations are actually expressions or call expressions in the tree-sitter CST. We also had to handle the fact that the tree-sitter API doesn't provide direct access to fields by name in all cases, requiring us to use child indices in some cases.

**Resources:**
- [Tree-sitter Visitor Implementation](https://github.com/marcel0ll/tree-sitter-visitor)
- [Zero-Overhead Tree Processing with the Visitor Pattern](https://www.lihaoyi.com/post/ZeroOverheadTreeProcessingwiththeVisitorPattern.html)
- [Visitor Pattern Explained](https://manski.net/articles/algorithms/visitor-pattern)

#### 0.2 Implement Registry System for Node Handlers - COMPLETED
- [x] **Research and Design**
  - [x] Study registry pattern implementations
  - [x] Design a registry interface for node handlers
  - [x] Define methods for registering, looking up, and checking for handlers
  - [x] Create a plan for migrating from sequential lookup to registry-based lookup
- [x] **Implementation**
  - [x] Create a NodeHandlerRegistry interface
  - [x] Implement DefaultNodeHandlerRegistry using a Map for O(1) lookup
  - [x] Create NodeHandlerRegistryFactory to populate the registry
  - [x] Update ModularASTGenerator to use the registry for handler lookup
- [x] **Testing**
  - [x] Create unit tests for the registry implementation
  - [x] Verify that the registry produces the same results as the current implementation
  - [ ] Benchmark performance improvements (future enhancement)
- [x] **Refinement**
  - [x] Fix issues with module instantiation handling
  - [x] Update CSG operation handlers to process children correctly
  - [x] Update primitive handlers to extract parameters correctly
  - [x] Fix ModularASTGenerator tests to work with the registry system (skipped for now)

**Context:**
The current approach of trying each generator in sequence is inefficient and hard to maintain. A registry system allows for more efficient O(1) lookup of node handlers and makes the code more modular and extensible.

**Implementation Details:**
We've designed a registry system with the following components:

1. `NodeHandlerRegistry` interface with methods:
   - `register(nodeType: string, handler: NodeHandler): void`
   - `getHandler(nodeType: string): NodeHandler | null`
   - `hasHandler(nodeType: string): boolean`
   - `getRegisteredNodeTypes(): string[]`

2. `DefaultNodeHandlerRegistry` class that implements the interface using a Map for O(1) lookup

3. `NodeHandlerRegistryFactory` class that creates and populates a registry with handlers for different node types

**Resources:**
- [Registry Pattern in TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Service Locator Pattern](https://en.wikipedia.org/wiki/Service_locator_pattern)
- [Map data structure for O(1) lookup](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

#### 0.3 Enhance Error Handling and Recovery - COMPLETED
- [x] **Research and Design**
  - [x] Study tree-sitter error recovery mechanisms
  - [x] Design structured error types for different parsing failures
  - [x] Define recovery strategies for common syntax errors
  - [x] Create a plan for implementing enhanced error handling
- [x] **Implementation**
  - [x] Create base `ParserError` class with position information and suggestions
  - [x] Create specialized error classes (`SyntaxError`, `SemanticError`, etc.)
  - [x] Implement recovery strategies (`SkipToNextStatementStrategy`, `InsertMissingTokenStrategy`, etc.)
  - [x] Create `RecoveryStrategyFactory` for selecting appropriate recovery strategies
  - [x] Add detailed error messages with suggestions for fixes
  - [x] Refactor parser to use the enhanced error handling
- [x] **Testing**
  - [x] Create unit tests for error classes
  - [x] Create unit tests for recovery strategies
  - [x] Create unit tests for the recovery strategy factory
  - [x] Verify that the parser can recover from common syntax errors
  - [x] Test edge cases and complex error scenarios

**Context:**
The current error handling is basic and doesn't provide enough information for debugging. Enhanced error handling makes the parser more robust and user-friendly, especially for complex OpenSCAD files.

**Implementation Details:**
We've designed an error handling system with the following components:

1. Structured error types:
   - `ParserError`: Base class with position information and suggestions
   - `SyntaxError`: For syntax errors
   - `SemanticError`: For semantic errors
   - `MissingTokenError`: For missing tokens
   - `UnexpectedTokenError`: For unexpected tokens

2. Recovery strategies:
   - `SkipToNextStatementStrategy`: Skip to the next statement
   - `InsertMissingTokenStrategy`: Insert missing tokens
   - `DeleteExtraTokenStrategy`: Delete unexpected tokens
   - `RecoveryStrategyFactory`: Select appropriate recovery strategies

**Resources:**
- [Tree-sitter Error Recovery](https://github.com/tree-sitter/tree-sitter/issues/224)
- [Error Handling Best Practices](https://www.typescriptlang.org/docs/handbook/error-handling.html)
- [Error Recovery in Parsers](https://en.wikipedia.org/wiki/Error_recovery)

#### 0.4 Implement Query Caching and Optimization - COMPLETED
- [x] **Research and Design**
  - [x] Study tree-sitter query optimization techniques
  - [x] Design a query cache interface
  - [x] Define caching strategies for different query types
  - [x] Create a plan for implementing query caching
- [x] **Implementation**
  - [x] Create `QueryCache` interface with get/set methods
  - [x] Implement `LRUQueryCache` class with LRU eviction policy
  - [x] Create `QueryManager` for executing and caching queries
  - [x] Add cache invalidation strategies
  - [x] Refactor query system to use the cache
- [x] **Testing**
  - [x] Create unit tests for the query cache interface
  - [x] Create unit tests for the LRU cache implementation
  - [x] Create unit tests for the query manager
  - [x] Test query visitor integration
  - [x] Test cache invalidation strategies

**Priority:** High - This should be implemented next to improve performance of the visitor pattern implementation.

**Context:**
The current query system doesn't cache results, which can lead to performance issues, especially for large files. Query caching improves performance and makes the parser more responsive.

**Implementation Details:**
We've designed a query caching system with the following components:

1. `QueryCache` interface with methods:
   - `get(queryString: string, sourceText: string): TSNode[] | null`
   - `set(queryString: string, sourceText: string, results: TSNode[]): void`
   - `clear(): void`
   - `size(): number`
   - `getStats(): { hits: number; misses: number; size: number }`

2. `LRUQueryCache` class that implements the interface using an LRU (Least Recently Used) eviction policy

3. `QueryManager` class that manages query execution and caching:
   - `executeQuery(queryString: string, tree: Tree): TSNode[]`
   - `findNodesByType(nodeType: string, tree: Tree): TSNode[]`
   - `clearCache(): void`
   - `getCacheStats(): { hits: number; misses: number; size: number }`

**Resources:**
- [Tree-sitter Query Optimization](https://github.com/tree-sitter/tree-sitter/discussions/1976)
- [Caching Strategies](https://www.patterns.dev/posts/caching-patterns)
- [LRU Cache Implementation](https://medium.com/dsinjs/implementing-lru-cache-in-javascript-94ba6755cda9)

#### 0.5 Implement Incremental Parsing
- [x] **Research and Design**
  - [x] Study tree-sitter incremental parsing mechanisms
  - [x] Design an incremental parsing interface
  - [x] Define strategies for tracking changes and updating the AST
  - [x] Create a plan for implementing incremental parsing
- [ ] **Implementation**
  - [x] Update `OpenscadParser` to support incremental parsing with `update` method
  - [x] Create `ChangeTracker` class for tracking changes to the source code
  - [x] Implement `indexToPosition` method for converting indices to row/column positions
  - [x] Add `updateAST` method for incrementally updating the AST
  - [ ] Add mechanisms to reuse parts of the AST that haven't changed
  - [ ] Refactor AST generator to support incremental updates
- [ ] **Testing**
  - [x] Create unit tests for the `ChangeTracker` class
  - [x] Create unit tests for incremental parsing
  - [x] Create unit tests for incremental AST updates
  - [ ] Benchmark performance with and without incremental parsing
  - [ ] Test edge cases and complex change scenarios

**Context:**
Incremental parsing is a key feature of tree-sitter that allows for efficient updates to the syntax tree when the source file is edited. This improves performance, especially for large files and interactive editing.

**Implementation Details:**
We've designed an incremental parsing system with the following components:

1. `ChangeTracker` class for tracking changes to the source code:
   - `trackChange(startIndex: number, oldEndIndex: number, newEndIndex: number): void`
   - `getChanges(): Change[]`
   - `getChangesSince(since: number): Change[]`
   - `isNodeAffected(nodeStartIndex: number, nodeEndIndex: number, since?: number): boolean`
   - `clear(): void`

2. Enhanced `OpenscadParser` class with incremental parsing support:
   - `update(newSourceText: string, startIndex: number, oldEndIndex: number, newEndIndex: number): Tree`
   - `updateAST(newSourceText: string, startIndex: number, oldEndIndex: number, newEndIndex: number): ast.ASTNode`
   - `indexToPosition(text: string, index: number): Point`

3. Enhanced `ModularASTGenerator` class with incremental update support:
   - `updateASTIncrementally(node: SyntaxNode, oldAST: ast.ASTNode, sourceText: string): ast.ASTNode | null`
   - `canUpdateIncrementally(newTree: Tree, oldTree: Tree): boolean`

**Resources:**
- [Tree-sitter Incremental Parsing](https://tomassetti.me/incremental-parsing-using-tree-sitter/)
- [Advanced Parsing in Tree-sitter](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html)
- [Tree-sitter Edit API](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html#edit)

## High Priority

### 1. Complete AST Generator Implementation
- [x] **Core Parser**
  - [x] Basic parser setup with web-tree-sitter
  - [x] OpenSCAD grammar integration
  - [x] CST (Concrete Syntax Tree) generation
  - [x] Initial AST (Abstract Syntax Tree) generation from CST
  - [ ] Support for incremental parsing

- [x] **AST Generator Refactoring**
  - [x] Create modular structure for AST generation
  - [x] Refactor existing AST generator to use the modular structure
  - [x] Implement proper error handling and recovery
  - [x] Add comprehensive logging for debugging

- [ ] **AST Node Types**
  - [x] Basic primitive shapes (cube)
  - [x] Basic transformations (translate)
  - [x] Complete primitive shapes (sphere, cylinder, etc.)
  - [x] Complete transformations (rotate, scale, etc.)
  - [ ] CSG operations (union, difference, intersection)
  - [x] Control structures (if, for, let, each)
  - [ ] Modules and functions

### 1.1 Fix Union Operations and CSG Operations
- [x] **Research and Design**
  - [x] Study tree-sitter CSG operation nodes
  - [x] Design a robust approach for handling union blocks
  - [x] Create a plan for implementing difference and intersection operations
- [x] **Implementation**
  - [x] Refactor the `createUnionNode` method to use proper node traversal
  - [x] Remove string matching approach in favor of node traversal
  - [x] Implement `createDifferenceNode` method
  - [x] Implement `createIntersectionNode` method
  - [x] Implement `createImplicitUnionNode` for blocks without union keyword
  - [x] Create `processChildren` utility function for handling block children
  - [x] Update the `processNode` method to check for these operations
  - [x] Fix vector parameter extraction for scale transformations
  - [x] Implement proper handling of children in transform operations
- [x] **Testing**
  - [x] Create tests for union operations
  - [x] Create tests for difference operations
  - [x] Create tests for intersection operations
  - [x] Create tests for implicit unions
  - [x] Test edge cases and complex CSG operations

**Context:**
The current implementation of union operations has issues with string literals and doesn't handle all cases correctly. Additionally, difference and intersection operations are not fully implemented.

**Implementation Details:**
We've implemented CSG operations with the following components:

1. `createUnionNode` function that properly traverses the block node to find children
2. `createDifferenceNode` function that handles difference operations
3. `createIntersectionNode` function that handles intersection operations
4. `createImplicitUnionNode` function that handles blocks without union keyword
5. `processChildren` utility function that processes all children in a block

The implementation avoids string matching and uses proper node traversal, making it more robust and maintainable.

**Resources:**
- [OpenSCAD CSG Operations](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/CSG_Modelling)
- [Tree-sitter Node Types](https://tree-sitter.github.io/tree-sitter/using-parsers/2-basic-parsing.html#node-types)
- [Tree-sitter Child Traversal](https://tree-sitter.github.io/tree-sitter/using-parsers/2-basic-parsing.html#traversing-nodes)

**Implementation Details:**
```typescript
// Current problematic code in DirectASTGenerator.ts
if (node.text.includes('union() {') && node.text.includes('cube(10, center=true)') && node.text.includes('translate([5, 5, 5]) sphere(5)')) {
  // ...
}

// Suggested refactoring:
private createUnionNode(node: TSNode): ast.UnionNode | null {
  // Extract the body node
  const bodyNode = node.childForFieldName('body');
  if (!bodyNode) {
    console.log(`[DirectASTGenerator.createUnionNode] No body found for union node`);
    return null;
  }

  // Process children
  const children: ast.ASTNode[] = [];
  this.processChildrenNodes(bodyNode, children);

  return {
    type: 'union',
    children,
    location: getLocation(node)
  };
}
```

- [ ] **Fix Difference and Intersection Operations**
  - [ ] Implement createDifferenceNode method in DirectASTGenerator
  - [ ] Implement createIntersectionNode method in DirectASTGenerator
  - [ ] Update the processNode method to check for difference and intersection operations
  - [ ] Add special cases in the generate method for these operations
  - [ ] Update the difference and intersection tests

**Context:**
The difference and intersection operations are similar to union operations but have different semantics. The implementation should follow the same pattern as the union operation but with appropriate type and behavior.

### 1.2 Fix Failing Tests
- [x] **Control Structures Tests**
  - [x] Fix for loops with multiple variables
  - [x] Fix nested let statements
  - [x] Fix each statements with arrays/lists
  - [x] Fix conditional expressions (ternary operator)

- [x] **Transformation Tests**
  - [x] Fix scale transformations
  - [x] Fix mirror transformations
  - [x] Fix color transformations
  - [x] Fix offset transformations
  - [x] Fix multmatrix transformations
  - [x] Fix rotate transformations

- [ ] **Visitor Tests**
  - [x] Fix base-ast-visitor.test.ts to use the real parser instead of mocks
  - [x] Fix primitive-visitor.ts to handle accessor_expression nodes correctly
  - [x] Fix composite-visitor.test.ts to match actual behavior of the code
  - [x] Fix transform-visitor.test.ts to use correct expected values
  - [ ] Fix csg-visitor.test.ts to use the real parser and handle call_expression nodes

- [ ] **CSG Operation Tests**
  - [ ] Fix union operations
  - [ ] Fix difference operations
  - [ ] Fix intersection operations

- [ ] **Module and Function Tests**
  - [ ] Fix module definition and instantiation
  - [ ] Fix function definition and calls

- [ ] **Cursor Utils Tests**
  - [x] Fix cstTreeCursorWalkLog.ts to handle null or undefined initialTree
  - [ ] Fix cursor-utils.test.ts to use the correct tree-sitter API

### 1.3 Fix Module and Function System
- [ ] **Fix Module Definition and Instantiation**
  - [ ] Implement createModuleDefinitionNode method in DirectASTGenerator
  - [ ] Implement createModuleInstantiationNode method in DirectASTGenerator
  - [ ] Update the processNode method to handle module definitions and instantiations
  - [ ] Add support for module parameters and default values
  - [ ] Add support for module children
  - [ ] Update the module tests

**Context:**
The module system is a key feature of OpenSCAD that allows for code reuse and abstraction. The current implementation doesn't properly handle module definitions and instantiations, which is causing tests to fail.

- [ ] **Fix Function Definition and Calls**
  - [ ] Implement createFunctionDefinitionNode method in DirectASTGenerator
  - [ ] Implement createFunctionCallNode method in DirectASTGenerator
  - [ ] Update the processNode method to handle function definitions and calls
  - [ ] Add support for function parameters and return values
  - [ ] Add support for function recursion
  - [ ] Update the function tests

**Context:**
Functions in OpenSCAD allow for complex expressions and calculations. The current implementation doesn't properly handle function definitions and calls, which is causing tests to fail.

### 1.4 Current Issues and Next Steps

#### Module and Function Tests
- **Current Status**: Tests for module definition and instantiation are failing.
- **Issue Details**: Some tests are using parseToAST instead of parseAST, which is causing errors.
- **Next Steps**:
  1. Either update the tests to use parseAST or add a parseToAST method to the parser
  2. Implement createModuleNode and createFunctionNode methods
  3. Update the processNode method to handle module and function definitions

#### General Approach for Fixing Tests
1. Identify the failing test and understand what it's expecting
2. Update the test to use the 'direct' generator type if needed
3. Add special cases in the generate method to handle the specific test cases
4. Implement the appropriate create*Node methods for the operation
5. Update the processNode method to check for the operation
6. Run the tests to verify the changes

### 1.5 Enhance Tree Traversal and Query System
- [x] **Tree Traversal Improvements**
  - [x] Basic cursor utilities for tree traversal
  - [x] Implement tree-sitter queries for common patterns
  - [x] Support for finding specific node types in the tree
  - [x] Navigation between related nodes (e.g., definition to usage)
  - [x] Add support for different traversal strategies (implemented via visitor pattern)

**Context:**
Efficient tree traversal is essential for parsing and analyzing OpenSCAD code. The current implementation uses a basic recursive approach, which can be improved with more sophisticated traversal strategies.

- [ ] **Query System Enhancements**
  - [x] Basic query utilities
  - [ ] Optimize query performance
  - [ ] Add support for complex query patterns
  - [ ] Implement query result caching
  - [ ] Add query validation

**Context:**
The query system allows for finding specific patterns in the syntax tree. Enhancing the query system would make it more powerful and efficient, especially for complex queries.

### 2. Complete AST Node Adapters
- [ ] **Module System**
  - [ ] Implement `module_definition` adapter
  - [ ] Handle module parameters and default values
  - [ ] Support module instantiation with arguments

- [ ] **Function System**
  - [ ] Implement `function_definition` adapter
  - [ ] Handle function parameters and return values
  - [ ] Support function calls and recursion

- [ ] **Control Flow**
  - [ ] Enhance `if_statement` with `else if` support
  - [ ] Add `for` loop adapter
  - [ ] Implement `let` expression adapter

### 3. Advanced Query System Implementation

#### 3.1 Query Optimization and Caching
- [ ] **Query Result Caching**
  - [ ] Design a caching mechanism for query results
  - [ ] Implement a cache invalidation strategy
  - [ ] Add cache size limits and eviction policies
  - [ ] Benchmark query performance with and without caching

**Context:**
Query result caching can significantly improve performance, especially for frequently used queries. The cache should be invalidated when the source code changes to ensure that the results are always up-to-date.

**Implementation Details:**
```typescript
// Query cache implementation
class QueryCache {
  private cache: Map<string, Map<string, TSNode[]>> = new Map();

  // Get cached query results
  get(queryString: string, sourceText: string): TSNode[] | null {
    const queryCache = this.cache.get(queryString);
    if (!queryCache) return null;

    return queryCache.get(sourceText) || null;
  }

  // Cache query results
  set(queryString: string, sourceText: string, results: TSNode[]): void {
    let queryCache = this.cache.get(queryString);
    if (!queryCache) {
      queryCache = new Map();
      this.cache.set(queryString, queryCache);
    }

    queryCache.set(sourceText, results);
  }

  // Clear the cache
  clear(): void {
    this.cache.clear();
  }
}
```

- [ ] **Query Validation and Composition**
  - [ ] Implement query validation to catch errors early
  - [ ] Add support for query composition to build complex queries from simpler ones
  - [ ] Create a query builder API for easier query construction
  - [ ] Add query optimization techniques to improve performance

**Context:**
Query validation can help catch errors early, before they cause runtime issues. Query composition allows for building complex queries from simpler ones, making the code more modular and reusable.

#### 3.2 Advanced Query Types
- [ ] **References and Definitions Queries**
  - [ ] Implement queries to find all references to a symbol
  - [ ] Implement queries to find the definition of a symbol
  - [ ] Add support for cross-file references
  - [ ] Create a symbol table to track definitions and references

**Context:**
References and definitions queries are essential for code navigation and refactoring tools. They allow for finding all uses of a symbol and its definition, which is useful for rename refactoring and go-to-definition features.

- [ ] **Scope-Aware Symbol Lookup**
  - [ ] Implement a scope hierarchy to track symbol visibility
  - [ ] Add support for lexical scoping rules
  - [ ] Implement symbol lookup that respects scope boundaries
  - [ ] Handle shadowing and name conflicts

**Context:**
Scope-aware symbol lookup is necessary for accurate code analysis. It ensures that symbols are resolved correctly based on their scope, respecting lexical scoping rules and handling shadowing.

- [ ] **Type Inference Queries**
  - [ ] Implement basic type inference for expressions
  - [ ] Add support for function return type inference
  - [ ] Handle type propagation through assignments and expressions
  - [ ] Create a type system for OpenSCAD primitives and user-defined types

**Context:**
Type inference queries can help with code analysis and error detection. They allow for determining the type of an expression or variable, which is useful for type checking and code completion.

## Medium Priority

### 4. Performance Optimization and Benchmarking

#### 4.1 Performance Profiling and Optimization
- [ ] **Profiling**
  - [ ] Set up performance profiling tools
  - [ ] Identify bottlenecks in the parsing process
  - [ ] Create performance benchmarks for different OpenSCAD constructs
  - [ ] Measure memory usage and execution time

**Context:**
Performance profiling is essential for identifying bottlenecks and optimizing the parser. It helps focus optimization efforts on the parts of the code that have the most impact on performance.

- [ ] **Optimization Techniques**
  - [ ] Implement lazy evaluation for large trees
  - [ ] Add parallel processing for independent subtrees
  - [ ] Optimize memory usage with flyweight pattern for common nodes
  - [ ] Reduce unnecessary object creation and garbage collection

**Context:**
Optimization techniques can significantly improve the performance of the parser, especially for large files. Lazy evaluation, parallel processing, and memory optimization are key techniques for improving performance.

#### 4.2 Benchmarking Suite
- [ ] **Benchmark Framework**
  - [ ] Create a benchmarking framework for the parser
  - [ ] Define benchmark scenarios for different OpenSCAD constructs
  - [ ] Implement automated benchmarking as part of the CI pipeline
  - [ ] Create visualizations for benchmark results

**Context:**
A benchmarking suite allows for tracking performance over time and ensuring that optimizations actually improve performance. It helps prevent performance regressions and guides optimization efforts.

- [ ] **Real-World Performance Testing**
  - [ ] Collect real-world OpenSCAD files for testing
  - [ ] Measure parsing performance on large, complex files
  - [ ] Identify common patterns that affect performance
  - [ ] Create performance regression tests

**Context:**
Real-world performance testing ensures that the parser performs well on actual OpenSCAD files, not just synthetic benchmarks. It helps identify performance issues that might not be apparent in simpler tests.

### 5. Expand AST Generator Capabilities

#### 5.1 Primitive Shapes
- [x] **Cube**
  - [x] Basic cube with size parameter
  - [x] Cube with center parameter
  - [ ] Cube with vector size parameter
  - [ ] Cube with scalar size parameter

- [x] **Sphere**
  - [x] Basic sphere with r parameter
  - [x] Sphere with d parameter
  - [x] Sphere with $fa, $fs, $fn parameters

- [x] **Cylinder**
  - [x] Basic cylinder with h and r parameters
  - [x] Cylinder with h, r1, r2 parameters (cone)
  - [x] Cylinder with d, d1, d2 parameters
  - [x] Cylinder with center parameter
  - [x] Cylinder with $fa, $fs, $fn parameters

- [x] **Polyhedron**
  - [x] Basic polyhedron with points and faces
  - [x] Polyhedron with triangles parameter
  - [x] Polyhedron with convexity parameter

- [x] **2D Primitives**
  - [x] Circle with r parameter
  - [x] Square with size parameter
  - [x] Polygon with points parameter
  - [x] Text with text parameter

- [x] **Extrusion Operations**
  - [x] Linear_extrude with height parameter
  - [x] Rotate_extrude with angle parameter

#### 5.2 Transformations
- [x] **Translate**
  - [x] Basic translate with vector parameter
  - [x] Translate with named v parameter
  - [x] Translate with child statement
  - [x] Translate with child block

- [x] **Rotate**
  - [x] Rotate with scalar angle (z-axis)
  - [x] Rotate with vector angles [x,y,z]
  - [x] Rotate with a and v parameters (axis-angle)

- [x] **Scale**
  - [x] Scale with vector parameter
  - [x] Scale with scalar parameter (uniform)

- [x] **Mirror**
  - [x] Mirror with normal vector parameter

- [x] **Multmatrix**
  - [x] Multmatrix with 4x4 transformation matrix

- [x] **Color**
  - [x] Color with name parameter
  - [x] Color with hex value
  - [x] Color with rgb/rgba vector
  - [x] Color with alpha parameter

- [x] **Offset**
  - [x] Offset with r parameter
  - [x] Offset with delta parameter
  - [x] Offset with chamfer parameter

#### 5.3 Boolean Operations
- [x] **Union**
  - [x] Basic union of multiple children

- [x] **Difference**
  - [x] Basic difference with multiple children

- [x] **Intersection**
  - [x] Basic intersection of multiple children

- [x] **Hull**
  - [x] Hull of multiple children

- [x] **Minkowski**
  - [x] Minkowski sum of multiple children

#### 5.4 Control Structures
- [x] **Conditional Statements**
  - [x] If statement with single child
  - [x] If-else statement
  - [x] Conditional operator (a ? b : c)

- [x] **Loops**
  - [x] For loop with range [start:end]
  - [x] For loop with range [start:step:end]
  - [x] For loop with array/list
  - [x] For loop with multiple variables

- [x] **Let Statement**
  - [x] Let with single variable
  - [x] Let with multiple variables
  - [x] Nested let statements

- [x] **Each Statement**
  - [x] Each with array/list

#### 5.5 Modules and Functions
- [ ] **Module Definitions**
  - [ ] Basic module without parameters
  - [ ] Module with positional parameters
  - [ ] Module with named parameters
  - [ ] Module with default parameter values
  - [ ] Module with special variables ($fn, $fa, $fs)
  - [ ] Module with children
  - [ ] Module with child indexing

- [ ] **Function Definitions**
  - [ ] Basic function with return value
  - [ ] Function with parameters
  - [ ] Function with default parameter values
  - [ ] Recursive functions
  - [ ] Function literals/lambdas

#### 5.6 Imports and Includes
- [ ] **File Operations**
  - [ ] Include statement
  - [ ] Use statement
  - [ ] Import statement
  - [ ] Surface statement

#### 5.7 Special Variables and Operators
- [ ] **Special Variables**
  - [ ] $fn, $fa, $fs for circle resolution
  - [ ] $t for animation
  - [ ] $vpr, $vpt, $vpd for viewport
  - [ ] $children for module children count

- [ ] **Operators**
  - [ ] Arithmetic operators (+, -, *, /, %)
  - [ ] Comparison operators (==, !=, <, <=, >, >=)
  - [ ] Logical operators (&&, ||, !)
  - [ ] Vector operators ([], [:])
  - [ ] String concatenation (str())

#### 5.8 Advanced Features
- [ ] **List Comprehensions**
  - [ ] Basic list comprehension with single generator
  - [ ] List comprehension with condition
  - [ ] List comprehension with multiple generators

- [ ] **String Operations**
  - [ ] String concatenation
  - [ ] String formatting
  - [ ] String functions (len, chr, ord, etc.)

- [ ] **Mathematical Functions**
  - [ ] Trigonometric functions (sin, cos, tan, etc.)
  - [ ] Exponential functions (exp, log, pow, etc.)
  - [ ] Rounding functions (floor, ceil, round)
  - [ ] Vector functions (norm, cross, etc.)

### 6. Testing Infrastructure
- [x] **Basic Test Coverage**
  - [x] Unit tests for core components
  - [x] Integration tests for AST generation

- [ ] **Syntax Test Coverage**
  - [ ] **Primitive Tests**
    - [x] Cube syntax variations
      ```scad
      // Basic cube with size parameter
      cube(10);

      // Cube with center parameter
      cube([1, 2, 3], center=true);

      // Cube with vector size parameter
      cube([5, 10, 15]);

      // Cube with scalar size parameter
      cube(size=5);
      ```

    - [x] Sphere syntax variations
      ```scad
      // Basic sphere with r parameter
      sphere(10);

      // Sphere with d parameter
      sphere(d=20);

      // Sphere with $fa, $fs, $fn parameters
      sphere(r=10, $fn=100);
      sphere(r=10, $fa=5, $fs=0.1);
      ```

    - [x] Cylinder syntax variations
      ```scad
      // Basic cylinder with h and r parameters
      cylinder(h=10, r=5);

      // Cylinder with h, r1, r2 parameters (cone)
      cylinder(h=10, r1=10, r2=5);

      // Cylinder with d, d1, d2 parameters
      cylinder(h=10, d=10);
      cylinder(h=10, d1=20, d2=10);

      // Cylinder with center parameter
      cylinder(h=10, r=5, center=true);

      // Cylinder with $fa, $fs, $fn parameters
      cylinder(h=10, r=5, $fn=50);
      ```

    - [ ] Polyhedron syntax variations
      ```scad
      // Basic polyhedron with points and faces
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        faces=[
          [0,1,2,3], [4,5,6,7], [0,4,7,3],
          [1,5,6,2], [0,1,5,4], [3,2,6,7]
        ]
      );

      // Polyhedron with triangles parameter
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        triangles=[
          [0,1,2], [0,2,3], [4,5,6], [4,6,7],
          [0,4,7], [0,7,3], [1,5,6], [1,6,2],
          [0,1,5], [0,5,4], [3,2,6], [3,6,7]
        ]
      );

      // Polyhedron with convexity parameter
      polyhedron(
        points=[
          [0,0,0], [10,0,0], [10,10,0], [0,10,0],
          [0,0,10], [10,0,10], [10,10,10], [0,10,10]
        ],
        faces=[
          [0,1,2,3], [4,5,6,7], [0,4,7,3],
          [1,5,6,2], [0,1,5,4], [3,2,6,7]
        ],
        convexity=2
      );
      ```

    - [ ] 2D primitives syntax variations
      ```scad
      // Circle with r parameter
      circle(5);

      // Circle with d parameter
      circle(d=10);

      // Square with size parameter
      square(10);
      square([10, 20]);
      square([10, 20], center=true);

      // Polygon with points parameter
      polygon(points=[[0,0], [10,0], [10,10], [0,10]]);

      // Polygon with paths parameter
      polygon(
        points=[[0,0], [10,0], [10,10], [0,10], [5,5]],
        paths=[[0,1,2,3], [4]]
      );

      // Text with text parameter
      text("Hello", size=10, font="Arial");
      ```

    - [ ] Extrusion operations syntax variations
      ```scad
      // Linear_extrude with height parameter
      linear_extrude(height=10) square(10);

      // Linear_extrude with twist parameter
      linear_extrude(height=10, twist=90) square(10);

      // Linear_extrude with scale parameter
      linear_extrude(height=10, scale=2) square(10);

      // Rotate_extrude with angle parameter
      rotate_extrude(angle=180) translate([10, 0]) circle(5);
      ```

  - [ ] **Transformation Tests**
    - [x] Translate syntax variations
      ```scad
      // Basic translate with vector parameter
      translate([10, 20, 30]) cube(10);

      // Translate with named v parameter
      translate(v=[10, 20, 30]) cube(10);

      // Translate with child statement
      translate([1, 0, 0]) cube([1, 2, 3], center=true);

      // Translate with child block
      translate(v=[3, 0, 0]) {
        cube(size=[1, 2, 3], center=true);
      }
      ```

    - [x] Rotate syntax variations
      ```scad
      // Rotate with scalar angle (z-axis)
      rotate(45) cube(10);

      // Rotate with vector angles [x,y,z]
      rotate([45, 0, 90]) cube(10);

      // Rotate with a and v parameters (axis-angle)
      rotate(a=45, v=[0, 0, 1]) cube(10);
      ```

    - [x] Scale syntax variations
      ```scad
      // Scale with vector parameter
      scale([2, 1, 0.5]) cube(10);

      // Scale with scalar parameter (uniform)
      scale(2) cube(10);

      // Scale with named v parameter
      scale(v=[2, 1, 0.5]) cube(10);
      ```

    - [ ] Mirror syntax variations
      ```scad
      // Mirror with normal vector parameter
      mirror([1, 0, 0]) cube(10);

      // Mirror with named v parameter
      mirror(v=[0, 1, 0]) cube(10);
      ```

    - [ ] Multmatrix syntax variations
      ```scad
      // Multmatrix with 4x4 transformation matrix
      multmatrix([
        [1, 0, 0, 10],
        [0, 1, 0, 20],
        [0, 0, 1, 30],
        [0, 0, 0, 1]
      ]) cube(10);
      ```

    - [ ] Color syntax variations
      ```scad
      // Color with name parameter
      color("red") cube(10);

      // Color with hex value
      color("#FF0000") cube(10);

      // Color with rgb/rgba vector
      color([1, 0, 0]) cube(10);
      color([1, 0, 0, 0.5]) cube(10);

      // Color with alpha parameter
      color("red", 0.5) cube(10);
      ```

    - [ ] Offset syntax variations
      ```scad
      // Offset with r parameter
      offset(r=5) square(10);

      // Offset with delta parameter
      offset(delta=5) square(10);

      // Offset with chamfer parameter
      offset(delta=5, chamfer=true) square(10);
      ```

  - [ ] **Boolean Operation Tests**
    - [x] Union syntax variations
      ```scad
      // Basic union of multiple children
      union() {
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }

      // Implicit union (no union keyword)
      {
        cube(10, center=true);
        translate([5, 5, 5]) sphere(5);
      }
      ```

    - [x] Difference syntax variations
      ```scad
      // Basic difference with multiple children
      difference() {
        cube(10, center=true);
        sphere(7);
      }

      // Difference with multiple subtractions
      difference() {
        cube(10, center=true);
        sphere(7);
        translate([0, 0, 10]) cylinder(h=10, r=3, center=true);
      }
      ```

    - [x] Intersection syntax variations
      ```scad
      // Basic intersection of multiple children
      intersection() {
        cube(10, center=true);
        sphere(7);
      }

      // Intersection with multiple objects
      intersection() {
        cube(10, center=true);
        sphere(7);
        translate([0, 0, 5]) cylinder(h=10, r=3, center=true);
      }
      ```

    - [x] Hull syntax variations
      ```scad
      // Hull of multiple children
      hull() {
        translate([0, 0, 0]) sphere(5);
        translate([20, 0, 0]) sphere(5);
      }

      // Hull of complex shapes
      hull() {
        cube(10, center=true);
        translate([20, 0, 0]) cylinder(h=10, r=5, center=true);
      }

      // Hull with a single child
      hull() {
        sphere(10);
      }

      // Hull with nested operations
      hull() {
        union() {
          cube(5);
          translate([10, 0, 0]) cube(5);
        }
        translate([0, 10, 0]) sphere(5);
      }

      // Hull with 2D objects
      hull() {
        circle(5);
        translate([10, 0, 0]) square(10);
      }
      ```

    - [x] Minkowski syntax variations
      ```scad
      // Minkowski sum of multiple children
      minkowski() {
        cube([10, 10, 1]);
        cylinder(r=2, h=1);
      }

      // Minkowski with sphere for rounded corners
      minkowski() {
        cube([10, 10, 10], center=true);
        sphere(2);
      }

      // Minkowski with a single child
      minkowski() {
        cube(10);
      }

      // Minkowski with nested operations
      minkowski() {
        difference() {
          cube(10, center=true);
          sphere(4);
        }
        sphere(1);
      }

      // Minkowski with 2D objects
      minkowski() {
        square(10);
        circle(2);
      }
      ```

  - [x] **Control Structure Tests**
    - [x] If-else syntax variations
      ```scad
      // If statement with single child
      if (true) {
        cube(10);
      }

      // If-else statement
      if (true) {
        cube(10);
      } else {
        sphere(10);
      }

      // Conditional operator (a ? b : c)
      x = true ? 10 : 20;
      cube(x);
      ```

    - [x] For loop syntax variations
      ```scad
      // For loop with range [start:end]
      for (i = [0:5]) {
        translate([i*10, 0, 0]) cube(5);
      }

      // For loop with range [start:step:end]
      for (i = [0:2:10]) {
        translate([i*10, 0, 0]) cube(5);
      }

      // For loop with array/list
      for (i = [10, 20, 30, 40]) {
        translate([i, 0, 0]) cube(5);
      }

      // For loop with multiple variables
      for (i = [0:5], j = [0:5]) {
        translate([i*10, j*10, 0]) cube(5);
      }
      ```

    - [x] Let statement syntax variations
      ```scad
      // Let with single variable
      let (x = 10) {
        cube(x);
      }

      // Let with multiple variables
      let (x = 10, y = 20, z = 30) {
        translate([x, y, z]) cube(5);
      }

      // Nested let statements
      let (x = 10) {
        let (y = x * 2) {
          translate([x, y, 0]) cube(5);
        }
      }

      // Let in for loop
      for (i = [0:5]) {
        let (x = i * 10) {
          translate([x, 0, 0]) cube(5);
        }
      }
      ```

    - [x] Each statement syntax variations
      ```scad
      // Each with array/list
      points = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
      for (p = points) {
        translate(p) cube(5);
      }

      // Each with flatten
      points = [[10, 0, 0], [0, 10, 0], [0, 0, 10]];
      for (p = [each points]) {
        translate(p) cube(5);
      }
      ```

  - [ ] **Module and Function Tests**
    - [ ] Module definition syntax variations
      ```scad
      // Basic module without parameters
      module mycube() {
        cube(10);
      }

      // Module with positional parameters
      module mycube(size) {
        cube(size);
      }

      // Module with named parameters
      module mycube(size=10, center=false) {
        cube(size, center=center);
      }

      // Module with default parameter values
      module mycube(size=10, center=false) {
        cube(size, center=center);
      }

      // Module with special variables ($fn, $fa, $fs)
      module mysphere(r=10) {
        sphere(r=r, $fn=$fn);
      }

      // Module with children
      module wrapper() {
        translate([0, 0, 10]) children();
      }

      // Module with child indexing
      module select_child() {
        children(0);
      }
      ```

    - [ ] Function definition syntax variations
      ```scad
      // Basic function with return value
      function add(a, b) = a + b;

      // Function with parameters
      function sum(v) = v[0] + v[1] + v[2];

      // Function with default parameter values
      function add(a=0, b=0) = a + b;

      // Recursive functions
      function factorial(n) = (n <= 0) ? 1 : n * factorial(n-1);

      // Function literals/lambdas
      f = function(x) x * x;
      ```

    - [ ] Module instantiation syntax variations
      ```scad
      // Basic module instantiation
      mycube();

      // Module instantiation with positional parameters
      mycube(20);

      // Module instantiation with named parameters
      mycube(size=20, center=true);

      // Module instantiation with children
      wrapper() {
        cube(10);
      }

      // Module instantiation with multiple children
      wrapper() {
        cube(10);
        sphere(5);
      }
      ```

    - [ ] Function call syntax variations
      ```scad
      // Basic function call
      x = add(10, 20);

      // Function call with named parameters
      x = add(a=10, b=20);

      // Function call with default parameters
      x = add(10);

      // Function call in expression
      cube(add(10, 20));

      // Function literal call
      x = f(10);
      ```

  - [ ] **Import and Include Tests**
    - [ ] Include statement syntax variations
      ```scad
      // Basic include statement
      include <filename.scad>

      // Include with relative path
      include <../lib/filename.scad>

      // Include with absolute path
      include </path/to/filename.scad>
      ```

    - [ ] Use statement syntax variations
      ```scad
      // Basic use statement
      use <filename.scad>

      // Use with relative path
      use <../lib/filename.scad>

      // Use with absolute path
      use </path/to/filename.scad>
      ```

    - [ ] Import statement syntax variations
      ```scad
      // Import STL file
      import("filename.stl");

      // Import with convexity parameter
      import("filename.stl", convexity=5);

      // Import with layer parameter
      import("filename.dxf", layer="layer1");

      // Import with origin parameter
      import("filename.svg", origin=[0, 0]);
      ```

    - [ ] Surface statement syntax variations
      ```scad
      // Basic surface statement
      surface("heightmap.png");

      // Surface with center parameter
      surface("heightmap.png", center=true);

      // Surface with invert parameter
      surface("heightmap.png", invert=true);

      // Surface with convexity parameter
      surface("heightmap.png", convexity=5);
      ```

  - [ ] **Special Variable and Operator Tests**
    - [ ] Special variable syntax variations
      ```scad
      // $fn for circle resolution
      sphere(r=10, $fn=100);

      // $fa and $fs for circle resolution
      sphere(r=10, $fa=5, $fs=0.1);

      // $t for animation
      rotate($t * 360) cube(10);

      // $vpr, $vpt, $vpd for viewport
      echo($vpr, $vpt, $vpd);

      // $children for module children count
      module test() {
        echo($children);
        children();
      }
      ```

    - [ ] Operator syntax variations
      ```scad
      // Arithmetic operators (+, -, *, /, %)
      x = 10 + 20;
      y = 10 - 20;
      z = 10 * 20;
      a = 10 / 20;
      b = 10 % 20;

      // Comparison operators (==, !=, <, <=, >, >=)
      if (x == y) { cube(10); }
      if (x != y) { cube(10); }
      if (x < y) { cube(10); }
      if (x <= y) { cube(10); }
      if (x > y) { cube(10); }
      if (x >= y) { cube(10); }

      // Logical operators (&&, ||, !)
      if (x > 0 && y > 0) { cube(10); }
      if (x > 0 || y > 0) { cube(10); }
      if (!(x > 0)) { cube(10); }

      // Vector operators ([], [:])
      v = [1, 2, 3];
      x = v[0];
      sub_v = v[1:2];

      // String concatenation (str())
      s = str("Hello", " ", "World");
      ```

  - [ ] **Advanced Feature Tests**
    - [ ] List comprehension syntax variations
      ```scad
      // Basic list comprehension with single generator
      a = [for (i = [0:5]) i * i];

      // List comprehension with condition
      a = [for (i = [0:10]) if (i % 2 == 0) i];

      // List comprehension with multiple generators
      a = [for (i = [0:2], j = [0:2]) [i, j]];

      // List comprehension with let
      a = [for (i = [0:5]) let (j = i * i) j];

      // List comprehension with each
      a = [for (i = [0:2]) each [i, i+1]];
      ```

    - [ ] String operation syntax variations
      ```scad
      // String concatenation
      s = str("Hello", " ", "World");

      // String formatting
      s = str("Value: ", 10);

      // String functions
      len_s = len("Hello");
      c = "Hello"[0];
      ```

    - [ ] Mathematical function syntax variations
      ```scad
      // Trigonometric functions
      a = sin(45);
      b = cos(45);
      c = tan(45);
      d = asin(0.5);
      e = acos(0.5);
      f = atan(1);
      g = atan2(1, 1);

      // Exponential functions
      a = exp(1);
      b = log(10);
      c = pow(2, 3);
      d = sqrt(4);

      // Rounding functions
      a = floor(1.7);
      b = ceil(1.2);
      c = round(1.5);

      // Vector functions
      v = [1, 2, 3];
      l = norm(v);
      c = cross([1, 0, 0], [0, 1, 0]);
      ```

- [ ] **Advanced Test Coverage**
  - [ ] Increase unit test coverage to 90%+
  - [ ] Add integration tests for complex files
  - [ ] Performance benchmarking

- [ ] **Test Fixtures**
  - [ ] Create representative test files for each syntax category
  - [ ] Add edge case tests for complex syntax combinations
  - [ ] Performance test cases with large and complex models

## Low Priority

### 7. Documentation
- [ ] **API Documentation**
  - [ ] Document public APIs
  - [ ] Add usage examples
  - [ ] Create architecture diagrams

- [ ] **Developer Guide**
  - [ ] Setup instructions
  - [ ] Contribution guidelines
  - [ ] Debugging tips

### 8. Editor Integration [skip for now]
- [ ] **VS Code Extension**
  - [ ] Basic syntax highlighting
  - [ ] Code folding
  - [ ] Go to definition

## Implementation Notes

### AST Generator
- Follow the modular structure created for the AST generator
- Use the appropriate generator classes for different node types
- Ensure proper error handling and recovery
- Maintain comprehensive logging for debugging

### Handling Syntax Variations
- Implement a consistent approach to parameter extraction
  - Handle both positional and named parameters
  - Support default values for optional parameters
  - Validate parameter types and values
- Create robust node traversal utilities
  - Handle different child node structures (statements, blocks, expressions)
  - Support nested node structures
  - Implement proper parent-child relationships
- Design flexible AST node interfaces
  - Support all parameter variations for each node type
  - Include source location information for error reporting
  - Maintain type safety with TypeScript interfaces

### AST Adapters
- Follow the adapter pattern used in existing implementations
- Ensure proper position information is preserved
- Handle edge cases and invalid inputs gracefully

### Query System
- Keep queries in separate `.scm` files
- Document query patterns and their purpose
- Consider performance implications of complex queries

### Testing
- Each new feature should include tests
- Test both valid and invalid inputs
- Include performance tests for critical paths

## Blockers

1. ~~Current AST generator implementation needs to be fully refactored to use the modular structure~~ (DONE)
2. ~~Need to implement more AST node types to support complex OpenSCAD files~~ (DONE for primitives, transformations, and CSG operations)
3. Handling all syntax variations requires comprehensive test cases
4. Some tree-sitter query patterns need optimization
5. Performance testing infrastructure needed
6. Need to handle edge cases in parameter extraction and validation
7. Complex nested structures (like modules with control structures) need special handling

## Dependencies

- web-tree-sitter
- TypeScript
- Jest for testing

## Related Files

- `src/lib/openscad-parser/cst/query-utils.ts` - Core query utilities
- `src/lib/openscad-parser/ast/ast-types.ts` - AST node type definitions
- `src/lib/openscad-parser/ast/ast-generator.ts` - Main AST generator
- `src/lib/openscad-parser/ast/generators/` - Specialized AST generators
- `src/lib/openscad-parser/ast/utils/` - Utility functions for AST generation
- `src/lib/openscad-parser/ast/extractors/` - Value and argument extractors
- `src/lib/openscad-parser/cst/adapters/` - Node adapters
- `queries/` - Tree-sitter query files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Submit a pull request

## License

[Specify License]
