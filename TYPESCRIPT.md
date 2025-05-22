# TypeScript Configuration

This document explains the TypeScript configuration for the OpenSCAD Tree-Sitter project and how to handle TypeScript errors.

## TypeScript Commands

The project includes several TypeScript-related commands:

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

The project uses Vitest for testing. The TypeScript configuration includes:

1. A `vitest.d.ts` file that references the Vitest globals
2. The `tsconfig.json` file includes `"types": ["vitest/globals"]`
3. A `tsconfig.vitest.json` file that extends the main configuration but is more lenient with type checking

## Development Workflow

When developing, use the `pnpm tsc:lint` command to check for TypeScript errors without failing the build. This allows you to continue development while gradually fixing the TypeScript errors.

When you're ready to fix the TypeScript errors, use the `pnpm tsc:lint:strict` command to see all the errors that need to be fixed.

## Future Improvements

The following improvements should be made to the TypeScript configuration:

1. Fix all TypeScript errors to ensure type safety
2. Update the type definitions to match the actual implementation
3. Add more explicit type annotations to improve code readability
4. Consider using stricter TypeScript settings to catch more issues at compile time
