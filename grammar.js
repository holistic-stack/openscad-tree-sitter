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
  ],

  // Handle conflicts
  conflicts: $ => [
    [$.module_instantiation, $.call_expression],
    [$.if_statement, $.module_instantiation], // For else-if chains
    [$.for_statement, $.list_comprehension], // For list comprehensions
    [$.statement, $.if_statement], // For nested if-else statements
    [$.if_statement], // Self-conflict for nested if-else
    [$.expression, $.list_comprehension_for], // For list comprehension for loop
  ],

  rules: {
    // Program is the root rule
    source_file: $ => repeat($.statement),

    // Comments
    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^/])*\*+\//) // Improved to handle nested comments
    ),

    // Statements
    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      $.module_definition,
      $.function_definition,
      $.assignment_statement,
      $.module_instantiation,
      $.if_statement,
      $.for_statement,
      $.echo_statement,
      $.assert_statement,
      seq($.expression, ';')
    ),

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
      ')'
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
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression),
      ';'
    ),

    // Blocks
    block: $ => seq(
      '{',
      repeat($.statement),
      '}'
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
      ')'
    ),

    arguments: $ => seq(
      $.argument,
      repeat(seq(',', $.argument)),
      optional(',')
    ),

    argument: $ => choice(
      $.expression,
      seq($.identifier, '=', $.expression),
      seq($.special_variable, '=', $.expression)
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
      optional(seq(
        'else',
        choice(
          $.if_statement, // else if
          $.block,
          $.statement
        )
      ))
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
      field('variable', $.identifier),
      '=',
      field('iterator', $.expression)
    ),

    // Echo and Assert
    echo_statement: $ => seq(
      'echo',
      '(',
      optional($.echo_arguments),
      ')',
      ';'
    ),

    echo_arguments: $ => seq(
      $.expression,
      repeat(seq(',', $.expression)),
      optional(',')
    ),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      ')',
      ';'
    ),

    // Expressions with precedence handling
    expression: $ => choice(
      $.number,
      $.boolean,
      $.string,
      $.special_variable,
      $.vector_expression,
      $.range_expression,
      $.list_comprehension,
      $.identifier,
      $.call_expression,
      $.unary_expression,
      $.binary_expression,
      $.conditional_expression,
      $.let_expression,
      $.index_expression,
      $.member_expression,
      $.parenthesized_expression
    ),

    // Special variables (like $fn, $fa, etc.)
    special_variable: $ => /\$[a-zA-Z_][a-zA-Z0-9_]*/,

    // Primitive types
    number: $ => /[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?/,

    boolean: $ => choice('true', 'false'),

    string: $ => choice(
      seq('"', repeat(choice(/[^"\\]/, /\\./)), '"'),
      seq("'", repeat(choice(/[^'\\]/, /\\./)), "'"),
      seq("<", repeat(choice(/[^>\\]/, /\\./)), ">")
    ),

    // Vector expressions
    vector_expression: $ => seq(
      '[',
      optional(seq(
        $.expression,
        repeat(seq(',', $.expression)),
        optional(',')
      )),
      ']'
    ),

    // Range expressions
    range_expression: $ => choice(
      seq('[', $.expression, ':', $.expression, ']'),
      seq('[', $.expression, ':', $.expression, ':', $.expression, ']')
    ),

    // List comprehensions
    list_comprehension: $ => seq(
      '[',
      $.list_comprehension_for,
      $.expression,
      ']'
    ),

    list_comprehension_for: $ => seq(
      'for',
      '(',
      $.for_header,
      ')',
      optional($.list_comprehension_if)
    ),

    list_comprehension_if: $ => seq(
      'if',
      '(',
      $.expression,
      ')'
    ),

    // Function call expressions
    call_expression: $ => seq(
      field('function', $.identifier),
      field('arguments', $.argument_list)
    ),

    // Unary expressions
    unary_expression: $ => prec.left(6, choice(
      seq('-', $.expression),
      seq('+', $.expression),
      seq('!', $.expression)
    )),

    // Binary expressions with precedence
    binary_expression: $ => choice(
      ...[
        ['*', 5], ['/', 5], ['%', 5],
        ['+', 4], ['-', 4],
        ['<', 3], ['<=', 3], ['>', 3], ['>=', 3],
        ['==', 2], ['!=', 2],
        ['&&', 1],
        ['||', 0],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $.expression),
          field('operator', alias(operator, $.operator)),
          field('right', $.expression)
        ))
      )
    ),

    // Add operator as a named node to make the field label work
    operator: $ => choice(
      '*', '/', '%',
      '+', '-',
      '<', '<=', '>', '>=',
      '==', '!=',
      '&&',
      '||'
    ),

    // Conditional expression
    conditional_expression: $ => prec.right(0, seq(
      field('condition', $.expression),
      '?',
      field('consequence', $.expression),
      ':',
      field('alternative', $.expression)
    )),

    // Let expression
    let_expression: $ => prec.right(1, seq(
      'let',
      '(',
      $.let_clause,
      repeat(seq(',', $.let_clause)),
      optional(','),
      ')',
      $.expression
    )),

    let_clause: $ => seq(
      choice($.identifier, $.special_variable),
      '=',
      $.expression
    ),

    // Index expression
    index_expression: $ => prec.left(7, seq(
      field('array', $.expression),
      '[',
      field('index', $.expression),
      ']'
    )),

    // Member expression for accessing properties (e.g., vec.x)
    member_expression: $ => prec.left(7, seq(
      field('object', $.expression),
      '.',
      field('property', $.identifier)
    )),

    // Parenthesized expressions
    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      ')'
    ),

    // Identifier
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  }
}); 