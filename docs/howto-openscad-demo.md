# OpenSCAD Demo Commands

## Build Commands

```bash
# Build the demo application
nx build openscad-demo

# Build in development mode
nx build openscad-demo --configuration=development
```

## Development Server

```bash
# Start development server
nx dev openscad-demo

# Start with specific configuration
nx dev openscad-demo --configuration=development
```

## Preview Server

```bash
# Start preview server (for production build)
nx serve openscad-demo

# Preview with specific configuration
nx serve openscad-demo --configuration=production
```

## Test Commands

```bash
# Run all tests
nx test openscad-demo

# Test specific file
nx test openscad-demo --testFile=path/to/test.ts

# Run tests with coverage
nx test openscad-demo --coverage
```

## Lint Commands

```bash
# Lint the code
nx lint openscad-demo

# Lint and fix issues
nx lint openscad-demo --fix
```

## Workflow Examples

```bash
# Development cycle
nx build openscad-demo
nx test openscad-demo
nx dev openscad-demo
```