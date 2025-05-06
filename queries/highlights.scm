;; Keywords
[
  "module"
  "function"
  "include"
  "use"
  "for"
  "if"
  "else"
  "let"
  "true"
  "false"
] @keyword

;; Operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
  "<"
  "<="
  ">"
  ">="
  "=="
  "!="
  "&&"
  "||"
  "!"
  "?"
  ":"
] @operator

;; Punctuation
[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  ","
] @punctuation.delimiter

; Assignments
(assignment_statement
  name: (identifier) @variable.definition)

; Function definitions
(function_definition
  name: (identifier) @function.definition)

; Module definitions
(module_definition
  name: (identifier) @function.definition)

; Function calls
(call_expression
  function: (identifier) @function.call)

; Module instantiations
(module_instantiation
  name: (identifier) @function.call)

;; Parameters and arguments
(parameter_declaration
  (identifier) @variable.parameter)

(argument
  . (identifier) @variable.parameter
  . "=" @operator)

;; Literals
(number) @number
(boolean) @boolean
(string) @string

;; Comments
(comment) @comment

;; Identifiers
(identifier) @variable

;; Modifiers
(modifier) @operator.special 