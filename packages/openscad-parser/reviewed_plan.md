# OpenSCAD Parser Compatibility Plan for Grammar Refactoring

## Executive Summary

The tree-sitter grammar refactoring has been completed successfully (114/114 tests passing), but the parser implementation now has compatibility issues with the new grammar structure. Based on actual test failure analysis from vitest run, the main issues are:

- **Expression node type changes**: Tests expect `additive_expression`, `multiplicative_expression` but now get `binary_expression`
- **Missing node types**: Tests expect `accessor_expression` but get `null` (nodes not found)
- **Range expression parsing**: Range expressions like `[0:5]` are not being found properly
- **List comprehension failures**: All list comprehension tests failing because visitor returns `null`
- **Function call issues**: Function call visitor tests failing because `accessor_expression` nodes are not found

**Total Compatibility Issues**: 101 failing tests out of 556 total tests
**Test Results**: 25 failed | 54 passed | 3 skipped (82 test files)
**Estimated Effort**: 12-16 hours
**Risk Assessment**: MEDIUM - Grammar is stable, parser needs systematic updates

## Grammar Changes Mapping

### Node Type Changes

| Old Node Type | New Node Type | Impact |
|---------------|---------------|---------|
| `additive_expression` | `binary_expression` | HIGH - Expression visitors expect old types |
| `multiplicative_expression` | `binary_expression` | HIGH - Expression visitors expect old types |
| `accessor_expression` | `call_expression` | HIGH - Function call visitor depends on this |
| `array_literal` (for ranges) | `vector_expression` | HIGH - Range expressions broken |
| Expression hierarchy nodes | Unified `_value` rule | MEDIUM - Visitor dispatch needs updates |

**Key Structural Changes:**
- **Function calls**: `accessor_expression` → `call_expression` with `function` and `arguments` fields
- **Binary expressions**: All unified under `binary_expression` type
- **Arguments**: Now structured as `argument_list` → `arguments` → `argument` nodes

### Field Name Changes

| Old Field | New Field | Context | Impact |
|-----------|-----------|---------|---------|
| Various expression fields | Unified structure | Binary expressions | MEDIUM - Field access patterns need updates |
| Range syntax fields | New range structure | Range expressions | HIGH - Range visitor needs complete rewrite |

### Structural Changes

1. **Expression Hierarchy Unification**: The grammar now uses a unified `_value` rule eliminating duplicate expression systems
2. **Direct Primitive Access**: Standardized primitive access patterns across all contexts
3. **List Comprehension Support**: Complete nested list comprehension functionality with new structure
4. **Range Expression Integration**: New range expression rules with different parsing approach

## Prioritized Fix Plan

### Priority 1: Critical Expression System Fixes (4-6 hours)

**Issue**: Expression visitors expect old node types but grammar now produces `binary_expression`
**Root Cause**: Grammar unification changed node type names
**Affected Files**: 
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor.ts`
- All expression visitor test files

**Fix Strategy**:
1. Update `dispatchSpecificExpression()` method to handle new `binary_expression` type
2. Remove references to old expression hierarchy types (`additive_expression`, `multiplicative_expression`, etc.)
3. Update binary expression detection logic to work with unified structure
4. Test with simple binary expressions: `1 + 2`, `x > 5`, `true && false`

**Test Validation**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor.test.ts"
```

**Dependencies**: None - can be implemented immediately

### Priority 2: Function Call and Accessor Expression Fixes (2-3 hours)

**Issue**: Function call visitor expects `accessor_expression` nodes but they're not found
**Root Cause**: Grammar changes removed or renamed accessor expression nodes
**Affected Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.ts`
- Function call visitor test files

**Fix Strategy**:
1. Analyze new grammar structure for function calls in test corpus
2. Update function call visitor to work with new node types
3. Modify accessor expression handling to match new grammar patterns
4. Update field access patterns for function arguments

**Test Validation**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.test.ts"
```

**Dependencies**: Priority 1 must be completed first

### Priority 3: Range Expression Parsing Fixes (3-4 hours)

**Issue**: Range expressions like `[0:5]` are parsed as `ERROR` instead of valid syntax
**Root Cause**: Grammar changes affected range expression parsing rules
**Affected Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/`
- Range expression test files

**Fix Strategy**:
1. Examine new grammar test corpus for range expression examples
2. Understand new range expression node structure from corpus files
3. Rewrite range expression visitor to match new grammar patterns
4. Update hybrid approach to work with new grammar structure
5. Test with various range patterns: `[0:5]`, `[0:2:10]`, `[start:end]`

**Test Validation**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/"
```

