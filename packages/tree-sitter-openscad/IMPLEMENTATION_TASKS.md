# OpenSCAD Grammar Enhancement Tasks - May 2025

## Overview
Based on real-world testing analysis, implement missing OpenSCAD language features to improve compatibility from 66% to target 90%+ with real-world OpenSCAD files.

## Current Status
- **Baseline**: 103/103 corpus tests passing (100% coverage)
- **Real-world compatibility**: 66% (35/53 files)
- **Grammar optimization**: Successfully eliminated range/vector conflicts

## Priority Tasks

### **TASK 1: Echo Function in Expression Context** 🎯 **HIGH PRIORITY**
**Status**: ✅ **VALID OpenSCAD SYNTAX** (Requires version 2019.05+)

**Issue**: Missing support for `echo()` in expression context
**Files Affected**: echo.scad, and others using debug expressions
**OpenSCAD Documentation**: [Wikibooks - Echo function](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#Echo_function)

**Current Syntax Support**:
```openscad
echo("debug message");  // ✅ Supported as statement
```

**Missing Syntax Support**:
```openscad
function f(x) = echo("debug", x) x * 2;  // ❌ Not supported
r = echo("calculating") a * b;           // ❌ Not supported
```

**Implementation Requirements**:
1. Add `echo_expression` rule to grammar
2. Add to `_value` rule with appropriate precedence
3. Create corpus tests for expression context usage
4. Ensure backward compatibility with existing `echo_statement`

**Expected AST Structure**:
```
echo_expression
├── arguments: (arguments ...)
└── expression: (expression)
```

---

### **TASK 2: Assert Function in Expression Context** 🎯 **HIGH PRIORITY**
**Status**: ✅ **VALID OpenSCAD SYNTAX** (Requires version 2019.05+)

**Issue**: Missing support for `assert()` in expression context
**Files Affected**: assert.scad, and others using assertion expressions
**OpenSCAD Documentation**: [Wikibooks - Assert](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Other_Language_Features#assert)

**Current Syntax Support**:
```openscad
assert(x > 0, "positive only");  // ✅ Supported as statement
```

**Missing Syntax Support**:
```openscad
function f(x) = assert(x > 0, "positive") x * 2;  // ❌ Not supported
```

**Implementation Requirements**:
1. Add `assert_expression` rule to grammar
2. Add to `_value` rule with appropriate precedence
3. Create corpus tests for expression context usage
4. Ensure backward compatibility with existing `assert_statement`

**Expected AST Structure**:
```
assert_expression
├── condition: (expression)
├── message: (expression) [optional]
└── expression: (expression)
```

---

### **TASK 3: Multiple Variable List Comprehensions** 🎯 **MEDIUM PRIORITY**
**Status**: ✅ **VALID OpenSCAD SYNTAX** (Standard feature)

**Issue**: Missing support for multiple variable assignments in list comprehensions
**Files Affected**: list_comprehensions.scad, animation.scad, and others
**OpenSCAD Documentation**: [OpenSCAD CheatSheet - List Comprehensions](https://openscad.org/cheatsheet/)

**Current Syntax Support**:
```openscad
[for (i = [0:5]) i * 2]  // ✅ Supported
```

**Missing Syntax Support**:
```openscad
[for (i=[0:n-1], a=i*360/n) [cos(a), sin(a)]]                    // ❌ Not supported
[for (i=[0:n-1], a=i*360/n, r=radii[i]) [r*cos(a), r*sin(a)]]   // ❌ Not supported
```

**Implementation Requirements**:
1. Modify `list_comprehension_for` rule to support multiple assignments
2. Update corpus tests for multiple variable scenarios
3. Ensure single variable assignment still works (backward compatibility)

**Expected AST Structure**:
```
list_comprehension_for
├── assignments: (list_comprehension_assignments)
│   ├── assignment: (identifier = expression)
│   ├── assignment: (identifier = expression)
│   └── assignment: (identifier = expression)
```

---

## Implementation Strategy

### Phase 1: Corpus Test Creation
1. Create comprehensive test cases for each new feature
2. Verify test cases represent valid OpenSCAD syntax
3. Define expected AST structures
4. Ensure tests fail with current grammar (TDD approach)

### Phase 2: Grammar Implementation
1. Implement echo_expression rule
2. Implement assert_expression rule  
3. Implement multiple variable list comprehensions
4. Add rules to appropriate expression contexts

### Phase 3: Validation
1. Run corpus tests to verify implementation
2. Test against real-world files
3. Ensure no regressions in existing functionality
4. Measure improvement in real-world compatibility

### Phase 4: Documentation
1. Update grammar documentation
2. Document new language features supported
3. Update real-world testing report

## Success Criteria
- [ ] All new corpus tests pass
- [ ] Existing 103/103 tests continue to pass
- [ ] Real-world compatibility improves from 66% to 80%+
- [ ] No new grammar conflicts introduced
- [ ] Performance remains acceptable

## Risk Assessment
- **Low Risk**: All features are well-documented OpenSCAD syntax
- **Backward Compatibility**: Existing statement forms remain unchanged
- **Grammar Stability**: Changes are additive, not modifications to existing rules
- **Performance Impact**: Minimal - new rules follow existing patterns

## Timeline Estimate
- **Phase 1**: 2-3 hours (corpus test creation)
- **Phase 2**: 3-4 hours (grammar implementation)  
- **Phase 3**: 1-2 hours (validation and testing)
- **Phase 4**: 1 hour (documentation)
- **Total**: 7-10 hours for complete implementation

## Notes
- All syntax features are officially documented OpenSCAD features
- Implementation follows tree-sitter best practices established in current grammar
- Changes are designed to be minimal and non-disruptive
- Focus on high-impact features that affect multiple real-world files
