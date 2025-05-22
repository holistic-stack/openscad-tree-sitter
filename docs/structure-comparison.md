# Structure Comparison: Current vs. Monorepo

This document compares the current repository structure with the new monorepo structure.

## Current Structure

```
openscad-tree-sitter/
├── bindings/
│   ├── node/
│   └── wasm/
├── examples/
├── grammar.js
├── node_modules/
├── package.json
├── queries/
├── src/
│   ├── lib/
│   │   ├── ast/
│   │   ├── openscad-parser/
│   │   ├── test-utils/
│   │   └── index.ts
│   └── ...
├── test/
│   ├── corpus/
│   └── nodejs/
└── ...
```

## New Monorepo Structure

```
openscad-tree-sitter/
├── .nx/
├── docs/
├── node_modules/
├── nx.json
├── package.json
├── packages/
│   ├── tree-sitter-openscad/
│   │   ├── bindings/
│   │   ├── examples/
│   │   ├── grammar.js
│   │   ├── package.json
│   │   ├── queries/
│   │   ├── src/
│   │   └── test/
│   └── openscad-parser/
│       ├── package.json
│       ├── src/
│       │   └── lib/
│       │       ├── ast/
│       │       ├── openscad-parser/
│       │       ├── test-utils/
│       │       └── index.ts
│       ├── tsconfig.json
│       └── vite.config.ts
├── pnpm-workspace.yaml
└── README.md
```

## Key Differences

### 1. Package Organization

**Current**: All code is in a single package with mixed responsibilities.

**Monorepo**: Code is split into two packages with clear responsibilities:
- `tree-sitter-openscad`: Contains the grammar and related files
- `openscad-parser`: Contains the TypeScript parser implementation

### 2. Build System

**Current**: Custom build scripts in package.json.

**Monorepo**: Nx build system with caching and dependency management.

### 3. Dependency Management

**Current**: All dependencies are managed in a single package.json.

**Monorepo**: Each package has its own dependencies, with workspace references between packages.

### 4. Testing

**Current**: Tests are scattered throughout the repository.

**Monorepo**: Tests are co-located with the code they test, organized by package.

### 5. Configuration

**Current**: Single configuration for the entire repository.

**Monorepo**: Each package has its own configuration, with shared configuration at the root.

## Benefits of the New Structure

1. **Separation of Concerns**: Clear separation between the grammar and parser.
2. **Independent Versioning**: Each package can be versioned independently.
3. **Improved Build Performance**: Nx caching improves build times.
4. **Better Dependency Management**: Dependencies are scoped to the packages that need them.
5. **Easier Maintenance**: Changes to one package don't affect the other.
6. **Clearer Organization**: Code is organized by functionality.
7. **Improved Testing**: Tests are co-located with the code they test.
