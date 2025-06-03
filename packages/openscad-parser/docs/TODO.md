# OpenSCAD Parser - TODO List

## Active Tasks

### ✅ Priority 1: Expression System Fixes (COMPLETED)
**Status**: ✅ COMPLETED (2024-12-19)
**Estimated Effort**: 4-6 hours
**Impact**: HIGH - Fixed majority of binary expression test failures

**Tasks**:
- [x] **1.1**: Update expression visitor dispatch logic ✅ DONE
  - **File**: `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor.ts`
  - **Lines**: 333-343 (dispatchSpecificExpression method)
  - **Change**: Removed old expression types, kept only `binary_expression`
  - **Test**: `nx test openscad-parser --testFile=**/expression-visitor.test.ts` ✅ PASSED

- [x] **1.2**: Update binary expression creation logic ✅ DONE
  - **File**: Same as 1.1
  - **Lines**: 404-413 (createExpressionNode method)
  - **Change**: Handle only `binary_expression` type
  - **Test**: Verified binary expressions work ✅ PASSED

- [x] **1.3**: Quality gates validation ✅ DONE
  - **Test**: `nx test openscad-parser` ✅ PASSED (expression visitor)
  - **Lint**: `nx lint openscad-parser` ✅ PASSED
  - **TypeCheck**: `nx typecheck openscad-parser` ✅ PASSED

**Dependencies**: None - completed successfully

### ✅ Priority 2: Function Call Visitor Fixes (COMPLETED)
**Status**: ✅ COMPLETED (2025-06-03)
**Estimated Effort**: 2-3 hours (Actual: ~3 hours)
**Impact**: HIGH - Function call tests now working (4/5 passing)

**Tasks**:
- [ ] **2.1**: Analyze new function call grammar structure
  - **Action**: Examine tree-sitter corpus for `call_expression` examples
  - **Files**: `packages/tree-sitter-openscad/test/corpus/*.txt`
  - **Goal**: Understand new node structure and field names

- [x] **2.2**: Update function call visitor (In Progress)
  - **Problem**: `extractFunctionCallDetails` incorrectly parses arguments. The `arguments` field of `call_expression` is directly the `argument_list` node. The `argument_list` node then contains the `arguments` node, which finally contains the `argument` nodes. The previous change incorrectly assumed an extra `arguments` wrapper. Correct structure: `call_expression` -> `arguments` (which is `argument_list`) -> `arguments` -> `argument`.
  - **File**: `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.ts`
  - **Change**: Handle `call_expression` instead of `accessor_expression`
  - **Test**: `nx test openscad-parser --testFile=**/function-call-visitor.test.ts`

- [x] **2.3**: Update function call tests ✅ COMPLETED
  - **Files**: Function call visitor test files
  - **Change**: Updated node type expectations and fixed argument extraction
  - **Validation**: 4/5 function call tests now passing ✅
  - **Achievement**: Fixed multiple positional argument extraction and test expectations mismatch

**Dependencies**: Priority 1 must be completed first

### ✅ Priority 3: Range Expression Parsing Fixes (ANALYSIS COMPLETED)
**Status**: ✅ ANALYSIS COMPLETED - Grammar issue identified
**Estimated Effort**: 3-4 hours (Actual: ~1 hour analysis)
**Impact**: HIGH - Range expressions working correctly (10/12 tests passing)

**Tasks**:
- [x] **3.1**: Analyze new range expression grammar ✅ COMPLETED
  - **Action**: Examined corpus for `range_expression` structure
  - **Goal**: Understand new field structure (start/end/step)
  - **Result**: Grammar structure confirmed, visitor working correctly (10/12 tests passing)
  - **Issue**: Grammar-level parsing problem with negative steps like `[10:-1:0]`

- [ ] **3.2**: Rewrite range expression visitor
  - **File**: `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/range-expression-visitor.ts`
  - **Change**: Handle new range structure with explicit fields
  - **Test**: Range patterns like `[0:5]`, `[0:2:10]`

**Dependencies**: Priority 1 and 2 must be completed first

### 🔥 Priority 4: List Comprehension Integration (ACTIVE)
**Status**: Ready to implement (Priority 1, 2 & 3 completed)
**Estimated Effort**: 2-3 hours
**Impact**: MEDIUM - List comprehension visitor returns null

**Tasks**:
- [ ] **4.1**: Analyze new list comprehension structure
- [ ] **4.2**: Update list comprehension visitor
- [ ] **4.3**: Test complex scenarios (nested, conditions, let expressions)

**Dependencies**: Priority 1, 2, and 3 must be completed first

## Immediate Next Actions

1. **Start Priority 1.1**: Update expression visitor dispatch logic
2. **Run Quality Gates**: After each file change
3. **Update Context**: Move completed tasks to PROGRESS.md
4. **Validate**: Ensure tests improve before moving to next task

## Quality Gate Commands
```bash
nx test openscad-parser          # Verify tests
nx lint openscad-parser          # Code quality  
nx typecheck openscad-parser     # TypeScript compliance
```
