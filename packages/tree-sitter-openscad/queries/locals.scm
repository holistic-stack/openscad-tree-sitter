;; ============================================================================
;; OpenSCAD Tree-sitter Local Variable and Scope Analysis Queries
;; ============================================================================
;; This file defines patterns for analyzing variable scope, definitions, and
;; references in OpenSCAD code. It helps with features like go-to-definition,
;; find-references, and variable renaming.

;; Scope Definitions
;; ============================================================================
;; Define all constructs that create new scopes in OpenSCAD

;; Global scope
(source_file) @local.scope

;; Module definitions create their own scope
(module_definition) @local.scope

;; Function definitions create their own scope
(function_definition) @local.scope

;; Control flow constructs create new scopes
(for_statement) @local.scope
(if_statement) @local.scope

;; Block statements create new scopes
(block) @local.scope

;; Let expressions create local scopes for their bindings
(let_expression) @local.scope

;; List comprehensions create scopes for their iterators
(list_comprehension) @local.scope

;; Variable and Function Definitions
;; ============================================================================

;; Global variable assignments
(assignment_statement
  name: (identifier) @local.definition.var)

;; Special variable assignments (like $fn, $fa, etc.)
(assignment_statement
  name: (special_variable) @local.definition.var)

;; Module parameter declarations
(module_definition
  parameters: (parameter_list
    (parameter_declarations
      (parameter_declaration
        (identifier) @local.definition.parameter))))

;; Function parameter declarations
(function_definition
  parameters: (parameter_list
    (parameter_declarations
      (parameter_declaration
        (identifier) @local.definition.parameter))))

;; Function definitions (the function name itself)
(function_definition
  name: (identifier) @local.definition.function)

;; Module definitions (the module name itself)
(module_definition
  name: (identifier) @local.definition.function)

;; For loop iterator variables
(for_statement
  iterator: (identifier) @local.definition.var)

;; Let expression variable bindings
(let_expression
  (let_assignment
    name: (identifier) @local.definition.var))

;; List comprehension iterator variables
(list_comprehension
  (list_comprehension_for
    iterator: (identifier) @local.definition.var))

;; Variable References
;; ============================================================================

;; All identifier references (will be filtered by scope analysis)
(identifier) @local.reference

;; Special variable references
(special_variable) @local.reference

;; Function call references
(call_expression
  function: (identifier) @local.reference)

;; Module instantiation references
(module_instantiation
  name: (identifier) @local.reference)

;; Member expression references (for accessing vector/object properties)
(member_expression
  object: (identifier) @local.reference)

;; Index expression references (for array access)
(index_expression
  array: (identifier) @local.reference)

;; Argument name references in function/module calls
(argument
  name: (identifier) @local.reference)

;; Advanced Scope Patterns
;; ============================================================================

;; Conditional scopes (if/else branches)
(if_statement
  condition: (_)
  consequence: (_) @local.scope
  alternative: (_)? @local.scope)

;; For loop body scope
(for_statement
  (block) @local.scope)

(for_statement
  (statement) @local.scope)

;; Module instantiation with block creates a scope for children
(module_instantiation
  (block) @local.scope)

;; Nested function definitions (functions defined within modules)
(module_definition
  body: (block
    (statement
      (function_definition) @local.scope)))

;; Parameter Default Values
;; ============================================================================

;; Parameter default values can reference other parameters or global variables
;; Note: parameter_declaration doesn't use field names, so we match the structure directly
(parameter_declaration
  (identifier)
  "="
  (identifier) @local.reference)

;; Complex parameter default values with expressions
(parameter_declaration
  (identifier)
  "="
  (binary_expression
    left: (identifier) @local.reference
    right: (identifier) @local.reference))

;; Special Cases
;; ============================================================================

;; Children references in modules (special OpenSCAD construct)
(call_expression
  function: (identifier) @local.reference
  (#eq? @local.reference "children"))

;; Echo statement variable references
(call_expression
  function: (identifier) @function
  arguments: (argument_list
    (arguments
      (argument
        value: (identifier) @local.reference)))
  (#eq? @function "echo"))

;; Assert statement variable references
(assert_statement
  condition: (identifier) @local.reference
  message: (identifier)? @local.reference)
