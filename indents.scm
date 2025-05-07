;; OpenSCAD indentation rules
;; Follows C-style indentation patterns

;; Basic blocks and structures
(module_definition
  body: (_) @indent)

(function_definition
  body: (_) @indent)

(if_statement
  consequence: (_) @indent
  alternative: (_) @indent)

(for_statement
  body: (_) @indent)

(let_expression
  (expression) @indent)

;; Additional control structures
(intersection_for_statement
  body: (_) @indent)

(assign_statement
  body: (_) @indent)

;; Transformations with blocks
(module_instantiation
  (block) @indent)

;; CSG operations
(difference_operation
  body: (_) @indent)

(union_operation
  body: (_) @indent)

(intersection_operation
  body: (_) @indent)

;; General blocks
(block) @indent

;; Outdent markers
"}" @outdent
")" @outdent
"]" @outdent