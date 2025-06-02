;; ============================================================================
;; OpenSCAD Tree-sitter Tags and Symbol Navigation Queries
;; ============================================================================
;; This file defines patterns for extracting symbols and tags from OpenSCAD code
;; for use in IDE features like symbol navigation, outline views, and go-to-definition.

;; Function and Module Definitions
;; ============================================================================

;; Module definitions - primary symbols for navigation
(module_definition
  name: (identifier) @name
  parameters: (parameter_list)? @parameters) @definition.module
  (#set! "kind" "module")

;; Function definitions - primary symbols for navigation
(function_definition
  name: (identifier) @name
  parameters: (parameter_list)? @parameters) @definition.function
  (#set! "kind" "function")

;; Variable and Constant Definitions
;; ============================================================================

;; Global variable assignments
(assignment_statement
  name: (identifier) @name
  value: (_) @value) @definition.variable
  (#set! "kind" "variable")

;; Special variable assignments (OpenSCAD system variables)
(assignment_statement
  name: (special_variable) @name
  value: (_) @value) @definition.variable
  (#set! "kind" "special_variable")

;; Parameter Definitions
;; ============================================================================

;; Module parameter declarations
(module_definition
  parameters: (parameter_list
    (parameter_declarations
      (parameter_declaration
        (identifier) @name) @definition.parameter)))
  (#set! "kind" "parameter")

;; Function parameter declarations
(function_definition
  parameters: (parameter_list
    (parameter_declarations
      (parameter_declaration
        (identifier) @name) @definition.parameter)))
  (#set! "kind" "parameter")

;; Local Variable Definitions
;; ============================================================================

;; For loop iterator variables
(for_statement
  iterator: (identifier) @name) @definition.variable
  (#set! "kind" "iterator")

;; Let expression variable bindings
(let_expression
  (let_assignment
    name: (identifier) @name
    value: (_) @value) @definition.variable)
  (#set! "kind" "local_variable")

;; List comprehension iterator variables
(list_comprehension
  (list_comprehension_for
    iterator: (identifier) @name) @definition.variable)
  (#set! "kind" "iterator")

;; Function and Module References
;; ============================================================================

;; Built-in function calls (3D primitives)
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(cube|sphere|cylinder|polyhedron)$")) @reference.call
  (#set! "kind" "builtin_3d")

;; Built-in function calls (2D primitives)
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(circle|square|polygon|text)$")) @reference.call
  (#set! "kind" "builtin_2d")

;; Built-in function calls (mathematical functions)
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(sin|cos|tan|sqrt|pow|abs|min|max|floor|ceil|round|norm|cross)$")) @reference.call
  (#set! "kind" "builtin_math")

;; Built-in function calls (string functions)
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(str|len|concat|chr|ord|search)$")) @reference.call
  (#set! "kind" "builtin_string")

;; User-defined function calls
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments) @reference.call
  (#set! "kind" "function_call")

;; Built-in module instantiations (transformations)
(module_instantiation
  name: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(translate|rotate|scale|mirror|resize|color|multmatrix)$")) @reference.call
  (#set! "kind" "builtin_transform")

;; Built-in module instantiations (boolean operations)
(module_instantiation
  name: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(union|difference|intersection|hull|minkowski|render)$")) @reference.call
  (#set! "kind" "builtin_boolean")

;; Built-in module instantiations (2D to 3D operations)
(module_instantiation
  name: (identifier) @name
  arguments: (argument_list)? @arguments
  (#match? @name "^(linear_extrude|rotate_extrude|projection|surface)$")) @reference.call
  (#set! "kind" "builtin_extrude")

;; User-defined module instantiations
(module_instantiation
  name: (identifier) @name
  arguments: (argument_list)? @arguments) @reference.call
  (#set! "kind" "module_call")

;; Import and Include Statements
;; ============================================================================

;; Include statements for file dependencies
(call_expression
  function: (identifier) @name
  arguments: (argument_list
    (arguments
      (argument
        value: (string) @file_path)))
  (#eq? @name "include")) @reference.include
  (#set! "kind" "include")

;; Use statements for library imports
(call_expression
  function: (identifier) @name
  arguments: (argument_list
    (arguments
      (argument
        value: (string) @file_path)))
  (#eq? @name "use")) @reference.import
  (#set! "kind" "use")

;; Import statements for external files
(call_expression
  function: (identifier) @name
  arguments: (argument_list
    (arguments
      (argument
        value: (string) @file_path)))
  (#eq? @name "import")) @reference.import
  (#set! "kind" "import")

;; Advanced Symbol Patterns
;; ============================================================================

;; Named arguments in function/module calls (for parameter documentation)
(argument
  name: (identifier) @name
  value: (_) @value) @reference.argument
  (#set! "kind" "named_argument")

;; Variable references in expressions
(identifier) @reference.variable
  (#set! "kind" "variable_reference")

;; Special variable references
(special_variable) @reference.special_variable
  (#set! "kind" "special_variable_reference")

;; Member access patterns (for vector/object property access)
(member_expression
  object: (identifier) @object
  property: (identifier) @name) @reference.member
  (#set! "kind" "member_access")

;; Array/vector index access
(index_expression
  array: (identifier) @object
  index: (_) @index) @reference.index
  (#set! "kind" "index_access")

;; Control Flow and Special Constructs
;; ============================================================================

;; Echo statements for debugging
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#eq? @name "echo")) @reference.debug
  (#set! "kind" "echo")

;; Assert statements for validation
(assert_statement
  condition: (_) @condition
  message: (_)? @message) @reference.assert
  (#set! "kind" "assert")

;; Children references (special OpenSCAD module construct)
(call_expression
  function: (identifier) @name
  arguments: (argument_list)? @arguments
  (#eq? @name "children")) @reference.children
  (#set! "kind" "children")