**Dependencies**: Priority 1 and 2 must be completed first

### Priority 4: List Comprehension Integration (2-3 hours)

**Issue**: List comprehension visitor returns `null` for all test cases
**Root Cause**: Grammar changes affected list comprehension node structure
**Affected Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/list-comprehension-visitor/`
- List comprehension test files

**Fix Strategy**:
1. Analyze new list comprehension structure in grammar test corpus
2. Update list comprehension visitor to work with new nested support
3. Ensure integration with new range expression handling
4. Test complex scenarios: nested list comprehensions, conditions, let expressions

**Test Validation**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/list-comprehension-visitor/"
```

**Dependencies**: Priority 1, 2, and 3 must be completed first

## Implementation Guidelines

### Testing Strategy
- **TDD Approach**: Write/update tests first, then implement fixes
- **Real Parser Instances**: Use actual OpenscadParser instances in all tests
- **Incremental Validation**: Fix one category at a time, validate before moving to next
- **Regression Testing**: Ensure existing functionality isn't broken

### Code Quality Standards
- **SRP**: Each file handles single responsibility
- **File Size Limits**: Keep files under 500 lines
- **TypeScript Typing**: Maintain strict type safety throughout
- **Error Handling**: Preserve comprehensive error reporting

### Validation Process
1. **Test**: Run specific test files after each fix
2. **Lint**: Ensure code quality with `pnpm lint:parser`
3. **TypeCheck**: Verify type safety with `pnpm typecheck`
4. **Integration**: Test with real OpenSCAD files using `pnpm parse examples/`

## Success Metrics

- **All parser tests passing**: `pnpm test:parser` shows 0 failures
- **Zero linting errors**: `pnpm lint:parser` shows no issues
- **Zero type errors**: `pnpm typecheck` shows no TypeScript errors
- **Performance maintained**: Parsing speed remains acceptable
- **Documentation updated**: All changes documented in context files

## Risk Mitigation

### Rollback Strategy
- **Git branches**: Create feature branch for each priority fix
- **Incremental commits**: Commit after each successful priority completion
- **Backup points**: Tag working states for easy rollback

### Incremental Validation
- **Checkpoint testing**: Run full test suite after each priority
- **Performance monitoring**: Track parsing performance throughout fixes
- **Error tracking**: Monitor error rates and types during implementation

### Breaking Change Communication
- **Document API changes**: Update documentation for any breaking changes
- **Migration guide**: Provide clear migration steps if needed
- **Version considerations**: Consider semantic versioning implications

## Detailed Implementation Plan

### Priority 1 Implementation Details

**Step 1.1: Update Expression Visitor Dispatch Logic (1 hour)**
```typescript
// File: packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor.ts
// Lines: ~334-353

// BEFORE (current broken code):
const binaryExpressionTypes = [
  'binary_expression',
  'additive_expression',        // ❌ No longer exists
  'multiplicative_expression',  // ❌ No longer exists
  'exponentiation_expression',  // ❌ No longer exists
  'logical_or_expression',      // ❌ No longer exists
  'logical_and_expression',     // ❌ No longer exists
  'equality_expression',        // ❌ No longer exists
  'relational_expression',      // ❌ No longer exists
];

// AFTER (fixed code):
const binaryExpressionTypes = [
  'binary_expression',  // ✅ Only this exists now
];
```

**Step 1.2: Update Binary Expression Creation Logic (1 hour)**
```typescript
// File: packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor.ts
// Lines: ~405-460

// Update createExpressionNode() method to handle only 'binary_expression' type
// Remove all old expression hierarchy type handling
```

**Step 1.3: Test Expression Visitor Updates (1 hour)**
```bash
# Test specific expression visitor functionality
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor.test.ts"

# Expected: Binary expressions like "1 + 2" should now work
```

### Priority 2 Implementation Details

**Step 2.1: Analyze Function Call Grammar Structure (30 minutes)**
```bash
# Examine grammar test corpus for function call examples
cat packages/tree-sitter-openscad/test/corpus/basics.txt | grep -A 20 "Function"
cat packages/tree-sitter-openscad/test/corpus/comprehensive-advanced.txt | grep -A 10 "call_expression"
```

