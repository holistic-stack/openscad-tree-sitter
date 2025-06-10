; OpenSCAD folding rules

; Basic blocks
(block) @fold

; Module and function definitions
(module_definition) @fold
(function_definition) @fold

; Control structures
(if_statement) @fold
(for_statement) @fold

; Module instantiation with block
(module_instantiation
  (block) @fold)

; Vector expressions (OpenSCAD arrays)
(vector_expression) @fold

; List comprehensions
(list_comprehension) @fold

; Comments
((comment) @fold
  (#set! fold.endAt endPosition))

; Special case for if statement with else clause
((if_statement
  consequence: (block) @fold
  alternative: (block)
  (#set! fold.adjustToEndOfPreviousRow true)
))
