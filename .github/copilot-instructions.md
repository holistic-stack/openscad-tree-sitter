# GitHub Copilot Instructions for OpenSCAD Tree-Sitter Project

## Project Overview

This is a monorepo containing a Tree-sitter grammar and parser for the OpenSCAD language. The project uses Nx for monorepo management, PNPM for package management, TypeScript, and Vitest for testing.

## Architecture

### Repository Structure
- **packages/tree-sitter-openscad/**: Tree-sitter grammar implementation
- **packages/openscad-parser/**: TypeScript parser using the grammar
- **Root level**: Nx workspace configuration and shared tooling

### Key Technologies
- **Tree-sitter**: Parser generator framework
- **TypeScript**: Primary language for parser implementation
- **Nx**: Monorepo management and build system
- **PNPM**: Package manager with workspace support
- **Vitest**: Testing framework
- **ESLint**: Code linting

## Coding Guidelines

### General Principles
1. **DRY (Don't Repeat Yourself)**: Consolidate exports and avoid code duplication
2. **Type Safety**: Use strict TypeScript with proper type annotations
3. **Error Handling**: Implement comprehensive error recovery and reporting
4. **Documentation**: Include JSDoc comments for public APIs
5. **Testing**: Write comprehensive unit tests with good coverage

### File Naming Conventions
- Use kebab-case for file names: `ast-visitor.ts`, `error-handling.ts`
- Use PascalCase for class names and interfaces
- Use camelCase for functions and variables
- Use SCREAMING_SNAKE_CASE for constants

### Code Organization
- Export all public APIs through index files
- Separate concerns: AST types, visitors, error handling, etc.
- Use visitor pattern for AST traversal
- Implement proper abstraction layers

## Grammar Development (tree-sitter-openscad)

### Grammar Rules
- Follow Tree-sitter best practices for grammar design
- Use proper precedence rules to avoid conflicts
- Implement error recovery strategies
- Document complex grammar rules with comments

### Testing Grammar
- Test with real-world OpenSCAD files
- Cover edge cases and error scenarios
- Use corpus tests for comprehensive validation

### Key Files
- `grammar.js`: Main grammar definition
- `queries/`: Tree-sitter queries for syntax highlighting
- `examples/`: Sample OpenSCAD files for testing

## Parser Development (openscad-parser)

### AST Design
- Use strongly typed AST node interfaces
- Implement visitor pattern for tree traversal
- Separate node types by category (expressions, statements, etc.)

### Error Handling
- Implement graceful error recovery
- Provide meaningful error messages
- Support partial parsing of invalid code

### Testing Strategy
- Unit tests for individual components
- Integration tests for complete parsing workflows
- Performance tests for large files
- Error scenario tests

## Build and Development

### Common Commands
```bash
# Build everything
pnpm build

# Run tests
pnpm test

# Development mode
pnpm dev

# Lint code
pnpm lint

# Type check
pnpm check
```

### Package-Specific Commands
```bash
# Build only grammar
pnpm build:grammar

# Build only parser
pnpm build:parser

# Test only parser
pnpm test:parser
```

## OpenSCAD Language Features

### Core Constructs
- **Modules**: User-defined and built-in 3D operations
- **Functions**: Mathematical and logical operations
- **Variables**: Local and global scope
- **Control Structures**: if/else, for loops, conditionals
- **CSG Operations**: union, difference, intersection
- **Primitives**: cube, sphere, cylinder, etc.
- **Transformations**: translate, rotate, scale, etc.

### Syntax Patterns
- Module instantiation: `cube(10);` or `cube(size=10);`
- Function calls: `sin(30)`, `max(1, 2, 3)`
- List comprehensions: `[for (i = [1:10]) i*2]`
- Object literals: `{a: 1, b: 2}`
- Conditional expressions: `condition ? value1 : value2`

### Common Pitfalls
- Semicolon placement (statements vs expressions)
- Operator precedence
- Variable scoping rules
- Named vs positional arguments

## Error Recovery Strategies

### Grammar Level
- Use error sentinel tokens for better recovery
- Implement proper precedence to reduce conflicts
- Handle incomplete constructs gracefully

### Parser Level
- Continue parsing after syntax errors
- Provide contextual error messages
- Support incremental parsing for editors

## Performance Considerations

### Grammar Optimization
- Minimize conflicts and ambiguity
- Use efficient rule structures
- Avoid excessive backtracking

### Parser Optimization
- Lazy evaluation where possible
- Efficient AST node creation
- Memory-conscious visitor implementations

## Testing Guidelines

### Test Categories
1. **Unit Tests**: Individual functions and classes
2. **Integration Tests**: Complete parsing workflows
3. **Corpus Tests**: Real-world OpenSCAD files
4. **Error Tests**: Invalid syntax scenarios
5. **Performance Tests**: Large file handling

### Test Data
- Use realistic OpenSCAD examples
- Include both simple and complex constructs
- Test edge cases and boundary conditions
- Cover error scenarios thoroughly

## Documentation Standards

### Code Documentation
- Use JSDoc for all public APIs
- Document complex algorithms and decisions
- Include usage examples where helpful
- Maintain up-to-date README files

### Grammar Documentation
- Comment complex grammar rules
- Explain precedence decisions
- Document conflict resolutions
- Maintain changelog for grammar changes

## Contribution Guidelines

### Before Making Changes
1. Run the full test suite
2. Check for type errors
3. Lint the code
4. Update documentation if needed

### Pull Request Requirements
- Include relevant tests
- Update documentation
- Follow existing code style
- Provide clear commit messages

## Debugging Tips

### Grammar Issues
- Use Tree-sitter's playground for testing
- Check for conflicts in grammar compilation
- Test with incremental parsing
- Validate with real OpenSCAD files

### Parser Issues
- Use AST visualization tools
- Test with malformed input
- Check error recovery behavior
- Validate visitor implementations

## Common Tasks

### Adding New Grammar Rules
1. Define in `grammar.js`
2. Add tests to corpus
3. Update queries if needed
4. Test with examples

### Adding New AST Nodes
1. Define TypeScript interfaces
2. Update visitor interfaces
3. Implement in concrete visitors
4. Add comprehensive tests

### Fixing Parser Errors
1. Identify error location
2. Check grammar conflicts
3. Test error recovery
4. Validate with edge cases

This document should help GitHub Copilot understand the project structure, coding conventions, and best practices for contributing to the OpenSCAD Tree-sitter project.
