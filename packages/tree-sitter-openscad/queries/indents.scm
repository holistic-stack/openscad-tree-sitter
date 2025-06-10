; OpenSCAD indentation rules

; Basic block indentation
["{" "[" "("] @indent
["}" "]" ")"] @dedent

; Module and function definitions
(module_definition
  "module" @indent)

(function_definition
  "function" @indent)

; Control structures
(if_statement
  "if" @indent)

(for_statement
  "for" @indent)

; Special case for module instantiation
(module_instantiation
  (argument_list ")" @indent))

; Special case for module instantiation with a block
(module_instantiation
  (block "{" @indent))

; Special case for module instantiation with a statement
(module_instantiation
  (statement) @indent)

; Special case for module instantiation with a semicolon
(module_instantiation
  ";" @dedent)

; Special case for module definition with a block
(module_definition
  (block "{" @indent))

; Special case for function definition with a semicolon
(function_definition
  ";" @dedent)

; Special case for if statement with a block
(if_statement
  (block "{" @indent))

; Special case for for statement with a block
(for_statement
  (block "{" @indent))

; Special case for if statement with else
(if_statement
  "else" @indent)
