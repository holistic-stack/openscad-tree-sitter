# Package Scripts Review and Standardization

## Overview

This document outlines the comprehensive review and standardization of all package.json scripts across the monorepo to ensure **all nx scripts use `env-cmd -e plain` by default** for consistent plain text output.

## Changes Made

### 1. Root Package.json Scripts

**Before**: Mixed approach with some plain variants and inconsistent coverage
**After**: **All nx scripts use `env-cmd -e plain` by default** - no separate `:plain` variants needed

#### Updated to Use Plain Text by Default:
- `build`, `build:grammar`, `build:parser`, `build:editor`, `build:demo`
- `test`, `test:grammar`, `test:parser`, `test:editor`, `test:demo`
- `test:parser:file`, `test:editor:file`, `test:demo:file`
- `test:watch`, `test:coverage`
- `lint`, `lint:grammar`, `lint:parser`, `lint:editor`, `lint:demo`, `lint:fix`
- `typecheck`, `typecheck:parser`
- `dev`, `dev:parser`, `dev:editor`, `dev:demo`, `serve:demo`
- `affected`, `affected:test`, `affected:lint`, `affected:build`
- `parse`, `playground`

#### Commands Without env-cmd (don't need plain output):
- `graph` - Interactive web interface
- `clean`, `reset` - Simple operations

### 2. Tree-sitter-openscad Package Scripts

**Before**: Used `nx run` format, inconsistent with other packages
**After**: **All commands use `env-cmd -e plain` by default**

#### Changes:
- **Standardized to direct commands**: `env-cmd -e plain tree-sitter generate`, etc.
- **All commands use plain output**: `build`, `test`, `parse`, `playground`, `prebuildify`
- **Improved build process**: Combined generate, wasm build, and node rebuild
- **Fixed lint command**: Added proper message for grammar package

### 3. Openscad-parser Package Scripts

**Before**: Good structure but no plain text output
**After**: **All commands use `env-cmd -e plain` by default**

#### Updated:
- `build`, `test`, `test:coverage`, `lint`, `lint:fix`, `typecheck`
- **Watch commands remain interactive**: `dev`, `test:watch` (no env-cmd)
- **Format commands unchanged**: `format`, `format:check` (no env-cmd needed)

### 4. Openscad-editor Package Scripts

**Before**: Mixed nx and direct commands, missing scripts
**After**: **All commands use `env-cmd -e plain` by default**

#### Changes:
- **Replaced nx commands** with direct `vite` and `eslint` commands
- **Added missing scripts**: `test:watch`, `test:coverage`, `lint:fix`, `typecheck`
- **All commands use plain output**: `build`, `test`, `test:coverage`, `lint`, `lint:fix`, `typecheck`
- **Watch commands remain interactive**: `dev`, `test:watch` (no env-cmd)

### 5. Openscad-demo Package Scripts

**Before**: Minimal scripts, only lint
**After**: **Complete script coverage with plain text output by default**

#### Added:
- **Build scripts**: `build` (with env-cmd)
- **Development scripts**: `dev`, `serve` (interactive, no env-cmd)
- **Test scripts**: `test`, `test:coverage` (with env-cmd), `test:watch` (interactive)
- **Lint scripts**: `lint`, `lint:fix` (with env-cmd)
- **Type checking**: `typecheck` (with env-cmd)

## Script Patterns

### Naming Convention
- **Base command**: `build`, `test`, `lint`, `typecheck`
- **Package-specific**: `build:parser`, `test:editor`, `lint:demo`
- **File-specific**: `test:parser:file --testFile <path>`
- **Interactive commands**: `dev`, `test:watch`, `serve` (no env-cmd)

### Environment Command Structure
**Default for all nx and build/test/lint commands:**
```bash
env-cmd -e plain <command>
```

**Interactive commands (no env-cmd):**
```bash
<command>  # For dev, watch, serve commands
```

### Coverage Matrix

| Command | Root | Grammar | Parser | Editor | Demo | Uses env-cmd |
|---------|------|---------|--------|--------|------|--------------|
| build | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| test | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| test:watch | ✅ | N/A | ✅ | ✅ | ✅ | ❌ |
| test:coverage | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| lint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| lint:fix | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| typecheck | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| dev | ✅ | N/A | ✅ | ✅ | ✅ | ❌ |
| serve | N/A | N/A | N/A | N/A | ✅ | ❌ |
| parse | ✅ | ✅ | N/A | N/A | N/A | ✅ |
| playground | ✅ | ✅ | N/A | N/A | N/A | ✅ |

## Benefits

### 1. Consistency
- **Uniform naming**: All packages follow the same script naming patterns
- **Predictable commands**: Developers can expect the same commands across packages
- **Standard tooling**: All packages use the same underlying tools (vite, eslint, etc.)

### 2. Plain Text Output Support
- **Complete coverage**: Every command that benefits from plain output has a `:plain` variant
- **CI/CD ready**: All commands work perfectly in automated environments
- **IDE integration**: Clean output for IDE terminals and integrated tools

### 3. Developer Experience
- **Comprehensive tooling**: All packages have complete script coverage
- **Easy debugging**: Plain text variants make debugging easier
- **Flexible execution**: Choose between animated and plain output as needed

### 4. Maintainability
- **Reduced duplication**: Eliminated redundant scripts
- **Clear separation**: Package-specific vs monorepo-wide commands
- **Easy extension**: Pattern established for adding new packages

## Usage Examples

### Development Workflow
```bash
# Start development (interactive, no plain output needed)
pnpm dev:parser

# Run tests (plain output by default)
pnpm test:parser

# Lint and fix (plain output by default)
pnpm lint:fix

# Type check specific package (plain output by default)
pnpm typecheck:parser
```

### CI/CD Workflow
```bash
# Build all packages (plain output by default)
pnpm build

# Test only affected packages (plain output by default)
pnpm affected:test

# Lint all packages (plain output by default)
pnpm lint

# Type check all packages (plain output by default)
pnpm typecheck
```

### Package-specific Development
```bash
# Work on grammar package (plain output by default)
pnpm build:grammar
pnpm test:grammar
pnpm parse examples/test.scad

# Work on parser package (plain output by default)
pnpm build:parser
pnpm test:parser:file --testFile src/lib/ast-utils.test.ts

# Work on editor package (plain output by default)
pnpm build:editor
pnpm test:editor:coverage
```

## Verification

All scripts have been tested and verified to work correctly with env-cmd plain text output by default. The configuration provides:

- ✅ **Clean, linear output** without animations (by default)
- ✅ **Proper error reporting** with readable formatting
- ✅ **Cache indication** showing when outputs are reused
- ✅ **Cross-platform compatibility** using env-cmd
- ✅ **Complete coverage** of all development workflows
- ✅ **Simplified usage** - no need for `:plain` suffixes

## Future Maintenance

When adding new packages or scripts:

1. **Follow the naming convention**: `command`, `command:package`
2. **Use env-cmd by default**: All build/test/lint commands should use `env-cmd -e plain`
3. **Keep interactive commands plain**: Don't use env-cmd for `dev`, `watch`, `serve` commands
4. **Update documentation**: Add new commands to this document
5. **Test thoroughly**: Verify commands work correctly with plain text output

## Key Principle

**All nx scripts and build/test/lint commands use `env-cmd -e plain` by default** - this ensures consistent, clean output across all development workflows without requiring developers to remember special `:plain` suffixes.
