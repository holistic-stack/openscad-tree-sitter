# OpenSCAD Editor Commands

## Build Commands

```bash
# Build the editor
nx build openscad-editor

# Build in development mode
nx build openscad-editor --configuration=development
```

## Development Server

```bash
# Start development server
nx dev openscad-editor

# Start with specific configuration
nx dev openscad-editor --configuration=development
```

## Test Commands

```bash
# Run all tests
nx test openscad-editor

# Test specific file
nx test openscad-editor --testFile=path/to/test.ts

# Run tests with coverage
nx test openscad-editor --coverage
```

## Lint Commands

```bash
# Lint the code
nx lint openscad-editor

# Lint and fix issues
nx lint openscad-editor --fix
```

## Workflow Examples

```bash
# Development cycle
nx build openscad-editor
nx test openscad-editor
nx dev openscad-editor
```