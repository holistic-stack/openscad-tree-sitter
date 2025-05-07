/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 */

module.exports = grammar({
  name: 'openscad',

  // Use 'word' to properly handle identifiers and keywords
  word: $ => $.identifier,

  // Use this for error recovery on common delimiters
  extras: $ => [
    /\s/,
    $.comment,
    $.error_sentinel, // Add error sentinel for better recovery
  ],

  // Handle conflicts
  conflicts: $ => [
    [$.module_instantiation, $.primary_expression],
    [$.statement, $.if_statement],
    [$.identifier, $.special_variable],
  ],

  rules: {
    // Program is the root rule
    source_file: $ => repeat($.statement),

    // Comments
    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//) // Fixed to handle nested comments correctly
    ),

    // Error sentinel for better recovery
    error_sentinel: $ => token(prec(-1, /[^\s]+/)),

    // Statements
    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      prec(2, $.module_definition),
      prec(2, $.function_definition),
      prec(2, $.assignment_statement),
      $.module_instantiation
      // Next: add other statement types incrementally

      // $.if_statement,
      // $.for_statement,
      // $.while_statement,
      // $.echo_statement,
      // $.assert_statement,
      // seq($.expression, ';'),
      // seq($.expression, token.immediate(prec(1, ';'))),
      // seq($.expression, $._error_recovery),
      // $._error_recovery
    ),

    // Error recovery helper
    _error_recovery: $ => token(prec(-1, /[^;{}()\[\]\s]+/)),

    // Include and Use statements
    include_statement: $ => seq(
      'include',
      $.string,
      optional(';')
    ),

    use_statement: $ => seq(
      'use',
      $.string,
      optional(';')
    ),

    // Module definition
    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    // Function definition
    function_definition: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      '=',
      field('value', $.expression),
      ';'
    ),

    // Parameter list
    parameter_list: $ => seq(
      '(',
      optional($.parameter_declarations),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;{]/)) // Match semicolon or opening brace
      )
    ),

    parameter_declarations: $ => seq(
      $.parameter_declaration,
      repeat(seq(',', $.parameter_declaration)),
      optional(',')
    ),

    parameter_declaration: $ => choice(
      $.identifier,
      $.special_variable,
      seq($.identifier, '=', $.expression),
      seq($.special_variable, '=', $.expression)
    ),

    // Assignment statement
    assignment_statement: $ => seq(
      field('name', prec(2, choice($.special_variable, $.identifier))),
      '=',
      field('value', $.expression),
      ';'
    ),

    // Blocks
    block: $ => seq(
      '{',
      repeat($.statement),
      choice(
        '}',
        // Error recovery for missing closing brace
        token.immediate(prec(-1, /[^\s;]/)) // Match any non-whitespace, non-semicolon character
      )
    ),

    // Module instantiation
    module_instantiation: $ => seq(
      optional($.modifier),
      field('name', $.identifier),
      field('arguments', $.argument_list),
      choice(
        ';',
        $.block,
        $.module_child
      )
    ),

    // Arguments
    argument_list: $ => seq(
      '(',
      optional($.arguments),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;{]/)) // Match semicolon or opening brace
      )
    ),

    arguments: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
      optional(',')
    ),

    argument: $ => choice(
      $.expression,
      seq(prec(2, $.special_variable), '=', $.expression),
      seq($.identifier, '=', $.expression)
    ),

    // Module children
    module_child: $ => seq(
      'children',
      optional(seq(
        '(',
        optional($.expression),
        ')'
      )),
      ';'
    ),

    // Modifiers for module instantiation
    modifier: $ => choice(
      '#', // debug
      '!', // root
      '%', // background
      '*', // disable
    ),

    // Control Structures
    if_statement: $ => prec.right(0, seq(
      'if',
      '(',
      $.expression,
      ')',
      choice(
        $.block,
        $.statement
      ),
      optional(field('alternative', seq(
        'else',
        choice(
          $.if_statement, // else if
          $.block,
          $.statement
        )
      )))
    )),

    for_statement: $ => seq(
      'for',
      '(',
      $.for_header,
      ')',
      choice(
        $.block,
        $.statement
      )
    ),

    for_header: $ => seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      choice($.range_expression, $.expression)
    ),

    // Range expression (for for loops)
    range_expression: $ => choice(
      seq(
        field('start', $.expression),
        ':',
        field('end', $.expression)
      ),
      seq(
        field('start', $.expression),
        ':',
        field('step', $.expression),
        ':',
        field('end', $.expression)
      )
    ),

    // Echo and Assert
    echo_statement: $ => seq(
      'echo',
      '(',
      optional($.arguments),
      ')',
      ';'
    ),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      ')',
      ';'
    ),

    // Expression
    expression: $ => $.conditional_expression,

    // Precedence levels (higher number = higher precedence)
    // Conditional: 1, Logical OR: 2, Logical AND: 3, Equality: 4, Relational: 5,
    // Additive: 6, Multiplicative: 7, Exponentiation: 8, Unary: 9, Postfix: 10

    conditional_expression: $ => choice(
      prec.right(1, seq(
        field('condition', $.logical_or_expression),
        '?',
        field('consequence', $.expression), // Recursive call to $.expression for consequence
        ':',
        field('alternative', $.conditional_expression) // Allows right-chaining
      )),
      $.logical_or_expression // Pass to next higher precedence
    ),

    logical_or_expression: $ => choice(
      prec.left(2, seq(
        field('left', $.logical_or_expression),
        '||',
        field('right', $.logical_and_expression)
      )),
      $.logical_and_expression // Pass to next higher precedence
    ),

    logical_and_expression: $ => choice(
      prec.left(3, seq(
        field('left', $.logical_and_expression),
        '&&',
        field('right', $.equality_expression)
      )),
      $.equality_expression // Pass to next higher precedence
    ),

    equality_expression: $ => choice(
      prec.left(4, seq(
        field('left', $.equality_expression),
        field('operator', choice('==', '!=')),
        field('right', $.relational_expression)
      )),
      $.relational_expression // Pass to next higher precedence
    ),

    relational_expression: $ => choice(
      prec.left(5, seq(
        field('left', $.relational_expression),
        field('operator', choice('<', '<=', '>', '>=')),
        field('right', $.additive_expression)
      )),
      $.additive_expression // Pass to next higher precedence
    ),

    additive_expression: $ => choice(
      prec.left(6, seq(
        field('left', $.additive_expression),
        field('operator', choice('+', '-')),
        field('right', $.multiplicative_expression)
      )),
      $.multiplicative_expression // Pass to next higher precedence
    ),

    multiplicative_expression: $ => choice(
      prec.left(7, seq(
        field('left', $.multiplicative_expression),
        field('operator', choice('*', '/', '%')),
        field('right', $.exponentiation_expression)
      )),
      $.exponentiation_expression // Pass to next higher precedence
    ),

    exponentiation_expression: $ => choice(
      prec.right(8, seq(
        field('left', $.unary_expression),
        field('operator', '^'),
        field('right', $.exponentiation_expression)
      )),
      $.unary_expression // Pass to next higher precedence
    ),

    unary_expression: $ => choice(
      prec.right(9, seq(
        field('operator', choice('!', '-')),
        field('operand', $.accessor_expression)
      )),
      $.accessor_expression // Pass to next higher precedence
    ),

    accessor_expression: $ => choice(
      $.primary_expression,
      prec.right(20, seq(
        field('array', $.accessor_expression),
        '[',
        field('index', $.expression),
        ']'
      )), // Index access (higher precedence for nesting)
      prec.left(10, seq(
        field('object', $.accessor_expression),
        '.',
        field('property', $.identifier)
      )), // Member access
      prec.left(10, seq(
        field('function', $.accessor_expression),
        $.argument_list
      ))  // Call expression
    ),

    primary_expression: $ => choice(
      $.parenthesized_expression,
      prec(2, $.special_variable),
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.array_literal,
      $.list_comprehension,
      $.let_expression
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression, // Allows full expression inside parentheses
      ')'
    ),

    // Call expression, Index expression, Member access expression are now part of accessor_expression
    // let_expression and list_comprehension are now part of primary_expression

    // Let expression
    let_expression: $ => seq(
      'let',
      '(',
      optional($.let_assignments),
      ')',
      $.expression
    ),

    let_assignments: $ => seq(
      $.let_assignment,
      repeat(seq(',', $.let_assignment)),
      optional(',')
    ),

    let_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    // List comprehension - aiming for [expr for (var=list)] and [expr for (var=list) if (cond)]
    list_comprehension: $ => seq(
      '[',
      field('element', $.expression),
      field('for_clause', $.list_comprehension_for_block),
      optional(field('if_clause', $.list_comprehension_if_block)),
      ']'
    ),

    list_comprehension_for_block: $ => seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      choice($.range_expression, $.expression),
      ')'
    ),

    list_comprehension_if_block: $ => seq(
      'if',
      '(',
      field('condition', $.expression),
      ')'
    ),

    // Data types
    vector_expression: $ => seq(
      '[',
      optional(seq(
        commaSep1($.expression),
        optional(',')
      )),
      ']'
    ),

    array_literal: $ => choice(
      $.range_expression,
      seq('[', optional(commaSep1($.expression)), ']')
    ),

    object_literal: $ => seq(
      '{',
      optional(seq(
        commaSep1($.object_field),
        optional(',')
      )),
      '}'
    ),

    object_field: $ => seq(
      field('key', $.string),
      ':',
      field('value', $.expression)
    ),

    // Range expressions: [start:end] or [start:step:end]
    range_expression: $ => choice(
      seq('[', $.expression, ':', $.expression, ']'),
      seq('[', $.expression, ':', $.expression, ':', $.expression, ']')
    ),

    // Special variables - updated to use Unicode character classes
    special_variable: $ => token(/\$[\p{L}_][\p{L}\p{N}_]*/u),

    // Primitives
    string: $ => choice(
      seq('"', optional(token.immediate(/[^\"]*/)), '"'),
      seq("'", optional(token.immediate(/[^']*/)), "'")
    ),

    number: $ => {
      const decimal = /-?[0-9]+\.[0-9]+([eE][-+]?[0-9]+)?/;
      const integer = /-?[0-9]+([eE][-+]?[0-9]+)?/;
      return token(choice(
        decimal,
        integer
      ));
    },

    boolean: $ => choice(
      'true',
      'false'
    ),

    undef: $ => 'undef',

    identifier: $ => /[\p{L}_][\p{L}\p{N}_]*/u,

    operator: $ => choice(
      '+', '-', '*', '/', '%', '^',
      '&&', '||', '!',
      '==', '!=', '<', '<=', '>', '>=',
      '&', '|', '~', '<<', '>>'
    ),
  }
});

// Helper functions
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}