# Monorepo Commands

This document provides a reference for common commands used in the OpenSCAD Tree-Sitter monorepo.

## Installation

```bash
# Clone the repository
git clone https://github.com/user/openscad-tree-sitter.git
cd openscad-tree-sitter

# Install dependencies
pnpm install
```

## Building

```bash
# Build all packages
pnpm nx run-many --target=build --all

# Build a specific package
pnpm nx build tree-sitter-openscad
pnpm nx build openscad-parser

# Build affected packages (packages that have changed)
pnpm nx affected --target=build
```

## Testing

```bash
# Run all tests
pnpm nx run-many --target=test --all

# Test a specific package
pnpm nx test tree-sitter-openscad
pnpm nx test openscad-parser

# Test affected packages
pnpm nx affected --target=test

# Run tests with coverage
pnpm nx test openscad-parser --coverage
```

## Linting

```bash
# Lint all packages
pnpm nx run-many --target=lint --all

# Lint a specific package
pnpm nx lint tree-sitter-openscad
pnpm nx lint openscad-parser

# Lint affected packages
pnpm nx affected --target=lint

# Fix linting issues
pnpm nx lint openscad-parser --fix
```

## Dependency Graph

```bash
# View the dependency graph
pnpm nx graph
```

## Working with Tree-Sitter Grammar

```bash
# Generate the grammar
pnpm nx build tree-sitter-openscad

# Parse a file
pnpm nx exec -- cd packages/tree-sitter-openscad && tree-sitter parse examples/sample.scad

# Run the playground
pnpm nx exec -- cd packages/tree-sitter-openscad && tree-sitter playground
```

## Working with the Parser

```bash
# Build the parser
pnpm nx build openscad-parser

# Run parser tests
pnpm nx test openscad-parser
```

## Adding Dependencies

```bash
# Add a dependency to a specific package
pnpm add <package-name> --filter @openscad/tree-sitter-openscad

# Add a dev dependency to a specific package
pnpm add <package-name> -D --filter @openscad/parser

# Add a dependency to the root package
pnpm add <package-name> -w
```

## Creating a New Package

```bash
# Create a new library package
pnpm nx g @nx/js:lib <package-name> --directory=packages/<package-name> --importPath=@openscad/<package-name>
```

## Running Commands in Specific Packages

```bash
# Run a command in a specific package
pnpm --filter @openscad/tree-sitter-openscad <command>

# Example: Run a custom script in the parser package
pnpm --filter @openscad/parser test:watch
```

## Nx Cache

```bash
# Clear the Nx cache
pnpm nx reset

# Run a command with caching disabled
pnpm nx build openscad-parser --skip-nx-cache
```

## Updating Nx

```bash
# Update Nx
pnpm add -D -w nx@latest
```

## Troubleshooting

If you encounter issues with the monorepo, try the following:

1. **Clear the Nx cache**:
   ```bash
   pnpm nx reset
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. **Check for circular dependencies**:
   ```bash
   pnpm nx graph
   ```

4. **Verify package.json files**:
   Ensure that each package has the correct dependencies and that workspace references are correct.

5. **Check for import errors**:
   Verify that import paths are correct and that packages are properly referenced.
