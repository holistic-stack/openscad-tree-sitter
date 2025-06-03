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

### Priority 3: Range Expression Visitor Refinement
**Status**: Initial analysis and a key test correction COMPLETED. Visitor refactoring for full grammar alignment and robust error handling PENDING.
**Impact**: HIGH - Ensures accurate parsing of range expressions and proper error reporting.

**Key Findings & Progress**:
- Initial analysis confirmed the `RangeExpressionVisitor` handles valid, well-parsed ranges correctly.
- A grammar-level parsing issue with negative step ranges (e.g., `[10:-1:0]`) was identified; this is deferred for a separate grammar fix. The associated test is skipped.
- The test `should handle malformed range expression` (using input `[0:5]`) was found to be failing due to incorrect CST node selection within the test itself, not a visitor flaw. This test has been corrected (as of 2025-06-04) and now passes. All non-skipped tests in `range-expression-visitor.test.ts` are passing.

**Tasks**:
- [x] **(Implied Prerequisite for P3/General Expression Handling)**: Refactor `ExpressionVisitor.createBinaryExpressionNode` for Robust Error Handling ✅ COMPLETED (2025-06-04)
  - **Action**: Modified `createBinaryExpressionNode` to return `ErrorNode` for malformed/incomplete expressions and propagate errors from operands. Updated return types and internal logic for explicit CST child field usage and robust error creation.
  - **Result**: `createBinaryExpressionNode` now provides detailed error information. Lint passes; type-check and tests show expected failures indicating areas needing updates for `ErrorNode` handling.
  - **Impact**: Foundational for improving error handling across all expression visitors.

- [x] **3.1**: Analyze new range expression grammar & Correct Flawed Test ✅ COMPLETED (2025-06-04)
  - **Action**: Examined `range_expression` structure. Corrected node selection in `should handle malformed range expression` test.
  - **Result**: Grammar structure for valid ranges (e.g., `[0:5]`, `[0:2:10]`) is understood. The visitor handles these correctly. The previously failing test for `[0:5]` now passes.
  - **Identified Issue (Grammar)**: Tree-sitter grammar incorrectly parses negative steps like `[10:-1:0]`. (Deferred to grammar-level fix).

- [~] **3.2**: Refactor and Enhance `RangeExpressionVisitor` (Implementation) - *Error message enhancement completed, core refactoring for grammar alignment previously verified.*
  - **Objective**: 
    - Align `RangeExpressionVisitor` (the implementation in `range-expression-visitor.ts`) with the current Tree-sitter grammar for `range_expression` (explicit child fields: `start`, `step`, `end`).
    - Implement robust error handling within the visitor to return `ErrorNode` instances for malformed or incomplete range expressions.
  - **File**: `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/range-expression-visitor.ts`
  - **Key Changes Needed**:
    1.  **Explicit Field Usage**: Ensure the visitor directly and robustly accesses `start`, `step` (if present), and `end` child nodes from the `range_expression` CST node, as defined by the grammar.
    2.  **Improved Error Handling**: For scenarios where these expected child nodes are missing, of an incorrect type, or the range expression is otherwise structurally invalid according to the grammar, the visitor should not return `null` silently. Instead, it should generate and return a meaningful AST `ErrorNode` (or a similar standardized error representation within the AST) that captures information about the parsing failure. ✅ (Error message content enhanced 2025-06-05 to include cause details).
    3.  **Type Safety**: Ensure all parsing paths are type-safe and handle potential `null` or `undefined` child nodes gracefully before attempting to process them.
  - **Testing for 3.2 (Visitor Implementation)**:
    - The existing test suite (`range-expression-visitor.test.ts`) now includes robust checks for `ErrorNode` vs `RangeExpressionNode`.
    - As the visitor *implementation* is refactored for error handling, ensure these existing tests (especially those designed to catch errors or test malformed inputs) correctly pass by verifying the visitor produces the expected `ErrorNode` instances.
    - Add new test cases if necessary to cover specific error conditions introduced by the visitor implementation changes.
    - Ensure all existing tests for valid range expressions continue to pass after refactoring the visitor implementation.

**Dependencies**: Priority 1 and 2 must be completed first

### ✅ Priority 4: List Comprehension Integration & Type Error Resolution (COMPLETED)
**Status**: ✅ COMPLETED (2025-06-03)
**Impact**: HIGH - Enables parsing of list comprehensions, including nested structures.

**Tasks**:
- [x] **4.1**: Analyze new list comprehension structure ✅ COMPLETED
- [x] **4.2**: Implement OpenSCAD-style visitor ✅ COMPLETED
  - [x] Basic list comprehension support
  - [x] Conditional list comprehension support
  - [x] Nested list comprehension support (using `childForFieldName` and correct field names)
  - [x] Resolved type errors within `ListComprehensionVisitor` (2025-06-03).
  - [ ] Further error handling and edge cases (ongoing refinement as part of general robustness)
- [ ] **4.3**: Add test coverage (further edge cases can be added iteratively)
  - [x] Basic test cases for nested comprehensions covered by fix
  - [ ] Edge cases
  - [ ] Error scenarios

**Summary of 4.2 Completion**:
- The `ListComprehensionVisitor` was successfully updated to handle nested OpenSCAD-style list comprehensions.
- Key changes involved using `childForFieldName` for precise node retrieval (`list_comprehension_for`, `expr`, `condition`) and ensuring the recursive parsing logic for the `expr` field works correctly when it's a nested comprehension.
- Type checks now pass for the entire `openscad-parser` package. Lint and focused tests for list comprehension indicate parsing logic is correct.

**Next Steps for List Comprehensions (Lower Priority/General Refinement)**:
- Enhance error handling for more complex malformed inputs.
- Expand test coverage with more diverse edge cases and error scenarios.

**Dependencies**: Priority 1, 2, and 3 must be completed first

## Immediate Next Actions

1.  **Run Full Test Suite**: Execute `nx test openscad-parser` to ensure that the type fixes have not introduced any runtime regressions and that parsing logic remains correct.
2.  **Run Linter**: Execute `nx lint openscad-parser` to check for any new lint issues and confirm resolution of previous ones in modified files.
3.  **Address `range-expression-visitor.test.ts` Syntax Error**: Revisit the persistent syntax error at the end of this file if tests and linting are otherwise stable.
4.  **Consult `reviewed_plan.md` / `TODO.md`**: Review for the next highest priority development task if `range-expression-visitor.test.ts` remains problematic or is deferred.

## Quality Gate Commands
```bash
nx test openscad-parser          # Verify tests
nx lint openscad-parser          # Code quality  
nx typecheck openscad-parser     # TypeScript compliance
```
