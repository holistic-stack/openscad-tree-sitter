# OpenSCAD Parser - Current Context

## Current Status (2025-06-03)

### Current Task: Priority 2.3 - Update Function Call Tests

**Status**: In Progress
**Started**: 2025-06-03
**Current Step**: Fixing argument extraction logic in function call visitor

### What We're Working On

Successfully updated function call visitor tests to work with new grammar structure. Now fixing the argument extraction logic to properly handle multiple arguments, string values, and nested function calls.

### Key Findings

1. **Grammar Node Types**:
   - `call_expression`: Used for function calls in expression contexts (e.g., `x = foo();`)
   - `module_instantiation`: Used for standalone function calls (e.g., `foo();`)

2. **Argument Extraction Issues**:
   - Multiple positional arguments not being extracted correctly
   - String values not supported in value extractor
   - Nested `call_expression` nodes not handled
   - Test expectations mismatch with actual AST structure

### Current Progress

- ✅ Updated test expectations to use `module_instantiation` instead of `call_expression`
- ✅ Fixed property name references (`name` → `functionName`, `arguments` → `args`)
- ✅ Integrated existing `extractArguments` function instead of custom logic
- ✅ Fixed multiple positional argument extraction (all 3 args from `bar(1, 2, 3)`)
- ✅ Fixed positional argument names (`undefined` instead of empty string)
- ✅ Added string value support (`"hello"` now works)
- ✅ Added call_expression support (nested function calls as string placeholders)
- ✅ All quality gates passing (TypeScript, Lint)

### Test Results Analysis

From the latest test logs:
- `foo()`: ✅ Working correctly (0 arguments)
- `bar(1, 2, 3)`: ✅ Extracting all 3 arguments correctly
- `baz(x = 10, y = 20)`: ✅ Named arguments working
- `qux(1, y = 20, "hello")`: ✅ Mixed arguments with string values working
- `outer(inner(10))`: ✅ Nested calls handled (as string placeholders)

### Remaining Issue: Test Expectations Mismatch

The core issue is that tests expect values wrapped in `ExpressionNode` objects:
```typescript
// Test expects:
{ name: undefined, value: { type: 'expression', expressionType: 'literal', value: 1 } }

// Current implementation returns:
{ name: undefined, value: 1 }
```

This is a **design decision**: Should we return raw values (simpler) or wrapped expression nodes (structured)?

### Next Steps

1. **Decision**: Choose between raw values vs wrapped expression nodes
2. **Implementation**: Either update tests to expect raw values OR modify argument extractor to wrap values
3. **Consistency**: Ensure the chosen approach is consistent across all visitors

### Files Modified

- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.test.ts`
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.ts`
- `packages/openscad-parser/src/lib/openscad-parser/ast/extractors/argument-extractor.ts`

### Quality Gates Status

- ✅ TypeScript compilation: PASSING
- ✅ Linting: PASSING (194 warnings, but no errors)
- ❌ Tests: 1/5 passing (function call visitor tests) - due to test expectations mismatch

### Technical Achievement

**Major breakthrough**: Successfully fixed the core argument extraction logic that was preventing multiple positional arguments from being processed. The fix involved correcting the logic in `extractArguments` to properly iterate through individual `argument` children instead of treating the entire `arguments` node as a single value.
3. `nx typecheck openscad-parser` - TypeScript compliance
