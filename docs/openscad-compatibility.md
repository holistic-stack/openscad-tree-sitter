# OpenSCAD Parser Compatibility

This document outlines the OpenSCAD versions and language features that our parser aims to be compatible with.

## Target OpenSCAD Version

The OpenSCAD parser is designed to be compatible with **OpenSCAD 2021.01**, which is the latest stable release as of May 2025. This version was released on February 7, 2021, and includes a comprehensive set of language features that our parser supports.

## Supported Language Features

The parser supports all core language features of OpenSCAD 2021.01, including:

### Syntax Elements
- Variable assignments and expressions
- Module and function declarations
- Include and use statements (with optional semicolons)
- Conditional expressions (ternary operator)
- Function literals
- Comments (single-line and multi-line)

### Data Types
- Numbers (integers and floating-point)
- Strings
- Booleans (true/false)
- Undefined value (undef)
- Vectors/Lists
- Ranges

### Expressions
- Arithmetic operations (+, -, *, /, %, ^)
- Comparison operations (<, <=, ==, !=, >=, >)
- Logical operations (&&, ||, !)
- Ternary conditional (condition ? true_expr : false_expr)
- Function calls
- Vector literals
- Range expressions
- Let expressions
- List comprehensions
- Member access (obj.prop)
- Index access (arr[idx])

### Statements
- Module instantiations
- Block statements
- If statements
- For loops
- Assign statements
- Intersection for loops
- Echo statements
- Assert statements
- Render statements

### Special Variables
- $fa, $fs, $fn (fragment control)
- $t (animation step)
- $vpr, $vpt, $vpd, $vpf (viewport parameters)
- $children (module children count)
- $preview (preview mode indicator)

### Modifiers
- * (disable)
- ! (show only)
- # (highlight/debug)
- % (transparent/background)

## Limitations and Compatibility Notes

1. **Deprecated Features**: The parser supports deprecated features from OpenSCAD 2021.01 for backward compatibility, but issues warnings for such usage. See [OpenSCAD Deprecated Features](./openscad-deprecated-features.md) for a comprehensive list of deprecated features and how they are handled.

2. **Future Compatibility**: While the parser is primarily designed for OpenSCAD 2021.01, it is structured to allow for future extensions as the OpenSCAD language evolves. Development snapshots and future releases may introduce new language features that could be incorporated into the parser with minimal changes.

3. **Semantic Validation**: The parser focuses on syntactic correctness (producing a valid CST/AST). Semantic validation (e.g., type checking, scope resolution, function arity checks, modifier applicability) is considered a separate step to be built upon the generated AST.

4. **Comments & Whitespace**: The lexer skips all whitespace, single-line comments (`//...`), and multi-line comments (`/*...*/`). These tokens are not included in the CST or AST.

5. **Character Encoding**: The parser supports UTF-8 encoding for strings and identifiers, consistent with OpenSCAD 2021.01.

6. **CST Reconstruction**: The parser includes a robust CST reconstruction utility that can convert a CST back to the original source code. This is particularly useful for testing and for tools that need to modify and regenerate OpenSCAD code. The reconstruction handles complex structures like assign statements and other deprecated features.

## Testing and Verification

The parser has been tested against a comprehensive suite of OpenSCAD files, including:
- Simple examples covering all language features
- Complex, real-world OpenSCAD files
- Examples from the OpenSCAD documentation and tutorials
- Edge cases and error conditions

This testing ensures that the parser correctly handles the full range of valid OpenSCAD syntax and provides appropriate error messages for invalid syntax.
