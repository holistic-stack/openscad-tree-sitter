# OpenSCAD Tree-sitter Parser - TODO List

## High Priority

### 1. Implement OpenSCAD Parser with web-tree-sitter
- [ ] **Core Parser**
  - [x] Basic parser setup with web-tree-sitter
  - [x] OpenSCAD grammar integration
  - [x] CST (Concrete Syntax Tree) generation
  - [ ] AST (Abstract Syntax Tree) generation from CST
  - [ ] Support for incremental parsing

- [ ] **Tree Traversal**
  - [x] Basic cursor utilities for tree traversal
  - [ ] Implement tree-sitter queries for common patterns
  - [ ] Support for finding specific node types in the tree
  - [ ] Navigation between related nodes (e.g., definition to usage)

- [ ] **AST Node Types**
  - [ ] Primitive shapes (cube, sphere, cylinder, etc.)
  - [ ] Transformations (translate, rotate, scale, etc.)
  - [ ] CSG operations (union, difference, intersection)
  - [ ] Control structures (if, for, let, each)
  - [ ] Modules and functions

- [ ] **Query System**
  - [x] Basic query utilities
  - [ ] Optimize query performance
  - [ ] Add support for complex query patterns
  - [ ] Implement query result caching

### 2. Complete AST Node Adapters

### 1. Complete AST Node Adapters
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

### 2. Query System Enhancements
- [ ] **Query Optimization**
  - [ ] Implement query result caching
  - [ ] Add query validation
  - [ ] Support query composition

- [ ] **New Query Types**
  - [ ] References and definitions queries
  - [ ] Scope-aware symbol lookup
  - [ ] Type inference queries

## Medium Priority

### 3. Language Features
- [ ] **Built-in Functions**
  - [ ] Math functions
  - [ ] String operations
  - [ ] List/array operations

- [ ] **CSG Operations**
  - [ ] Union, difference, intersection
  - [ ] Minkowski, hull
  - [ ] Projection operations

### 4. Testing Infrastructure
- [ ] **Test Coverage**
  - [ ] Increase unit test coverage to 90%+
  - [ ] Add integration tests for complex files
  - [ ] Performance benchmarking

- [ ] **Test Fixtures**
  - [ ] Create representative test files
  - [ ] Add edge case tests
  - [ ] Performance test cases

## Low Priority

### 5. Documentation
- [ ] **API Documentation**
  - [ ] Document public APIs
  - [ ] Add usage examples
  - [ ] Create architecture diagrams

- [ ] **Developer Guide**
  - [ ] Setup instructions
  - [ ] Contribution guidelines
  - [ ] Debugging tips

### 6. Editor Integration
- [ ] **VS Code Extension**
  - [ ] Basic syntax highlighting
  - [ ] Code folding
  - [ ] Go to definition

## Implementation Notes

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

1. Need to finalize the AST node interface
2. Some tree-sitter query patterns need optimization
3. Performance testing infrastructure needed

## Dependencies

- web-tree-sitter
- TypeScript
- Jest for testing

## Related Files

- `src/lib/openscad-parser/cst/query-utils.ts` - Core query utilities
- `src/lib/openscad-parser/ast/` - AST node definitions
- `src/lib/openscad-parser/cst/adapters/` - Node adapters
- `queries/` - Tree-sitter query files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Submit a pull request

## License

[Specify License]
