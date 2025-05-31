;; Scopes
[
  (source_file)
  (module_definition)
  (function_definition)
  (for_statement)
  (if_statement)
  (block)
] @local.scope

;; Definitions
;; Variables
(assignment_statement
  name: (identifier) @local.definition.var)

;; Parameters
(parameter_declaration
  (identifier) @local.definition.parameter)

;; Function definitions
(function_definition
  name: (identifier) @local.definition.function)

(module_definition
  name: (identifier) @local.definition.function)

;; For loop variables
(for_header
  iterator: (identifier) @local.definition.var)

;; References
(identifier) @local.reference
