# OpenSCAD Tree-Sitter Grammar Optimization Plan

## Current Status: 83/103 tests passing (20 failures remaining)

**Last Updated**: May 2025  
**Grammar Version**: tree-sitter ^0.22.4  
**Performance**: 1194 bytes/ms parsing speed

## Executive Summary

This document tracks the comprehensive optimization of the OpenSCAD tree-sitter grammar. The grammar has achieved **83/103 test success rate** with systematic improvements in error recovery, field naming, and expression parsing.

### Completed Achievements (Summary)
- ✅ **Expression Hierarchy Unification**: Unified `_value` rule eliminating duplicate expression systems
- ✅ **Conflict Reduction**: Reduced from 40+ to 16 essential conflicts following tree-sitter ^0.22.4 best practices
- ✅ **Direct Primitive Access**: Standardized primitive access patterns across all contexts
- ✅ **Invalid Syntax Removal**: Cleaned test corpus to only include valid OpenSCAD syntax
- ✅ **Expression Wrapping Standardization**: Applied direct access strategy for consistent AST structure
- ✅ **Error Recovery Enhancement**: Improved parser robustness for malformed input
- ✅ **For Loop Standardization**: Unified field naming and structure  
- ✅ **Let Expression Structure Fix**: Perfect field naming with `name:`, `value:`, `body:` fields
- ✅ **String Edge Cases Fix**: Comprehensive escape sequence support
- ✅ **List Comprehension Node Naming Fix**: Tree-sitter aliasing for consistent AST node names

### Current Grammar Quality Metrics
- **Conflicts**: 16 essential conflicts (target: <20) ✅
- **Test Coverage**: 83/103 passing (80.6%) ✅
- **Invalid Syntax**: Properly rejected ✅
- **Performance**: Maintained excellent parsing speed ✅

## Pending Tasks - Priority Implementation Order

### 🎯 **PRIORITY 1: Range Expression Parsing Issue (15 failures - HIGH IMPACT)**

**Issue**: Systematic pattern where `[start:end]` syntax is parsed as `vector_expression` containing `range_expression` instead of direct `range_expression`

**Affected Tests**: 6, 13-15, 17, 57-58, 62-63, 16, 18, 101 (15 failures total)

**Root Cause**: Complex precedence conflict between vector and range expressions in bracketed contexts. Current grammar restructuring (split into `bracketed_range_expression` and `bare_range_expression`) partially resolved the issue but parser still chooses `vector_expression` over `bracketed_range_expression`.

**Current Status**: 
- ✅ Grammar restructuring completed with context-sensitive rules
- ✅ Conflict declarations added for bare range expressions
- ✅ Choice ordering optimized to prioritize bracketed ranges
- ❌ Parser still chooses vector over range for `[start:end]` syntax

**Next Implementation Approaches** (Research-based, May 2025):

1. **External Scanner Approach** (Recommended - Tree-sitter ^0.22.4 best practice):
   ```c
   // External scanner to disambiguate [start:end] vs [element1, element2]
   bool tree_sitter_openscad_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
     if (valid_symbols[RANGE_START] && lexer->lookahead == '[') {
       // Look ahead for colon to determine if this is a range
       // Implementation details in tree-sitter external scanner docs
     }
   }
   ```

2. **GLR Disambiguation** (Alternative):
   - Use tree-sitter's GLR capabilities to handle the ambiguity
   - Requires careful precedence tuning and conflict management

3. **Grammar Restructuring** (Complex):
   - Further split vector and range contexts
   - May require significant grammar changes

**Implementation Priority**: HIGH - Affects most remaining test failures

### 🎯 **PRIORITY 2: Comment Attachment Design Decision (4 failures - DESIGN IMPACT)**

**Issue**: Comments appearing as separate sibling nodes vs children of constructs in AST

**Affected Tests**: 44, 47, 53-54 (4 failures total)

**Root Cause**: Grammar treats comments as `extras` vs explicit AST nodes, creating design decision about AST representation

**Current Status**:
- ✅ Comments properly parsed and recognized
- ❌ Tests expect comments as children of constructs
- ❌ Grammar produces comments as separate sibling nodes

**Implementation Approaches** (Research-based, May 2025):

1. **Explicit Comment Nodes** (Recommended):
   ```javascript
   // Add comments as explicit AST nodes in relevant contexts
   function_definition: $ => seq(
     optional($.comment),
     'function',
     field('name', $.identifier),
     // ...
   ),
   ```

2. **Comment Attachment Strategy**:
   - Research tree-sitter comment handling best practices
   - Evaluate whether comments should be children vs siblings
   - Consider OpenSCAD documentation comment conventions

