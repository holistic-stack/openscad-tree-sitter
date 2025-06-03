# OpenSCAD Parser - TODO List

## Active Tasks

### ✅ Priority 1: Expression System Fixes (COMPLETED)
**Status**: ✅ COMPLETED (2024-12-19)
**Impact**: HIGH - Fixed all binary expression test failures

**Key Achievements**:
- Unified expression handling under new `binary_expression` type
- Removed legacy expression type handling
- Passed all quality gates (tests, lint, typecheck)

### ✅ Priority 2: Function Call Visitor Fixes (COMPLETED)
**Status**: ✅ COMPLETED (2025-06-03)
**Impact**: HIGH - Function call tests now working (4/5 passing)

**Key Achievements**:
- Fixed multiple positional argument extraction
- Added support for string values in arguments
- Implemented proper test expectations with ExpressionNode wrapping
- 4/5 tests passing (nested calls deferred)

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

### ✅ Priority 3: Range Expression Analysis (COMPLETED)
**Status**: ✅ ANALYSIS COMPLETED - Grammar issue identified
**Impact**: HIGH - Range expressions working correctly (10/12 tests passing)

**Key Findings**:
- Visitor implementation is correct
- Grammar issue with negative steps (e.g., `[10:-1:0]`)
- Decision made to defer grammar fixes to a later phase
- 10/12 tests passing (acceptable for now)

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

### 🔥 Priority 4: List Comprehension Integration (IN PROGRESS)
**Status**: In Progress (Started 2025-06-03)
**Impact**: HIGH - Enables parsing of list comprehensions

**Tasks**:
- [x] **4.1**: Analyze new list comprehension structure ✅ COMPLETED
- [x] **4.2**: Implement OpenSCAD-style visitor (in progress)
  - [x] Basic list comprehension support
  - [x] Conditional list comprehension support
  - [ ] Nested list comprehension support
  - [ ] Error handling and edge cases
- [ ] **4.3**: Add test coverage
  - [ ] Basic test cases
  - [ ] Edge cases
  - [ ] Error scenarios

**Current Focus**:
- Implementing robust error handling for malformed inputs
- Ensuring type safety throughout the visitor implementation
- Adding comprehensive test coverage

**Tasks**:
- [x] **4.1**: Analyze new list comprehension structure ✅ COMPLETED
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
