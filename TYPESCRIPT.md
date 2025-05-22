# TypeScript Configuration

This document explains the TypeScript configuration for the OpenSCAD Tree-Sitter project and how to handle TypeScript errors.

## TypeScript and ESLint Commands

The project includes several TypeScript and ESLint-related commands:

- `pnpm lint`: Runs ESLint on TypeScript files
- `pnpm lint:fix`: Runs ESLint with auto-fix on TypeScript files
- `pnpm lint:ts`: Runs both ESLint and TypeScript checks in one command
- `pnpm tsc:lint`: Runs the TypeScript compiler in a way that ignores errors but still reports them (for development)
- `pnpm tsc:lint:strict`: Runs the TypeScript compiler with strict checking (will fail on errors)
- `pnpm tsc:lint:skip`: Runs the TypeScript compiler with `--skipLibCheck` flag
- `pnpm tsc:lint:ignore`: Runs the TypeScript compiler but ignores errors (same as `tsc:lint`)

## Handling TypeScript Errors

The project currently has many TypeScript errors that need to be fixed. These errors are primarily related to:

1. **Type mismatches**: Many objects don't match their expected types
2. **Missing properties**: Properties required by interfaces are missing
3. **Null safety issues**: Objects that might be null are being accessed without checks
4. **Property access issues**: Accessing properties that don't exist on certain types

To fix these errors, you would need to:

1. Update the type definitions to match the actual implementation
2. Add null checks where objects might be null
3. Fix property access issues by ensuring properties exist before accessing them
4. Update the implementation to match the expected types

## Vitest Configuration

The project uses Vitest for testing. The TypeScript and ESLint configuration for tests includes:

1. A `vitest.d.ts` file that references the Vitest globals
2. The `tsconfig.json` file includes `"types": ["vitest/globals"]`
3. A `tsconfig.vitest.json` file that extends the main configuration but is more lenient with type checking
4. An `.eslintrc.vitest.json` file with specific rules for test files
5. ESLint configuration with a `vitest` environment in the test files override

## Development Workflow

When developing, use the following workflow:

1. Use `pnpm lint` to check for ESLint issues in your TypeScript code
2. Use `pnpm tsc:lint` to check for TypeScript errors without failing the build
3. Use `pnpm lint:ts` to run both ESLint and TypeScript checks in one command

This allows you to continue development while gradually fixing the TypeScript and linting errors.

When you're ready to fix all TypeScript errors, use the `pnpm tsc:lint:strict` command to see all the errors that need to be fixed.

For test files specifically, ESLint will use the rules defined in the `.eslintrc.vitest.json` configuration, which is more lenient with certain rules that are commonly triggered in test files.

## Future Improvements

The following improvements should be made to the TypeScript configuration:

1. Fix all TypeScript errors to ensure type safety
2. Update the type definitions to match the actual implementation
3. Add more explicit type annotations to improve code readability
4. Consider using stricter TypeScript settings to catch more issues at compile time
