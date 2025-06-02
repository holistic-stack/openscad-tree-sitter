# Nx Monorepo Guide for OpenSCAD Tree-Sitter

This guide provides instructions on how to effectively use Nx commands in this monorepo project. We've moved away from npm/pnpm script wrappers to use Nx commands directly for better consistency, transparency, and to leverage Nx's full feature set.

## Table of Contents

- [Why Direct Nx Commands](#why-direct-nx-commands)
- [Common Nx Commands](#common-nx-commands)
- [Project-Specific Commands](#project-specific-commands)
- [Advanced Nx Features](#advanced-nx-features)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Why Direct Nx Commands

Using Nx commands directly instead of npm/pnpm script wrappers offers several advantages:

1. **Transparency**: Clear visibility into what commands are being executed
2. **Consistency**: Standardized command structure across the entire monorepo
3. **Feature Access**: Direct access to all Nx features like affected commands, caching, and more
4. **Extensibility**: Easier to extend with additional flags and options
5. **Documentation**: Better alignment with Nx documentation and community resources## Common Nx Commands

### Building Projects

```bash
# Build a specific project
nx build tree-sitter-openscad
nx build openscad-parser
nx build openscad-editor
nx build openscad-demo

# Build all projects
nx run-many --target=build --all

# Build only affected projects (based on git changes)
nx affected --target=build
```

### Testing

```bash
# Test a specific project
nx test tree-sitter-openscad
nx test openscad-parser
nx test openscad-editor
nx test openscad-demo

# Run tests with specific file
nx test tree-sitter-openscad --file-name=your-test-file.js
nx test openscad-parser --testFile=your-test-file.ts

# Test all projects
nx run-many --target=test --all

# Test with watch mode
nx test tree-sitter-openscad --watch
nx run-many --target=test --all --watch

# Test with coverage
nx test openscad-parser --coverage
nx run-many --target=test --all --coverage
```### Linting

```bash
# Lint a specific project
nx lint tree-sitter-openscad
nx lint openscad-parser
nx lint openscad-editor
nx lint openscad-demo

# Lint all projects
nx run-many --target=lint --all

# Lint and fix issues
nx lint openscad-parser --fix
nx run-many --target=lint --all --fix
```

### Serving Applications

```bash
# Serve the editor or demo applications
nx serve openscad-editor
nx serve openscad-demo
```

## Project-Specific Commands

### Tree-Sitter OpenSCAD Grammar

```bash
# Generate grammar
nx generate-grammar tree-sitter-openscad

# Build native bindings
nx build:native tree-sitter-openscad

# Build WebAssembly version
nx build:wasm tree-sitter-openscad

# Build Node.js bindings
nx build:node tree-sitter-openscad

# Run parser playground
nx playground tree-sitter-openscad

# Parse files
nx parse tree-sitter-openscad
nx parse:all tree-sitter-openscad
```## Advanced Nx Features

### Dependency Graph

```bash
# View the project dependency graph in a browser
nx graph

# View affected projects graph
nx affected:graph
```

### Caching and Performance

```bash
# Clear the Nx cache
nx reset

# Run with verbose output to see caching information
nx build openscad-parser --verbose

# Skip cache (force rebuild)
nx build openscad-parser --skip-nx-cache
```

### Running Multiple Commands

```bash
# Run multiple targets in sequence
nx run-many --target=lint,test,build --all

# Run only for specific projects
nx run-many --target=build --projects=openscad-parser,openscad-editor
```

## CI/CD Integration

For CI/CD pipelines, use the following commands:

```bash
# Only build what's affected by changes
nx affected --target=build

# Run tests only on affected projects
nx affected --target=test

# Run lint only on affected projects
nx affected --target=lint

# Run multiple targets on affected projects
nx affected --target=lint,test,build
```

## Best Practices

1. **Use Nx Affected Commands**: In CI/CD pipelines, use `nx affected` to only build, test, and lint what's changed.

2. **Leverage Nx Caching**: Nx caches task results. Don't disable caching unless necessary.

3. **Organize by Feature**: Group related code together in libraries, regardless of type.

4. **Enforce Module Boundaries**: Use the `@nx/enforce-module-boundaries` ESLint rule to prevent improper imports.

5. **Keep Libraries Small**: Create small, focused libraries with clear responsibilities.

6. **Use Tags**: Apply tags in `project.json` files to categorize projects by type, scope, and platform.

7. **Visualize Dependencies**: Regularly check `nx graph` to understand project relationships.

8. **Consistent Naming**: Follow consistent naming conventions for projects and libraries.

9. **Use Generators**: Use Nx generators to create new components, libraries, and applications.

10. **Keep Dependencies Up-to-Date**: Regularly update Nx and its plugins to benefit from improvements.

For more information, refer to the [official Nx documentation](https://nx.dev/concepts/more-concepts/why-monorepos).