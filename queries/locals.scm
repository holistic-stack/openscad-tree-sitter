;; Scopes
[
  (chunk)
  (module_definition)
  (function_definition)
  (for_statement)
  (if_statement)
  (block)
  (do_statement)
  (while_statement)
  (repeat_statement)
] @local.scope

;; Definitions
;; Variables
(assignment_statement
  (variable_list
    (identifier) @local.definition.var))

;; Parameters
(parameters
  (identifier) @local.definition.parameter)

;; Function definitions
(function_definition
  name: (identifier) @local.definition.function)

(module_definition
  name: (identifier) @local.definition.function)

;; For loop variables
(for_numeric_clause
  name: (identifier) @local.definition.var)

(for_generic_clause
  (variable_list
    (identifier) @local.definition.var))

;; References
(identifier) @local.reference
