# OpenSCAD Parser TODO List

This document outlines the remaining tasks and future enhancements for the OpenSCAD parser.

## 🎯 **CURRENT PRIORITY: Parser Implementation Updates (HIGH PRIORITY - 12-16 hours)**

### Priority 1: Critical Expression System Fixes (URGENT - 4-6 hours)

**Objective**: Fix expression visitors to work with new unified `binary_expression` node type

**Status**: 🔄 READY TO START - Comprehensive analysis completed, detailed plan available
**Dependencies**: ✅ Grammar refactoring completed (100% test coverage), ✅ Compatibility analysis completed
**Detailed Plan**: See `packages/openscad-parser/reviewed_plan.md` for step-by-step implementation
**Estimated Effort**: 4-6 hours

**Root Cause**: Grammar unification changed expression node types from hierarchy (`additive_expression`, `multiplicative_expression`) to unified `binary_expression`

**Tasks**:
- [ ] **Update Expression Visitor Dispatch Logic**: Remove old expression hierarchy types, keep only `binary_expression`
- [ ] **Update Binary Expression Creation Logic**: Simplify createExpressionNode() method for unified structure
- [ ] **Test Expression Visitor Updates**: Validate binary expressions like "1 + 2" work correctly

**Key Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor.ts` (lines ~334-353, ~405-460)
- Expression visitor test files

**Testing Commands**:
```bash
# Test expression visitor functionality
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor.test.ts"
```

**Expected Result**: Binary expressions should parse correctly with new unified node type

### Priority 2: Function Call and Accessor Expression Fixes (HIGH PRIORITY - 2-3 hours)

**Objective**: Fix function call visitor to work with new grammar structure (no more `accessor_expression`)

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Priority 1 (Expression System) completed
**Estimated Effort**: 2-3 hours

**Root Cause**: Function call visitor expects `accessor_expression` nodes but they're not found in new grammar

**Tasks**:
- [ ] **Analyze Function Call Grammar Structure**: Examine test corpus for new function call patterns
- [ ] **Update Function Call Visitor**: Modify to work with `call_expression` instead of `accessor_expression`
- [ ] **Fix Accessor Expression Handling**: Update field access patterns for new grammar
- [ ] **Test Function Call Updates**: Validate function calls work correctly

**Key Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.ts`
- Function call visitor test files

**Testing Commands**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/function-call-visitor.test.ts"
```

### Priority 3: Range Expression Parsing Fixes (HIGH PRIORITY - 3-4 hours)

**Objective**: Fix range expressions that are currently parsing as `ERROR` instead of valid syntax

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Priority 1 and 2 completed
**Estimated Effort**: 3-4 hours

**Root Cause**: Grammar changes affected range expression parsing rules - `[0:5]` now parses as `ERROR`

**Tasks**:
- [ ] **Analyze Range Expression Grammar**: Examine test corpus for new range expression structure
- [ ] **Rewrite Range Expression Visitor**: Update to match new grammar patterns with proper field names
- [ ] **Update Hybrid Approach**: Ensure range expressions work within various contexts
- [ ] **Test Range Expression Updates**: Validate various range patterns work

**Key Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/`
- Range expression test files

**Testing Commands**:
```bash
pnpm test:parser:file --testFile "src/lib/openscad-parser/ast/visitors/expression-visitor/range-expression-visitor/"
```

### Priority 4: List Comprehension Integration (MEDIUM PRIORITY - 2-3 hours)

**Objective**: Fix list comprehension visitor that currently returns `null` for all test cases

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Priority 1, 2, and 3 completed
**Estimated Effort**: 2-3 hours

**Root Cause**: Grammar changes affected list comprehension node structure and field names

**Tasks**:
- [ ] **Analyze List Comprehension Grammar**: Examine test corpus for new nested structure
- [ ] **Update List Comprehension Visitor**: Modify to work with new `list_comprehension_for` structure
- [ ] **Test Complex Scenarios**: Validate nested list comprehensions, conditions, let expressions
- [ ] **Integration Testing**: Ensure list comprehensions work with updated range expressions

**Key Files**:
- `packages/openscad-parser/src/lib/openscad-parser/ast/visitors/expression-visitor/list-comprehension-visitor/`
- List comprehension test files

**Test Cases**:
```typescript
// Test these scenarios with new grammar
const testCases = [
  '[for (i = [0:2]) [i, i*2]]',
  '[for (i = [0:3]) let(angle = i * 36) [cos(angle), sin(angle)]]',
  '[for (a = [1:4]) let(b = a*a, c = 2*b) [a, b, c]]',
  '[for (x = [1:3]) for (y = [1:3]) [x, y]]' // nested
];
```

### Priority 3: Documentation Updates (LOW PRIORITY - 1-2 hours)

**Objective**: Update parser documentation to reflect grammar changes

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Parser compatibility validation completed
**Estimated Effort**: 1-2 hours

**Tasks**:
- [ ] **Update Parser Documentation**: Reflect grammar changes in parser docs
- [ ] **Document Breaking Changes**: Create migration guide for any breaking changes
- [ ] **Update Examples**: Ensure all examples use new grammar patterns
- [ ] **Update Architecture Docs**: Reflect new grammar structure in architecture documentation

## 🎯 **MEDIUM PRIORITY: Advanced Parser Features (MEDIUM PRIORITY - 6-10 hours)**

### Priority 4: Binary and Unary Expression Visitors (MEDIUM PRIORITY - 2-3 hours)

**Objective**: Implement comprehensive binary and unary expression visitors to handle all OpenSCAD operations

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Expression hierarchy unified in grammar
**Estimated Effort**: 2-3 hours

