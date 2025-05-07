;; OpenSCAD folding rules

;; Basic blocks and structures
(module_definition
  body: (block) @fold)

(function_definition
  body: (block) @fold)

(if_statement
  consequence: (_) @fold
  alternative: (_) @fold)

(for_statement
  body: (_) @fold)

;; Additional control structures
(intersection_for_statement
  body: (_) @fold)

(let_expression
  (expression) @fold)

(assign_statement
  body: (_) @fold)

;; Transformations with blocks
(module_instantiation
  (block) @fold)

;; CSG operations
(difference_operation
  body: (_) @fold)

(union_operation
  body: (_) @fold)

(intersection_operation
  body: (_) @fold)

;; Vector and list expressions
(vector_expression) @fold

;; General blocks
(block) @fold

;; Comments
(comment) @fold

;; Multi-line strings
(string) @fold