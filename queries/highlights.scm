;; Keywords as literals
"module" @keyword
"function" @keyword
"include" @keyword
"use" @keyword
"let" @keyword

;; Literals
(number) @number
(string) @string
(identifier) @variable

;; Operators from binary_expression
(binary_expression
  operator: (operator) @operator)

;; Punctuation
"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
";" @punctuation.delimiter
"," @punctuation.delimiter

;; Comments
(comment) @comment

;; Module and function definitions
(module_definition
  name: (identifier) @function)
(function_definition
  name: (identifier) @function)

;; Function calls
(call_expression
  function: (identifier) @function.call)
(module_instantiation
  name: (identifier) @function.call)

;; Modifiers
(modifier) @special 