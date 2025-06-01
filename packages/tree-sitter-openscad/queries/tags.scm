;; Module definitions
(module_definition
  name: (identifier) @name) @definition.function

;; Function definitions
(function_definition
  name: (identifier) @name) @definition.function

;; Variable declarations
(assignment_statement
  name: (identifier) @name) @definition.variable

;; Function calls
(call_expression
  function: (identifier) @name) @reference.call

;; Module instantiations 
(module_instantiation
  name: (identifier) @name) @reference.call

;; Parameter declarations
(parameter_declaration
  (identifier) @name) @definition.parameter

;; Module parameters with default values
(parameter_declaration
  (identifier) @name
  "="
  (_)) @definition.parameter

;; Let variable declarations
((let_assignment
  name: (identifier) @name) @definition.variable)