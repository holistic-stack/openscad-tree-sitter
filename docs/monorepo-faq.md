# Monorepo Migration FAQ

## General Questions

### Why migrate to a monorepo?

The migration to a monorepo structure provides several benefits:

1. **Better organization**: Clear separation between the grammar and parser.
2. **Independent versioning**: Each package can be versioned independently.
3. **Improved build performance**: Nx caching improves build times.
4. **Better dependency management**: Dependencies are scoped to the packages that need them.
5. **Easier maintenance**: Changes to one package don't affect the other.

### What is Nx?

Nx is a build system and set of tools for monorepos. It provides:

1. **Caching**: Nx caches build outputs to speed up builds.
2. **Dependency graph**: Nx creates a dependency graph of your packages.
3. **Affected commands**: Nx can determine which packages are affected by changes.
4. **Task running**: Nx provides a consistent way to run tasks across packages.

### What is PNPM?

PNPM is a package manager that uses a content-addressable store to avoid duplicating dependencies. It also provides workspace support for monorepos, allowing packages to reference each other.

## Migration Questions

### Will the migration break existing code?

The migration should not break existing code. The functionality of the packages will remain the same, but the organization will change.

### How will this affect consumers of the library?

Consumers of the library will need to update their imports to use the new package names. For example:

```javascript
// Before
const Parser = require('openscad-tree-sitter');

// After
const Parser = require('@openscad/tree-sitter-openscad');
```

### Will the API change?

The API should remain the same, but the package names and import paths will change.

### How will this affect development?

Development will be more organized, with clear separation between packages. Developers will need to use Nx commands for building, testing, and linting.

## Technical Questions

### How does Nx caching work?

Nx caches the outputs of tasks based on the inputs (files, environment variables, etc.). If the inputs haven't changed, Nx will use the cached output instead of running the task again.

### How do packages reference each other?

Packages reference each other using workspace references. For example:

```json
{
  "dependencies": {
    "@openscad/tree-sitter-openscad": "workspace:*"
  }
}
```

### How do I add a new package?

You can add a new package using the Nx generator:

```bash
pnpm nx g @nx/js:lib <package-name> --directory=packages/<package-name> --importPath=@openscad/<package-name>
```

### How do I run tests for a specific package?

You can run tests for a specific package using the Nx command:

```bash
pnpm nx test <package-name>
```

### How do I build a specific package?

You can build a specific package using the Nx command:

```bash
pnpm nx build <package-name>
```

## Troubleshooting

### I'm getting import errors after the migration

Check that your import paths are correct and that you're using the new package names.

### Builds are failing after the migration

Ensure that all dependencies are correctly installed and that the package.json files are correctly configured.

### Tests are failing after the migration

Verify that test files are correctly migrated and that test utilities are available.

### I'm getting Nx errors

Check that Nx is correctly installed and that the nx.json file is correctly configured.

### I'm getting PNPM errors

Ensure that PNPM is correctly installed and that the pnpm-workspace.yaml file is correctly configured.
