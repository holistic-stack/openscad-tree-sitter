# Lessons Learned - OpenSCAD Parser

## 2025-06-03: Function Call Argument Extraction Breakthrough

### Problem
Multiple positional arguments like `bar(1, 2, 3)` were only extracting 1 argument instead of 3, causing function call visitor tests to fail.

### Root Cause
The `extractArguments` function had incorrect logic at lines 307-318 in `argument-extractor.ts`. When processing an `argument_list` node containing an `arguments` child with positional arguments (no `=` sign), it was calling `convertNodeToParameterValue(child, errorHandler)` on the entire `arguments` node instead of processing its individual `argument` children.

### Solution
Fixed the logic to properly iterate through individual `argument` children:

```typescript
// BEFORE (incorrect):
const value = convertNodeToParameterValue(child, errorHandler);
if (value !== undefined) {
  args.push({ name: '', value }); // Treats entire 'arguments' node as single value
}

// AFTER (correct):
for (let j = 0; j < child.childCount; j++) {
  const argChild = child.child(j);
  if (argChild && argChild.type === 'argument') {
    const param = extractArgument(argChild, errorHandler);
    if (param) {
      args.push(param); // Processes each 'argument' individually
    }
  }
}
```

### Key Insights
1. **Tree-sitter Structure**: `argument_list` → `arguments` → multiple `argument` nodes
2. **Fallback Logic Trap**: The function was falling into fallback logic that treated complex nodes as single values
3. **Debugging Importance**: Console logs were crucial for understanding the actual node traversal path

### Impact
- ✅ `bar(1, 2, 3)` now correctly extracts 3 arguments
- ✅ All positional, named, and mixed arguments working
- ✅ String values and nested function calls supported
- ✅ Quality gates passing (TypeScript, Lint)

### Prevention
- Always verify tree-sitter node structure using corpus files before implementing extraction logic
- Use detailed console logging during development to trace actual code paths
- Test with multiple argument patterns (positional, named, mixed) early in development

---

## Template for Future Lessons

### Problem
[Brief description of the issue]

### Root Cause
[Technical explanation of what was wrong]

### Solution
[Code changes or approach that fixed it]

### Key Insights
[Important learnings for future development]

### Impact
[What this fix enabled or improved]

### Prevention
[How to avoid this issue in the future]