**Tasks**:
- [ ] **BinaryExpressionVisitor Enhancement**: Ensure all binary operators work with new grammar
- [ ] **UnaryExpressionVisitor Enhancement**: Ensure all unary operators work with new grammar
- [ ] **Operator Precedence Testing**: Verify operator precedence works correctly
- [ ] **Complex Expression Testing**: Test nested binary/unary expressions

**Operators to Support**:
```typescript
// Binary operators
const binaryOps = ['+', '-', '*', '/', '%', '&&', '||', '==', '!=', '<', '>', '<=', '>='];

// Unary operators  
const unaryOps = ['-', '!'];
```

### Priority 5: Function Call Visitor Enhancement (MEDIUM PRIORITY - 2-3 hours)

**Objective**: Enhance function call visitor to work optimally with new grammar structure

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Grammar function call support completed
**Estimated Effort**: 2-3 hours

**Tasks**:
- [ ] **Function Call Parsing**: Ensure function calls parse correctly with new grammar
- [ ] **Argument Processing**: Verify argument extraction works with unified expression hierarchy
- [ ] **Built-in Function Support**: Test all OpenSCAD built-in functions
- [ ] **User-defined Function Support**: Test user-defined function calls

### Priority 6: Module Instantiation Visitor Enhancement (MEDIUM PRIORITY - 2-4 hours)

**Objective**: Enhance module instantiation visitor for new grammar structure

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Grammar module support completed
**Estimated Effort**: 2-4 hours

**Tasks**:
- [ ] **Module Call Parsing**: Ensure module calls parse correctly
- [ ] **Parameter Processing**: Verify parameter extraction works with new grammar
- [ ] **Built-in Module Support**: Test all OpenSCAD built-in modules
- [ ] **User-defined Module Support**: Test user-defined module calls

## 🎯 **LOW PRIORITY: System Optimization and Enhancement (LOW PRIORITY - 8-12 hours)**

### Priority 7: Performance Optimization (LOW PRIORITY - 4-6 hours)

**Objective**: Optimize parser performance with new grammar structure

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Parser compatibility validation completed
**Estimated Effort**: 4-6 hours

**Tasks**:
- [ ] **Performance Benchmarking**: Create benchmark suite for new grammar
- [ ] **Memory Usage Optimization**: Optimize visitor pattern memory usage
- [ ] **Large File Testing**: Test with complex OpenSCAD files (>1000 lines)
- [ ] **Parsing Speed Optimization**: Optimize parsing speed for large files

### Priority 8: Error Handling Enhancement (LOW PRIORITY - 2-3 hours)

**Objective**: Enhance error handling to work with new grammar error recovery

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Grammar error recovery completed
**Estimated Effort**: 2-3 hours

**Tasks**:
- [ ] **Error Recovery Testing**: Test error recovery with new grammar
- [ ] **Error Message Enhancement**: Improve error messages for new grammar patterns
- [ ] **Error Position Accuracy**: Ensure error positions are accurate with new grammar
- [ ] **Recovery Strategy Updates**: Update recovery strategies for new grammar

### Priority 9: Test Suite Enhancement (LOW PRIORITY - 2-3 hours)

**Objective**: Enhance test suite to fully validate new grammar integration

**Status**: 🔄 READY TO START
**Dependencies**: ✅ Parser compatibility validation completed
**Estimated Effort**: 2-3 hours

**Tasks**:
- [ ] **Grammar Integration Tests**: Add tests specifically for new grammar features
- [ ] **Regression Testing**: Ensure no functionality was lost in grammar update
- [ ] **Edge Case Testing**: Test edge cases with new grammar structure
- [ ] **Performance Testing**: Add performance tests for new grammar

## 📋 **COMPLETED TASKS (Moved to PROGRESS.md)**

### ✅ Recently Completed (2025-05-31)
- **Tree-sitter Grammar Optimization**: 103/103 tests passing (100% coverage) - PRODUCTION READY
- **Expression Hierarchy Unification**: Unified `_value` rule eliminating duplicate systems
- **Conflict Reduction**: Reduced from 40+ to 8 essential conflicts
- **List Comprehension Support**: Complete nested list comprehension functionality
- **Comment System Perfection**: 13/13 comment tests passing

### ✅ Recently Completed (2025-05-30)
- **Echo Statement Implementation**: Complete visitor with 15/15 tests passing (100% success rate)
- **Assert Statement Implementation**: Complete visitor with 15/15 tests passing (100% success rate)
- **Assign Statement Implementation**: Complete visitor with 17 comprehensive test cases
- **Range Expression Integration**: 12/12 tests passing with hybrid approach
- **Let Expression Support**: 11/11 list comprehension tests passing (100% success rate)

## 🔧 **Development Guidelines**

### Real Parser Pattern Template
```typescript
describe("VisitorName", () => {
  let parser: OpenscadParser;
  let errorHandler: ErrorHandler;
  let visitor: VisitorName;

  beforeEach(async () => {
    parser = new OpenscadParser();
    await parser.init();
    errorHandler = new ErrorHandler();
    visitor = new VisitorName('source code', errorHandler);
  });

  afterEach(() => {
    parser.dispose();
  });
});
```

### Development Commands
```bash
# Build and test commands
pnpm build:grammar    # Build grammar with pre-built WASM
pnpm test:grammar     # Test grammar
pnpm test:parser      # Test parser
pnpm test             # Test all packages

# Development workflow
pnpm dev:parser       # Development mode for parser
pnpm lint:parser      # Lint parser code
pnpm typecheck        # Type checking
```

### Quality Assurance
- **Test Coverage**: Maintain high test coverage during updates
- **Type Safety**: Ensure TypeScript compatibility throughout
- **Performance**: Verify parsing performance remains optimal
- **Documentation**: Update documentation to reflect changes
- **TDD Approach**: Follow test-driven development for all changes