**Step 2.2: Update Function Call Visitor (1.5 hours)**
```typescript
// File: packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.ts

// Based on corpus analysis, function calls now use 'call_expression' instead of 'accessor_expression'
// Update visitor to handle new node structure with proper field names
```

**Step 2.3: Test Function Call Updates (1 hour)**
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.test.ts"
```

### Priority 3 Implementation Details

**Step 3.1: Analyze Range Expression Grammar (1 hour)**
```bash
# Check how ranges are now structured in grammar
cat packages/tree-sitter-openscad/test/corpus/comprehensive-advanced.txt | grep -A 15 "range_expression"
```

**Step 3.2: Rewrite Range Expression Visitor (2 hours)**
```typescript
// File: packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/range-expression-visitor.ts

// Based on corpus showing:
// (range_expression start: (number) end: (number))
// (range_expression start: (number) step: (number) end: (number))

// Update visitor to handle new field structure
```

**Step 3.3: Test Range Expression Updates (1 hour)**
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/"
```

### Priority 4 Implementation Details

**Step 4.1: Analyze List Comprehension Grammar (1 hour)**
```bash
# Check new list comprehension structure
cat packages/tree-sitter-openscad/test/corpus/comprehensive-advanced.txt | grep -A 20 "list_comprehension"
```

**Step 4.2: Update List Comprehension Visitor (1.5 hours)**
```typescript
// File: packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/list-comprehension-visitor/list-comprehension-visitor.ts

// Based on corpus showing:
// (list_comprehension
//   (list_comprehension_for iterator: (identifier) range: ...)
//   expr: ...)

// Update visitor to handle new nested structure
```

**Step 4.3: Test List Comprehension Updates (30 minutes)**
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/list-comprehension-visitor/"
```

## Validation Checkpoints

### After Priority 1 (Expression System)
```bash
# Should see significant improvement in basic expression tests
pnpm test:parser | grep -E "(PASS|FAIL)" | head -20
```

### After Priority 2 (Function Calls)
```bash
# Function call tests should start passing
pnpm test:parser:file --testFile "**/function-call-visitor.test.ts"
```

### After Priority 3 (Range Expressions)
```bash
# Range expression tests should pass
pnpm test:parser:file --testFile "**/range-expression-visitor/"
```

### After Priority 4 (List Comprehensions)
```bash
# All parser tests should pass
pnpm test:parser
```

## Next Steps

1. **Start with Priority 1**: Begin with expression system fixes as foundation
2. **Update context documents**: Keep `docs/current-context.md` updated with progress
3. **Track in TODO.md**: Move completed items to PROGRESS.md
4. **Validate incrementally**: Test each priority before moving to next
5. **Document learnings**: Record any unexpected findings or solutions

---

## Updated Commands and Scripts (2024-12-19)

All Nx commands have been reviewed and updated to work with the current monorepo structure:

### Tree-sitter-openscad Commands (✅ Working)
- `nx test tree-sitter-openscad` - Run all grammar tests (114/114 passing)
- `nx test tree-sitter-openscad --file-name=advanced.txt` - Test specific corpus file
- `nx parse tree-sitter-openscad -- file.scad` - Parse and visualize files
- `nx parse tree-sitter-openscad -- --debug file.scad` - Parse with debug info
- `nx generate-grammar tree-sitter-openscad` - Generate grammar
- `nx build:wasm tree-sitter-openscad` - Build WebAssembly
- `nx playground tree-sitter-openscad` - Launch playground

### OpenSCAD-parser Commands (❌ Tests failing due to grammar changes)
- `nx test openscad-parser` - Run all parser tests (101 failing, 54 passing)
- `nx test openscad-parser:coverage` - Run with coverage
- `nx test openscad-parser:watch` - Run in watch mode
- `nx build openscad-parser` - Build parser library (✅ working)
- `nx lint openscad-parser` - Lint code (✅ working)
- `nx typecheck openscad-parser` - Type checking (✅ working)

### Documentation Updated
- `docs/howto-tree-sitter-openscad.md` - Updated with correct command syntax
- `docs/howto-openscad-parser.md` - Updated with current test status
- Project configurations in `packages/*/project.json` - Fixed command syntax
