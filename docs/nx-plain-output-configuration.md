# Nx Plain Text Output Configuration

This document explains how to configure Nx to use plain text output without loading animations, progress bars, or dynamic terminal features.

## Overview

By default, Nx uses dynamic terminal output with animations, progress bars, and colored output. While this provides a great developer experience, sometimes you need plain text output for:

- CI/CD environments
- Logging and debugging
- IDE integration
- Screen readers and accessibility
- Automated scripts and tooling

## Environment Variables

Nx provides several environment variables to control terminal output behavior:

### Primary Configuration

- **`NX_TASKS_RUNNER_DYNAMIC_OUTPUT=false`** - Disables dynamic terminal output (animations, progress bars)
- **`NX_SKIP_LOG_GROUPING=true`** - Disables log grouping for linear output

### Additional Options

- **`NX_VERBOSE_LOGGING=true`** - Enables verbose logging for debugging
- **`NX_PERF_LOGGING=false`** - Disables performance logging to reduce noise
- **`NX_DAEMON=false`** - Disables Nx daemon (useful for debugging plugins)
- **`NX_INTERACTIVE=false`** - Forces non-interactive mode (no prompts)

## Configuration Methods

### Method 1: Using .env File (Automatic)

The project includes a `.env` file with the following configuration:

```bash
# Nx Terminal Output Configuration
NX_TASKS_RUNNER_DYNAMIC_OUTPUT=false
NX_SKIP_LOG_GROUPING=true
```

This automatically applies to all Nx commands when the `.env` file is present.

### Method 2: Using env-cmd (Environment-based)

For different output modes, use env-cmd with predefined environments:

#### Monorepo-wide Commands
```bash
# Plain text output for all packages
pnpm build:plain
pnpm test:plain
pnpm lint:plain
pnpm typecheck:plain
pnpm affected:plain
pnpm affected:test:plain
pnpm affected:lint:plain
pnpm affected:build:plain

# Verbose output (includes debug information)
pnpm build:verbose
pnpm test:verbose
pnpm lint:verbose
pnpm affected:verbose

# Debug output (full debugging information)
pnpm build:debug
pnpm test:debug
```

#### Package-specific Commands
```bash
# Grammar package
pnpm build:grammar:plain
pnpm test:grammar:plain
pnpm lint:grammar:plain
pnpm parse:plain
pnpm playground:plain

# Parser package
pnpm build:parser:plain
pnpm test:parser:plain
pnpm lint:parser:plain
pnpm typecheck:parser:plain

# Editor package
pnpm build:editor:plain
pnpm test:editor:plain
pnpm lint:editor:plain

# Demo package
pnpm build:demo:plain
pnpm test:demo:plain
pnpm lint:demo:plain

# File-specific testing
pnpm test:parser:file:plain --testFile src/lib/some-module.test.ts
pnpm test:editor:file:plain --testFile src/components/editor.test.tsx
pnpm test:demo:file:plain --testFile src/app.test.tsx
```

### Method 3: Manual Environment Variables

Set environment variables manually before running commands:

**Windows (PowerShell):**
```powershell
$env:NX_TASKS_RUNNER_DYNAMIC_OUTPUT="false"
$env:NX_SKIP_LOG_GROUPING="true"
nx run-many --target=test --all
```

**Windows (Command Prompt):**
```cmd
set NX_TASKS_RUNNER_DYNAMIC_OUTPUT=false
set NX_SKIP_LOG_GROUPING=true
nx run-many --target=test --all
```

**Unix/Linux/macOS:**
```bash
export NX_TASKS_RUNNER_DYNAMIC_OUTPUT=false
export NX_SKIP_LOG_GROUPING=true
nx run-many --target=test --all
```

## Environment Configurations

The project includes three predefined environments in `.env-cmdrc.json`:

### Plain Mode
- Basic plain text output
- No animations or progress bars
- Clean, linear logging

### Verbose Mode
- Plain text output
- Detailed logging enabled
- Useful for debugging

### Debug Mode
- Plain text output
- Verbose logging
- Performance logging
- Nx daemon disabled
- Full debugging information

## Usage Examples

### Running Tests with Plain Output

```bash
# Using .env file (automatic)
pnpm test

# Using env-cmd (plain mode)
pnpm test:plain

# Manual (cross-platform)
npx env-cmd -e plain nx test openscad-parser
```

### Building with Verbose Output

```bash
# Verbose mode with detailed logging
pnpm build:verbose

# Debug mode with full information
npx env-cmd -e debug nx build openscad-parser
```

### Affected Commands with Plain Output

```bash
# Test only affected projects with plain output
pnpm affected:test:plain

# Build affected projects with plain output
pnpm affected:build:plain

# All affected commands with plain output
pnpm affected:plain
```

## IDE Integration

For IDE integration, you can configure your IDE to use the plain text scripts or set environment variables in your IDE's terminal configuration.

### VS Code

Add to your VS Code settings.json:

```json
{
  "terminal.integrated.env.windows": {
    "NX_TASKS_RUNNER_DYNAMIC_OUTPUT": "false",
    "NX_SKIP_LOG_GROUPING": "true"
  },
  "terminal.integrated.env.linux": {
    "NX_TASKS_RUNNER_DYNAMIC_OUTPUT": "false",
    "NX_SKIP_LOG_GROUPING": "true"
  },
  "terminal.integrated.env.osx": {
    "NX_TASKS_RUNNER_DYNAMIC_OUTPUT": "false",
    "NX_SKIP_LOG_GROUPING": "true"
  }
}
```

## CI/CD Configuration

For CI/CD environments, Nx automatically detects CI environments and uses plain text output. However, you can explicitly set these variables in your CI configuration:

### GitHub Actions

```yaml
env:
  NX_TASKS_RUNNER_DYNAMIC_OUTPUT: false
  NX_SKIP_LOG_GROUPING: true
```

### GitLab CI

```yaml
variables:
  NX_TASKS_RUNNER_DYNAMIC_OUTPUT: "false"
  NX_SKIP_LOG_GROUPING: "true"
```

## Troubleshooting

### Environment Variables Not Working

1. Ensure the `.env` file is in the project root
2. Check that the environment variables are properly set
3. Verify that Nx is loading the environment variables

### Cross-Platform Issues

Use the provided npm scripts with `env-cmd` for guaranteed cross-platform compatibility.

### IDE Terminal Issues

Some IDEs may not properly load environment variables. Use the explicit `:plain` scripts in these cases.

## Package Dependencies

The configuration uses this npm package:

- **`env-cmd`** - Environment-based command execution with predefined configurations

This package is installed as a dev dependency and provides reliable cross-platform environment variable handling.
