# OpenSCAD Tree-sitter Scripts

This document provides quick reference for the available scripts in the OpenSCAD Tree-sitter project.

## Grammar Development

### Build Grammar

Build the Tree-sitter grammar (generates `grammar.js`):

```bash
pnpm build:grammar
```

### Testing

#### Run All Grammar Tests

Run all test cases in the corpus:

```bash
pnpm test:grammar
```

#### Test Specific File

Test a specific file from the corpus:

```bash
# Test a specific corpus file
pnpm test:grammar:file examples/example.scad
```

#### Parse Single File

Parse a single OpenSCAD file and output the syntax tree:

```bash
# Parse a specific OpenSCAD file
pnpm test:grammar:parse examples/real-world/example020.scad
```

#### Test Real-world Examples

Run tests against all real-world OpenSCAD examples:

```bash
pnpm test:grammar:real-world
```

## Development Workflow

1. After making changes to `grammar.js`:
   ```bash
   # Rebuild the grammar
   pnpm build:grammar
   
   # Run tests
   pnpm test:grammar
   ```

2. To test a specific file during development:
   ```bash
   pnpm test:grammar:parse path/to/your/file.scad
   ```

3. To verify against real-world examples:
   ```bash
   pnpm test:grammar:real-world
   ```

## Troubleshooting

- If you encounter parsing errors, check the syntax tree output with `test:grammar:parse`
- For test failures, examine the test output for specific error messages
- Ensure all dependencies are installed with `pnpm install`
