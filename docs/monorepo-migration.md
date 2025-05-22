# OpenSCAD Tree-Sitter Monorepo Migration Plan

This document outlines the plan for migrating the OpenSCAD Tree-Sitter project to an Nx monorepo structure using PNPM.

## Current Structure

The current repository has:
- A tree-sitter grammar for OpenSCAD (`grammar.js`, queries, etc.)
- A TypeScript parser implementation in `src/lib/openscad-parser`
- Various test files and utilities
- PNPM is already being used as the package manager

## Migration Goals

1. Convert to an Nx monorepo with PNPM
2. Create two separate packages:
   - Tree-sitter grammar package
   - OpenSCAD parser package with TypeScript, ESLint, and Vitest
3. Maintain all existing functionality
4. Improve project organization and build processes

## Detailed Migration Plan

### 1. Initialize Nx Workspace

1. Create a new Nx workspace with PNPM:
   ```bash
   pnpm dlx create-nx-workspace@latest openscad-tree-sitter --preset=ts --packageManager=pnpm
   ```

2. Configure the workspace:
   - Update nx.json with appropriate caching settings
   - Configure the workspace to use the existing PNPM setup

### 2. Create Tree-Sitter Grammar Package

1. Create a new package for the tree-sitter grammar:
   ```bash
   pnpm nx g @nx/js:lib tree-sitter-openscad --directory=packages/tree-sitter-openscad --importPath=@openscad/tree-sitter-openscad
   ```

2. Move the following files to this package:
   - grammar.js
   - queries/
   - bindings/
   - test/corpus/
   - examples/

3. Configure package.json for the grammar package:
   - Add tree-sitter dependencies
   - Configure build scripts
   - Set up test scripts

### 3. Create OpenSCAD Parser Package

1. Create a new package for the parser:
   ```bash
   pnpm nx g @nx/js:lib openscad-parser --directory=packages/openscad-parser --importPath=@openscad/parser --bundler=vite --unitTestRunner=vitest
   ```

2. Move the following files to this package:
   - src/lib/openscad-parser/
   - src/lib/ast/
   - src/lib/test-utils/
   - src/lib/index.ts

3. Configure package.json for the parser package:
   - Add TypeScript, ESLint, and Vitest dependencies
   - Configure build scripts
   - Set up test scripts

### 4. Update Dependencies and References

1. Update package references:
   - Make the parser package depend on the grammar package
   - Update import paths in code files

2. Configure workspace dependencies:
   - Set up proper dependency relationships in nx.json
   - Configure build order in nx.json

### 5. Clean Up Unnecessary Files

1. Remove files that are no longer needed:
   - Files that have been moved to packages
   - Duplicate configuration files

### 6. Create Documentation

1. Create a README.md explaining:
   - The new monorepo structure
   - How to build and test packages
   - How to use the packages

2. Update existing documentation to reflect the new structure

## Implementation Steps

1. **Backup**: Create a backup of the current repository
2. **Initialize**: Set up the Nx workspace
3. **Create Packages**: Create the two packages
4. **Migrate Files**: Move files to their new locations
5. **Update References**: Fix imports and dependencies
6. **Test**: Ensure all tests pass in the new structure
7. **Document**: Update documentation
8. **Clean Up**: Remove unnecessary files

## Benefits of the New Structure

1. **Better Organization**: Clear separation of concerns between grammar and parser
2. **Improved Build Process**: Nx provides caching and efficient builds
3. **Easier Maintenance**: Each package can be maintained independently
4. **Better Testing**: Dedicated test setup for each package
5. **Simplified Dependencies**: Clear dependency management between packages

## Timeline

- Initial setup: 1 day
- File migration: 1-2 days
- Testing and fixing issues: 1-2 days
- Documentation: 1 day
- Total estimated time: 4-6 days
