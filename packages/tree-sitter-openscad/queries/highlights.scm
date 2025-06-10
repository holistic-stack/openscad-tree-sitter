;; ============================================================================
;; OpenSCAD Tree-sitter Syntax Highlighting Queries
;; ============================================================================
;; This file defines syntax highlighting patterns for OpenSCAD code using
;; tree-sitter queries. It covers all major language constructs including
;; keywords, operators, literals, functions, modules, and special syntax.

;; Keywords and Control Flow
;; ============================================================================

;; Core language keywords
"module" @keyword.function
"function" @keyword.function
"include" @keyword.import
"use" @keyword.import
"let" @keyword.operator

;; Control flow keywords
"if" @keyword.conditional
"else" @keyword.conditional
"for" @keyword.repeat
"assert" @keyword.exception
"echo" @keyword.debug

;; Boolean literals
(boolean) @constant.builtin.boolean
"true" @constant.builtin.boolean
"false" @constant.builtin.boolean

;; Special values
(undef) @constant.builtin

;; Literals and Data Types
;; ============================================================================

;; Numeric literals
(number) @number
;; String literals with proper escaping support
(string) @string
;; Special variables (starting with $)
(special_variable) @variable.builtin

;; Regular identifiers
(identifier) @variable

;; Operators and Punctuation
;; ============================================================================

;; Binary operators with semantic highlighting
(logical_or_operator) @operator.logical
(logical_and_operator) @operator.logical
(equality_operator) @operator.comparison
(inequality_operator) @operator.comparison
(less_than_operator) @operator.comparison
(less_equal_operator) @operator.comparison
(greater_than_operator) @operator.comparison
(greater_equal_operator) @operator.comparison
(addition_operator) @operator.arithmetic
(subtraction_operator) @operator.arithmetic
(multiplication_operator) @operator.arithmetic
(division_operator) @operator.arithmetic
(modulo_operator) @operator.arithmetic
(exponentiation_operator) @operator.arithmetic

;; Unary operators
(logical_not_operator) @operator.logical
(unary_minus_operator) @operator.arithmetic

;; Assignment operator
"=" @operator.assignment

;; Conditional operator
"?" @operator.conditional
":" @operator.conditional

;; Punctuation and delimiters
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
";" @punctuation.delimiter
"," @punctuation.delimiter

;; Comments
;; ============================================================================

;; All comment types (single-line and multi-line)
(comment) @comment

;; Function and Module Definitions
;; ============================================================================

;; Module definitions - highlight name as function definition
(module_definition
  name: (identifier) @function.definition)

;; Function definitions - highlight name as function definition
(function_definition
  name: (identifier) @function.definition)

;; Parameter declarations in definitions
(parameter_declaration
  (identifier) @parameter)

;; Function and Module Calls
;; ============================================================================

;; Built-in 3D primitives
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(cube|sphere|cylinder|polyhedron)$"))

;; Built-in 2D primitives
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(circle|square|polygon|text)$"))

;; Built-in transformations
(module_instantiation
  name: (identifier) @function.builtin
  (#match? @function.builtin "^(translate|rotate|scale|mirror|resize|color|multmatrix)$"))

;; Built-in boolean operations
(module_instantiation
  name: (identifier) @function.builtin
  (#match? @function.builtin "^(union|difference|intersection|hull|minkowski|render)$"))

;; Built-in 2D to 3D operations
(module_instantiation
  name: (identifier) @function.builtin
  (#match? @function.builtin "^(linear_extrude|rotate_extrude|projection|surface)$"))

;; Built-in mathematical functions
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(sin|cos|tan|asin|acos|atan|atan2|sqrt|pow|exp|ln|log|abs|sign|min|max|floor|ceil|round|norm|cross)$"))

;; Built-in string functions
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(str|len|concat|chr|ord|search)$"))

;; Built-in list/vector functions
(call_expression
  function: (identifier) @function.builtin
  (#match? @function.builtin "^(len|concat|search|is_list|is_num|is_bool|is_string|is_undef)$"))

;; User-defined function calls
(call_expression
  function: (identifier) @function.call)

;; User-defined module instantiations
(module_instantiation
  name: (identifier) @function.call)

;; Special Syntax and Constructs
;; ============================================================================

;; Modifiers (debug, root, background, disable)
(modifier) @attribute

;; List comprehensions
(list_comprehension) @keyword.operator

;; Range expressions
(range_expression) @operator

;; Vector/array expressions
(vector_expression) @punctuation.bracket

;; Conditional expressions (ternary operator)
(conditional_expression) @keyword.conditional

;; Let expressions for local variable binding
(let_expression) @keyword.operator

;; Member access (dot notation)
(member_expression
  "." @operator.member)

;; Array indexing
(index_expression
  "[" @punctuation.bracket
  "]" @punctuation.bracket)

;; Named Arguments
;; ============================================================================

;; Named arguments in function/module calls
(argument
  name: (identifier) @parameter
  "=" @operator.assignment)

;; Error Recovery
;; ============================================================================

;; Highlight error nodes for debugging
(ERROR) @error