# Changelog

All notable changes to the OpenSCAD Tree-sitter Parser project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Range Expression Visitor implementation for parsing OpenSCAD range expressions
- Comprehensive documentation for Range Expression Visitor API
- Support for all range expression types: simple, stepped, variable, and expression ranges

### Changed
- Enhanced expression parsing system with hybrid approach for Tree-sitter grammar compatibility

### Fixed
- Tree-sitter grammar precedence issues with range expressions
- TypeScript compilation errors in range expression visitor

## [0.2.0] - 2025-05-30

### Added
- **Range Expression Parsing**: Complete implementation of RangeExpressionVisitor
  - Simple ranges: `[0:5]`, `[-5:5]`, `[1.5:10.5]`
  - Stepped ranges: `[0:2:10]`, `[1:0.5:5]`, `[10:-1:0]`
  - Variable ranges: `[x:y]`, `[start:end]`
  - Expression ranges: `[a+1:b*2]` (with appropriate warnings)
- Hybrid approach for handling Tree-sitter grammar precedence issues
- Comprehensive test suite with 12/12 tests passing (100% success rate)
- Production-ready error handling and TypeScript type safety
- Complete API documentation for range expression visitor

### Technical Implementation
- `visitArrayLiteralAsRange()` method for pattern detection within array_literal nodes
- `createLiteralExpression()` helper for AST node creation
- Robust regex-based range pattern identification
- Proper `RangeExpressionNode` AST generation with start, end, and optional step

### Documentation
- Added [Range Expression Visitor API documentation](packages/openscad-parser/docs/api/range-expression-visitor.md)
- Updated main README with range expression examples and features
- Enhanced API reference with range expression visitor

### Files Modified
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/range-expression-visitor.ts`
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/range-expression-visitor.test.ts`
- `packages/tree-sitter-openscad/grammar.js` (conflict declarations)

## [0.1.0] - 2025-01-27

### Added
- Initial release of OpenSCAD Tree-sitter Parser
- Complete visitor pattern architecture for CST to AST conversion
- Comprehensive error handling system with recovery strategies
- Support for all major OpenSCAD language constructs:
  - Primitive shapes (cube, sphere, cylinder, polyhedron)
  - 2D shapes (square, circle, polygon)
  - Transformations (translate, rotate, scale, mirror)
  - Boolean operations (union, difference, intersection)
  - Control structures (for loops, if conditionals)
  - Module and function definitions
  - Expression evaluation system
- Real Parser Pattern for testing (no mocks)
- TypeScript support with comprehensive type definitions
- Production-ready error handling and recovery
- Extensive documentation and examples

### Technical Features
- Tree-sitter based parsing for high performance
- Visitor pattern for extensible AST generation
- Comprehensive error handling with recovery strategies
- Expression evaluation system with operator precedence
- Memory-efficient parsing with proper cleanup
- Full TypeScript type safety

### Documentation
- Complete API documentation
- Architecture deep dive with Mermaid diagrams
- Testing guidelines with Real Parser Pattern
- Performance optimization guides
- Comprehensive examples and usage scenarios

### Performance
- Fast incremental parsing with Tree-sitter
- Optimized visitor pattern implementation
- Memory-efficient AST generation
- Benchmarked performance metrics

## Development Guidelines

### Version Numbering
- **Major version** (X.0.0): Breaking API changes
- **Minor version** (0.X.0): New features, backward compatible
- **Patch version** (0.0.X): Bug fixes, backward compatible

### Release Process
1. Update version in `package.json` files
2. Update this CHANGELOG.md with new features and changes
3. Create git tag with version number
4. Publish to npm registry
5. Update documentation if needed

### Contributing
See [Contributing Guidelines](packages/openscad-parser/docs/contributing/development-setup.md) for development setup and contribution process.
