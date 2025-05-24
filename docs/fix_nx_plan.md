# Nx Monorepo Configuration and Testing Plan

This document provides a detailed plan for understanding and using Nx monorepo configuration, including how to build and test all packages, single packages, and specific test files. It consolidates information from the project configuration, Nx documentation, and best practices from the community.

---

## 1. Overview of Nx Monorepo Configuration

- Nx is used as the monorepo build system and task runner.
- PNPM manages workspace dependencies.
- The monorepo contains multiple packages under `packages/` directory.
- Each package has its own `project.json` defining Nx targets such as `build`, `test`, `lint`, `dev`, etc.
- Global Nx configuration is in `nx.json`, defining target dependencies and plugins.
- Nx plugins used include:
  - `@nx/js/typescript` for TypeScript projects
  - `@nx/react` for React projects
  - `@nx/vite` for Vite build and test
  - `@nx/eslint` for linting

---

## 2. Building Packages

### Build All Packages

```bash
pnpm build
```

- Builds all packages in the monorepo.
- Respects task dependencies defined in `nx.json`.

### Build Single Package

```bash
pnpm build:<package>
# or using Nx directly
nx build <package>
```

- Example:

```bash
pnpm build:parser
nx build openscad-parser
```

- Builds only the specified package and its dependencies.

---

## 3. Testing Packages

### Test All Packages

```bash
pnpm test
```

- Runs tests for all packages.
- Automatically builds packages before testing.

### Test Single Package

```bash
pnpm test:<package>
# or using Nx directly
nx test <package>
```

- Example:

```bash
pnpm test:parser
nx test openscad-parser
```

- Runs tests only for the specified package.

### Test Specific Test File in a Package

```bash
pnpm test:<package>:file --testFile <path/to/file.test.ts>
```

- Runs tests for a specific test file or pattern within a package.
- The path is relative to the root of the package.

- Example:

```bash
pnpm test:parser:file --testFile src/lib/ast-utils.test.ts
```

---

## 4. Development and Watch Mode

### Run All Packages in Development Mode

```bash
pnpm dev
```

- Runs all packages in watch mode, rebuilding on file changes.

### Run Single Package in Development Mode

```bash
pnpm dev:<package>
# or using Nx directly
nx run <package>:dev
```

- Example:

```bash
pnpm dev:demo
nx run openscad-demo:dev
```

---

## 5. Linting and Type Checking

### Lint All Packages

```bash
pnpm lint
```

### Lint Single Package

```bash
pnpm lint:<package>
# or using Nx directly
nx lint <package>
```

### Fix Lint Issues Automatically

```bash
pnpm lint:fix
```

### Type Check Single Package

```bash
pnpm check:<package>
```

- Runs TypeScript type checking without emitting files.

---

## 6. Nx Task Dependencies and Workflow

- `test` depends on `build` for the same package.
- `build` depends on `build` of dependent projects.
- `dev` depends on `build` of dependent projects.
- This ensures packages are built in the correct order before testing or development.
- Use `pnpm graph` or `nx graph` to visualize project dependencies.

---

## 7. Useful Nx Commands

- View project targets and configurations:

```bash
nx show projects
nx show project <project-name> --web
```

- Visualize dependency graph:

```bash
pnpm graph
# or
nx graph
```

---

## 8. Best Practices and Recommendations

- Use Nx commands for efficient task running and caching.
- Use package-specific commands for focused development and testing.
- Use watch mode during active development for immediate feedback.
- Use lint and typecheck regularly to maintain code quality.
- Leverage Nx's dependency graph to understand project relationships.
- Follow the monorepo structure and naming conventions consistently.

---

## 9. References

- [Nx Official Documentation](https://nx.dev/)
- [Nx TypeScript Monorepo Tutorial](https://nx.dev/getting-started/tutorials/typescript-packages-tutorial)
- [Managing TypeScript Packages in Monorepos | Nx Blog](https://nx.dev/blog/managing-ts-packages-in-monorepos)
- [Monorepo Explained](https://monorepo.tools/)

---

This plan consolidates the Nx monorepo configuration and usage patterns specific to this project and general best practices for managing builds and tests efficiently.
