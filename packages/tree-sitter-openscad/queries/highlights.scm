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
(logical_or_operator) @operator
(logical_and_operator) @operator
(equality_operator) @operator
(inequality_operator) @operator
(less_than_operator) @operator
(less_equal_operator) @operator
(greater_than_operator) @operator
(greater_equal_operator) @operator
(addition_operator) @operator
(subtraction_operator) @operator
(multiplication_operator) @operator
(division_operator) @operator
(modulo_operator) @operator
(exponentiation_operator) @operator

;; Unary operators
(logical_not_operator) @operator
(unary_minus_operator) @operator

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