## Primary Objective
Continue development with priority focus on fixing failing tests, followed by TypeScript type checking, then linting issues for all modified files. Execute tasks following the detailed plan in `packages/openscad-parser/reviewed_plan.md` using a prioritized, incremental approach.

## Pre-Development Analysis
Before making any changes, perform this analysis sequence:
1. **Read context documents** in this order:
   - `packages/openscad-parser/docs/current-context.md` (current state)
   - `packages/openscad-parser/docs/PROGRESS.md` (completed work)
   - `packages/openscad-parser/docs/TODO.md` (pending tasks)
   - `packages/openscad-parser/docs/lesson-learned.md` (previous insights)

2. **Understand Tree-sitter grammar changes**:
   - Review `packages/tree-sitter-openscad/grammar.js` for recent modifications
   - Check `packages/tree-sitter-openscad/test/corpus/*.txt` for syntax examples
   - Validate that OpenSCAD syntax being parsed is valid and standalone

## Development Workflow (MANDATORY)
### Nx Monorepo Requirements
- **CRITICAL**: Use only Nx tools for all operations (test, build, lint, typecheck)
- **STOP CONDITION**: If Nx tools fail, immediately halt and provide:
  - Clear explanation of the Nx issue
  - Options to fix the monorepo problem
  - Alternative approaches to continue the task

### Quality Gates (MANDATORY after each file change)
Execute in this exact order:
1. `nx test openscad-parser` (or specific test file)
2. `nx typecheck openscad-parser` 
3. `nx lint openscad-parser`

### Incremental Development Process
1. **One Issue Per Iteration**: Fix exactly one failing test or issue at a time
2. **Research Phase**: Search online for TypeScript best practices, Tree-sitter patterns, and current solutions (remember: current date is June 2025)
3. **Multiple Approach Analysis**: Evaluate 2-3 different solutions before implementing
4. **Implementation**: Apply DRY, SRP, and KISS principles with files under 500 lines
5. **Testing**: Use real OpenscadParser instances (NO MOCKS), follow TDD approach
6. **Documentation Update**: Update context documents after each significant change

## File Structure Requirements
Follow SRP with co-located tests:
```
feature-name/
├── simple-feature/
│   ├── feature.ts
│   └── feature.test.ts
└── complex-feature/
    ├── feature.ts
    ├── feature-scenario1.test.ts
    ├── feature-scenario2.test.ts
    └── feature-scenarioN.test.ts
```

## Code Quality Standards
### TypeScript Requirements
- Strict mode with explicit type annotations
- No `any` types; use advanced types (unions, intersections, generics)
- Follow patterns in `docs/typescript-guidelines.md`
- Use kebab-case for filenames

### Testing Requirements
- Real OpenscadParser instances with proper lifecycle:
```typescript
beforeEach(async () => {
  parser = new OpenscadParser();
  await parser.init();
});
afterEach(() => {
  parser.dispose();
});
```

### Logging Requirements
- Use `packages/openscad-parser/src/lib/openscad-parser/error-handling/logger.ts`
- NO console.log statements

## Documentation Updates (MANDATORY)
After each completed task/subtask, update:
1. `packages/openscad-parser/docs/current-context.md` (clean and simplify, avoid verbosity)
2. `packages/openscad-parser/docs/PROGRESS.md` (move completed items from TODO)
3. `packages/openscad-parser/docs/TODO.md` (remove completed, add new tasks)
4. `packages/openscad-parser/docs/lesson-learned.md` (add insights, common issues, solutions)
5. `packages/openscad-parser/docs/README.md` and related documentation
6. `packages/openscad-parser/reviewed_plan.md` (update progress)

## Code Documentation Requirements
- Add JSDoc comments explaining the reason for changes
- Remove outdated comments when refactoring
- Include @example tags and architectural decisions
- Document limitations and edge cases

## Success Criteria
- All tests pass
- TypeScript compilation succeeds
- Linting passes
- Context documents are updated
- One issue resolved per iteration
- Code follows functional programming principles (pure functions, immutability, composition)