3. **Extras vs Explicit** (Design Decision):
   - Current: `extras: $ => [$.comment, /\s/]` (comments as extras)
   - Alternative: Explicit comment nodes in grammar rules
   - Trade-off: Simplicity vs precise AST structure

**Implementation Priority**: MEDIUM - Design decision affecting AST structure

### 🎯 **PRIORITY 3: Module Argument Edge Cases (1 failure - LOW IMPACT)**

**Issue**: Remaining structural inconsistency in module argument parsing

**Affected Tests**: 98 (Parametric Box Module) (1 failure total)

**Root Cause**: Parentheses count mismatch and structural parsing difference

**Current Status**:
- ✅ Most module argument parsing working correctly
- ❌ Edge case with complex parameter structures

**Implementation Approach**:
1. **Analyze Specific Test**: Examine Test 98 structure and expected vs actual output
2. **Parameter Structure**: Review complex parameter declaration parsing
3. **Parentheses Handling**: Check parentheses count and nesting logic
4. **Field Naming**: Ensure consistent field naming in parameter contexts

**Implementation Priority**: LOW - Single test failure with minimal impact

## Implementation Guidance

### Tree-Sitter ^0.22.4 Best Practices (May 2025)

**Grammar Simplification Principles:**
1. **Minimize Conflicts**: Target <20 essential conflicts through better rule design
2. **External Scanners**: Use for complex disambiguation (range vs vector expressions)
3. **Direct Access**: Prefer direct primitive access over expression wrapping
4. **Helper Rules**: Use `_hidden` rules for organization without AST nodes
5. **Conflict Documentation**: Document each conflict with clear rationale

**OpenSCAD Syntax Validation:**
- ✅ **Valid Syntax Only**: Grammar should reject invalid standalone expressions
- ✅ **Specification Compliance**: Follow official OpenSCAD language rules
- ✅ **Error Recovery**: Graceful handling of malformed input
- ❌ **Invalid Constructs**: Avoid accepting non-standard syntax extensions

**Performance Optimization:**
- **State Count**: Minimize parser states through rule simplification
- **Precedence**: Use sparingly, only for genuine ambiguities
- **Aliasing**: Use `alias()` for consistent node naming across contexts
- **Inline Rules**: Use `inline: $ => [...]` for performance-critical patterns

### Development Commands

```bash
# Build and test commands
pnpm build:grammar:native    # Build grammar with native compilation
pnpm test:grammar           # Test all corpus files
pnpm test:grammar --file-name [corpus].txt  # Test specific file

# Grammar analysis
npx tree-sitter generate -- --stats  # Grammar generation statistics
npx tree-sitter parse examples/test.scad  # Parse specific files
```

### Current Grammar Status Summary

**Achievements:**
- ✅ 83/103 tests passing (80.6% success rate)
- ✅ 16 essential conflicts (target: <20)
- ✅ Unified expression hierarchy with `_value` rule
- ✅ Direct primitive access standardization
- ✅ Invalid syntax properly rejected
- ✅ Tree-sitter aliasing for consistent node naming

**Remaining Challenges:**
- 🎯 **Range Expression Parsing**: 15 failures requiring external scanner or advanced techniques
- 🎯 **Comment Attachment**: 4 failures requiring design decision about AST structure
- 🎯 **Module Arguments**: 1 failure requiring edge case analysis

**Next Steps Priority:**
1. **HIGH**: Implement external scanner for range expression disambiguation
2. **MEDIUM**: Research and decide on comment attachment strategy
3. **LOW**: Analyze and fix remaining module argument edge case

---

## Document History

**Last Major Revision**: May 2025  
**Previous Achievements**: Expression hierarchy unification, conflict reduction (40+ → 16), direct primitive access standardization, invalid syntax removal, expression wrapping standardization, helper rule implementation, error recovery enhancement, for loop standardization, let expression structure fix, string edge cases fix, list comprehension node naming fix

**Document Purpose**: This plan now focuses on the remaining 20 test failures with precise implementation guidance for the next developer. Verbose completed task information has been removed to maintain focus on actionable pending work.

**Key Decision Points Documented**:
- ✅ Direct access strategy chosen over expression wrapping
- ✅ Unified `_value` rule approach for all contexts  
- ✅ Tree-sitter aliasing for consistent node naming
- ✅ Essential conflicts preserved (16 total, target <20)
- 🎯 Range expression parsing requires external scanner approach
- 🎯 Comment attachment requires design decision (children vs siblings)

**Implementation Notes**:
- All grammar changes must validate against OpenSCAD language specification
- Use incremental testing with `pnpm build:grammar:native` and `pnpm test:grammar`
- Document rationale for any new conflicts or grammar restructuring
- Prioritize external scanner implementation for range expression disambiguation