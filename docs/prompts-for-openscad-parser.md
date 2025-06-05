## Primary Objective

Continue OpenSCAD parser development by addressing the highest priority tasks from `packages/openscad-parser/reviewed_plan.md`. Focus on one issue at a time using incremental development with mandatory quality gates after each change.

## Pre-Development Analysis (MANDATORY - DO NOT SKIP)

### 1. Context Document Review
Read these documents in exact order to understand current state:
1. `packages/openscad-parser/docs/current-context.md` - Current development state and active work
2. `packages/openscad-parser/docs/PROGRESS.md` - Recently completed tasks and decisions
3. `packages/openscad-parser/docs/TODO.md` - Prioritized pending tasks with context
4. `packages/openscad-parser/docs/lesson-learned.md` - Previous insights and common pitfalls
5. `packages/openscad-parser/reviewed_plan.md` - Overall development plan and progress

### 2. Tree-sitter Grammar Validation (CRITICAL)
Before modifying any parser code:
- **Review grammar changes**: Check `packages/tree-sitter-openscad/grammar.js` for recent modifications
- **Validate test corpus**: Examine `packages/tree-sitter-openscad/test/corpus/*.txt` for syntax examples
- **Verify OpenSCAD syntax**: Ensure all test cases use valid, standalone OpenSCAD syntax (not fragments)
- **Check node types**: Confirm expected CST node types match current grammar output

### 3. Current Test Status Assessment
Run `nx test openscad-parser` to identify:
- Currently failing tests (prioritize these)
- Test patterns and expected behaviors
- Any regressions from recent changes

## Development Workflow (STRICT ADHERENCE REQUIRED)

### Nx Monorepo Compliance
- **EXCLUSIVE TOOL USE**: Only use Nx commands for all operations
- **IMMEDIATE HALT CONDITION**: If any Nx command fails:
  1. Stop all development work
  2. Provide clear explanation of the Nx failure
  3. Offer specific solutions to fix the monorepo issue
  4. Suggest alternative approaches only after Nx issues are resolved

### Mandatory Quality Gates (Execute After Every File Change)
Run these commands in exact sequence - failure at any step requires fixing before proceeding:
1. `nx test openscad-parser` (or `nx test openscad-parser src/path/to/specific.test.ts` for targeted testing)
2. `nx typecheck openscad-parser`
3. `nx lint openscad-parser`

### Incremental Development Process
1. **Single Issue Focus**: Address exactly one failing test or TODO item per iteration
2. **Research Phase**: 
   - Search for current TypeScript/Tree-sitter best practices (remember: current date is June 2025)
   - Review existing codebase patterns for consistency
   - Check OpenSCAD language specification for syntax validation
3. **Solution Analysis**: Evaluate 2-3 different implementation approaches before coding
4. **Implementation**: Apply functional programming principles (pure functions, immutability, composition)
5. **Testing**: Use real OpenscadParser instances with proper lifecycle management
6. **Documentation**: Update context documents immediately after each change

## Code Quality Requirements

### TypeScript Standards
- **Strict typing**: No `any` types, explicit type annotations required
- **Advanced types**: Leverage unions, intersections, generics, and utility types
- **Functional patterns**: Follow patterns from `docs/typescript-guidelines.md`
- **File naming**: Use kebab-case for all filenames

### Testing Standards
- **Real instances only**: No mocks for OpenscadParser - use actual instances
- **Proper lifecycle**: Always implement beforeEach/afterEach for parser initialization/disposal
- **TDD approach**: Write failing tests first, then implement minimal code to pass
- **Co-located tests**: Place test files in same directory as source files

### File Structure (SRP Compliance)
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

### Logging Requirements
- **Project logger only**: Use `packages/openscad-parser/src/lib/openscad-parser/error-handling/logger.ts`
- **No console statements**: Absolutely no console.log, console.error, etc.

## Documentation Updates (MANDATORY AFTER EACH TASK)

Update these files in order after completing any task/subtask:
1. `packages/openscad-parser/docs/current-context.md` - Clean, concise current state (remove verbosity)
2. `packages/openscad-parser/docs/PROGRESS.md` - Move completed items from TODO with brief summary
3. `packages/openscad-parser/docs/TODO.md` - Remove completed tasks, add new discoveries
4. `packages/openscad-parser/docs/lesson-learned.md` - Add insights, common issues, solutions
5. `packages/openscad-parser/reviewed_plan.md` - Update progress tracking
6. Relevant README.md files and API documentation

### Code Documentation Standards
- **JSDoc comments**: Include @example tags and architectural decisions
- **Change rationale**: Explain WHY changes were made, not just WHAT
- **Limitations**: Document edge cases and known limitations
- **Remove outdated**: Clean up obsolete comments during refactoring

## Success Criteria (All Must Be Met)
- ✅ All tests pass (`nx test openscad-parser`)
- ✅ TypeScript compilation succeeds (`nx typecheck openscad-parser`)
- ✅ Linting passes (`nx lint openscad-parser`)
- ✅ Context documents updated with current state
- ✅ Exactly one issue resolved per iteration
- ✅ Code follows functional programming principles
- ✅ Real parser instances used in tests (no mocks)
- ✅ Files remain under 500 lines following SRP

## Error Handling Protocol
If any step fails:
1. **Immediate stop** - Do not proceed to next step
2. **Root cause analysis** - Identify specific failure reason
3. **Fix strategy** - Provide clear steps to resolve the issue
4. **Validation** - Re-run quality gates before continuing
5. **Documentation** - Update lesson-learned.md with the issue and solution