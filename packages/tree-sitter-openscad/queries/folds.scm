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

; Array literals
(array_literal) @fold

; List comprehensions
(list_comprehension) @fold

; Object literals
(object_literal) @fold

; Comments
((comment) @fold
  (#set! fold.endAt endPosition))

; Special case for if statement with else clause
((if_statement
  consequence: (block) @fold
  alternative: (block)
  (#set! fold.adjustToEndOfPreviousRow true)
))
