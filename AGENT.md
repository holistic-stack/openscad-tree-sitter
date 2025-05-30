# AGENT.md - OpenSCAD Tree-sitter Development Guide

## Commands (all use plain text output by default)
- **Build**: `pnpm build` (all), `pnpm build:parser` (specific package)
- **Test all**: `pnpm test` | **Single test**: `pnpm test:parser:file --testFile path/to/file.test.ts`
- **Lint**: `pnpm lint` | **Fix**: `pnpm lint:fix` | **Typecheck**: `pnpm typecheck`
- **Dev mode**: `pnpm dev:parser` (interactive) | **Watch tests**: `pnpm test:watch` (interactive)

## Code Style & Guidelines
- **TypeScript**: Strict mode enabled, use proper types, avoid `any`
- **Formatting**: Prettier with single quotes, ESLint config allows relaxed rules
- **File naming**: kebab-case for files, PascalCase for classes, camelCase for functions
- **Testing**: Use real parser instances (not mocks), Vitest framework
- **Imports**: Use aliases `@openscad/tree-sitter-openscad` and `@openscad/parser`

## Architecture
- **Nx monorepo** with PNPM workspaces: `packages/tree-sitter-openscad/` (grammar), `packages/openscad-parser/` (TypeScript parser)
- **Error handling**: Implement graceful recovery, meaningful messages
- **TDD approach**: Write tests first, use SRP (Single Responsibility Principle)
- **Parser testing pattern**: Create real `OpenscadParser` instance, call `await parser.init()`, then `parser.dispose()` in cleanup

## Important Rules
- NEVER use mocks for OpenscadParser in tests - always use real instances
- Test file paths are relative to package root when using `:file` commands
- Use env-cmd plain text output for all build/test/lint commands (already configured)
