# OpenSCAD Parser Commands

## Build Commands

```bash
# Build the parser
nx build openscad-parser

# Build in development mode
nx build openscad-parser --configuration=development
```

## Test Commands

```bash
# Run all tests
nx test openscad-parser

# Test with watch mode (updated syntax)
nx test openscad-parser:watch

# Test specific file
nx test openscad-parser --testFile=path/to/test.ts

# Run tests with coverage (updated syntax)
nx test openscad-parser:coverage

# Note: Currently 101 tests failing due to grammar breaking changes
# See packages/openscad-parser/reviewed_plan.md for details
```

## Lint Commands

```bash
# Lint the code
nx lint openscad-parser

# Lint and fix issues
nx lint:fix openscad-parser
```

## Type Checking

```bash
# Run TypeScript type checking
nx typecheck openscad-parser
```

## Development Workflow

```bash
# Development cycle
nx build openscad-parser
nx test openscad-parser
nx lint openscad-parser

# Watch mode for development
nx build openscad-parser --watch
```