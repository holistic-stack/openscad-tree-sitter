/**
 * @file OpenSCAD grammar for tree-sitter
 * @license MIT
 *
 * CHANGELOG:
 * ----------
 * 2024-07-XX - Optimized grammar to remove unnecessary conflicts
 *            - Fixed precedence issues between expressions and module instantiations
 *            - Improved error recovery for various syntax errors
 *            - Enhanced support for list comprehensions and object literals
 *            - Added proper precedence handling for let expressions
 *            - Fixed conflicts between modifiers and unary expressions
 *            - Added comprehensive comments for better maintainability
 */

// Helper function for comma-separated lists
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}

// Helper function for optional comma-separated lists
function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: 'openscad',

  word: $ => $.identifier,

  extras: $ => [
    /\s/,
    $.comment,
    $.error_sentinel, // Add error sentinel for better recovery
  ],

  /**
   * Conflicts section
   *
   * We've removed most unnecessary conflicts by using proper precedence rules.
   * The remaining conflicts are necessary for handling ambiguous syntax in OpenSCAD.
   */
  conflicts: $ => [
    // Statement vs if_statement conflict is needed because an if_statement can be a statement
    // but also needs special handling for the else clause
    [$.statement, $.if_statement],

    // if_statement self-conflict is needed for nested if-else statements
    [$.if_statement],

    // module_child conflict is needed for proper handling of the children() syntax
    [$.module_child],

    // module_instantiation conflict is needed for handling blocks after module calls
    // This also implies module_instantiation is a defined rule.
    [$.module_instantiation],

    // range_expression conflict is needed for handling nested range expressions
    [$.range_expression],

    // primary_expression and object_field conflict is needed for handling string literals
    // that could be either a string value or an object key
    [$.primary_expression, $.object_field],

    // array_literal and list_comprehension_for conflict is needed for handling list comprehensions
    [$.array_literal, $.list_comprehension_for],

    // Declare a conflict between a module_instantiation_with_body 
    // and an expression. This is the core of our issue:
    // `translate()` could be an expression, or it could be the start
    // of `translate() cube();`
    [$._module_instantiation_with_body, $.expression],

    // Added to resolve conflict: `module_instantiation block • next_statement_token`
    // This allows `statement` to be ambiguous with itself in this specific sequence.
    [$.statement],

    // Added to resolve: accessor_expression argument_list block • next_token
    [$.statement, $._module_instantiation_with_body],

    // Added to resolve: for (for_header) block • next_token
    [$.statement, $.for_statement]
  ],

  rules: {
    source_file: $ => repeat($.statement),

    comment: $ => choice(
      seq('//', /.*/, /\r?\n/),
      seq('/*', /([^*]|\*[^\/])*\*\//)
    ),

    // Error sentinel for better recovery
    error_sentinel: $ => token(prec(-1, /[^\s]+/)),

    // Error recovery helper
    _error_recovery: $ => token(prec(-1, /[^;{}()\[\]\s]+/)),

    statement: $ => choice(
      $.include_statement,
      $.use_statement,
      $.module_definition,
      $.function_definition,
      $.assignment_statement,
      $.module_instantiation, // Directly use the module_instantiation rule
      $.if_statement,
      $.for_statement,
      $.echo_statement,
      $.assert_statement,
      $.expression_statement, // Make semicolon mandatory for expression statements
      $.block
    ),

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

    module_definition: $ => seq(
      'module',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      field('body', $.block)
    ),

    function_definition: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.parameter_list),
      '=',
      field('value', $.expression),
      optional(';') // Make semicolon optional for error recovery
    ),

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

    assignment_statement: $ => seq(
      field('name', choice($.special_variable, $.identifier)),
      '=',
      field('value', $.expression),
      optional(';') // Make semicolon optional for error recovery
    ),

    block: $ => seq(
      '{',
      repeat($.statement),
      choice(
        '}',
        // Error recovery for missing closing brace
        token.immediate(prec(-1, /[^\s;]/)) // Match any non-whitespace, non-semicolon character
      )
    ),

    _module_instantiation_with_body: $ => seq(
      optional($.modifier),
      field('name', $.accessor_expression),
      field('arguments', $.argument_list),
      field('body', choice(
        $.block,
        $.statement // A full statement, which will handle its own termination (e.g., semicolon for an inner module_instantiation_simple)
      ))
    ),

    _module_instantiation_simple: $ => seq(
      optional($.modifier),
      field('name', $.accessor_expression),
      field('arguments', $.argument_list),
      ';'
    ),

    module_instantiation: $ => choice(
      prec(2, $._module_instantiation_with_body),
      prec(1, $._module_instantiation_simple)
    ),

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
      seq($.special_variable, '=', $.expression),
      seq($.identifier, '=', $.expression)
    ),

    module_child: $ => seq(
      'children',
      optional(seq(
        '(',
        optional($.expression),
        choice(
          ')',
          // Error recovery for missing closing parenthesis
          token.immediate(prec(-1, /[;]/)) // Match semicolon
        )
      )),
      optional(';') // Make semicolon optional for error recovery
    ),

    /**
     * Modifier rule for OpenSCAD modifiers (#, !, %, *)
     *
     * We use precedence 10 to resolve conflicts with unary_expression which uses
     * precedence 9. This ensures that modifiers like '!' are properly distinguished
     * from the logical NOT operator in expressions.
     *
     * Example: !cube(10) vs. !true
     */
    modifier: $ => prec(10, choice(
      '#', // Highlight/debug modifier
      '!', // Difference modifier
      '%', // Background modifier (not rendered)
      '*', // Disable modifier
    )),

    if_statement: $ => seq(
      'if',
      '(',
      $.expression,
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[{]/)) // Match opening brace
      ),
      choice(
        $.block,
        $.statement
      ),
      optional(seq(
        'else',
        choice(
          $.if_statement,
          $.block,
          $.statement
        )
      ))
    ),

    /**
     * For loop rule
     *
     * This rule handles for loops in OpenSCAD.
     *
     * Examples:
     *   for(i = [0:10]) cube(i);
     *   for(i = [1,2,3]) translate([i,0,0]) sphere(i);
     */
    for_statement: $ => seq(
      'for',
      '(',
      $.for_header,
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[{]/)) // Match opening brace
      ),
      choice(
        $.block,
        $.statement
      )
    ),

    /**
     * For loop header rule
     *
     * This rule handles the iterator part of for loops: for(i = [0:10])
     * We use precedence 2 for the overall rule and precedence 2 for range_expression
     * to resolve conflicts with array_literal.
     *
     * Examples:
     *   for(i = [0:10])       // Range-based iteration
     *   for(i = [0:2:10])     // Range with step
     *   for(i = [1,2,3,4])    // Array-based iteration
     *   for($fn = 36)         // Special variable iteration
     */
    for_header: $ => prec(2, seq(
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      // Use higher precedence for range_expression to resolve conflict with array_literal
      choice(prec(2, $.range_expression), $.expression)
    )),

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

    echo_statement: $ => seq(
      'echo',
      '(',
      optional($.arguments),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;]/)) // Match semicolon
      ),
      optional(';') // Make semicolon optional for error recovery
    ),

    assert_statement: $ => seq(
      'assert',
      '(',
      $.expression,
      optional(seq(',', $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;]/)) // Match semicolon
      ),
      optional(';') // Make semicolon optional for error recovery
    ),

    expression_statement: $ => seq($.expression, ';'),

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
        field('operator', '||'),
        field('right', $.logical_and_expression)
      )),
      $.logical_and_expression // Pass to next higher precedence
    ),

    logical_and_expression: $ => choice(
      prec.left(3, seq(
        field('left', $.logical_and_expression),
        field('operator', '&&'),
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

    /**
     * Accessor expression rule
     *
     * This rule handles various ways to access values:
     * - Primary expressions (variables, literals)
     * - Array indexing (arr[i])
     * - Member access (obj.prop)
     * - Function calls (func())
     *
     * We use different precedence levels to resolve conflicts:
     * - Primary expression: precedence 1 (lowest)
     * - Member access and function calls: precedence 10
     * - Array indexing: precedence 20 (highest)
     *
     * Examples:
     *   x                // Variable access
     *   arr[i]           // Array indexing
     *   obj.prop         // Member access
     *   func()           // Function call
     *   arr[i].prop      // Chained access
     *   func()[i]        // Function call with indexing
     */
    accessor_expression: $ => choice(
      // Primary expression has lowest precedence in this context
      prec(1, $.primary_expression),

      // Index access (highest precedence for nesting)
      prec.right(20, seq(
        field('array', $.accessor_expression),
        '[',
        field('index', $.expression),
        choice(
          ']',
          // Error recovery for missing closing bracket
          token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
        )
      )),

      // Member access
      prec.left(10, seq(
        field('object', $.accessor_expression),
        '.',
        field('property', $.identifier)
      )),

      // Call expression
      prec.left(10, seq(
        field('function', $.accessor_expression),
        $.argument_list
      ))
    ),

    primary_expression: $ => choice(
      $.parenthesized_expression,
      $.special_variable,
      $.identifier,
      $.number,
      $.string,
      $.boolean,
      $.undef,
      $.array_literal,
      $.list_comprehension,
      $.object_literal,
      $.let_expression
    ),

    parenthesized_expression: $ => seq(
      '(',
      $.expression,
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,{}\[]/)) // Match semicolon, comma, braces, or opening bracket
      )
    ),

    array_literal: $ => prec(1, choice(
      $.range_expression,
      seq('[',
        optional(commaSep1($.expression)),
        choice(
          ']',
          // Error recovery for missing closing bracket
          token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
        )
      )
    )),

    /**
     * List comprehension rule
     *
     * This rule handles list comprehensions in two different syntaxes:
     * 1. Traditional syntax: [expr for (var=list) if (cond)]
     * 2. OpenSCAD syntax: [for (var=list) if (cond) expr]
     *
     * We use precedence 3 (higher than array_literal's precedence 1) to resolve
     * conflicts between list comprehensions and array literals.
     *
     * Examples:
     *   [x*x for (x = [1:5])]              // Traditional syntax
     *   [for (x = [1:5]) if (x % 2 == 0) x] // OpenSCAD syntax
     */
    list_comprehension: $ => prec(3, seq(
      '[',
      choice(
        // Traditional syntax: [expr for (var=list) if (cond)]
        seq(
          field('element', $.expression),
          field('for_clause', $.list_comprehension_for),
          optional(field('if_clause', $.list_comprehension_if))
        ),
        // OpenSCAD syntax: [for (var=list) if (cond) expr]
        seq(
          field('for_clause', $.list_comprehension_for_block),
          optional(field('if_clause', $.list_comprehension_if_block)),
          field('element', $.expression)
        )
      ),
      choice(
        ']',
        // Error recovery for missing closing bracket
        token.immediate(prec(-1, /[;,){}]/)) // Match semicolon, comma, closing parenthesis, or braces
      )
    )),

    // Traditional syntax: for (var=list)
    list_comprehension_for: $ => prec(1, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // Traditional syntax: if (cond)
    list_comprehension_if: $ => prec(1, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // OpenSCAD syntax: for (var=list)
    // Higher precedence than traditional syntax to resolve conflict
    list_comprehension_for_block: $ => prec(4, seq(
      'for',
      '(',
      field('iterator', choice($.identifier, $.special_variable)),
      '=',
      field('range', choice($.range_expression, $.expression)),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    // OpenSCAD syntax: if (cond)
    // Higher precedence than traditional syntax to resolve conflict
    list_comprehension_if_block: $ => prec(4, seq(
      'if',
      '(',
      field('condition', $.expression),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,\[\]{}]/)) // Match semicolon, comma, brackets, or braces
      )
    )),

    /**
     * Object literal rule
     *
     * This rule handles object literals, which are key-value pairs enclosed in braces.
     * In OpenSCAD, object literals are used for various purposes including configuration
     * objects and data structures.
     *
     * We use precedence 1 to match the precedence of array_literal.
     *
     * Examples:
     *   {"size": 10, "center": true}
     *   {"x": 1, "y": 2, "z": 3}
     */
    object_literal: $ => prec(1, seq(
      '{',
      optional(seq(
        commaSep1($.object_field),
        optional(',')
      )),
      choice(
        '}',
        // Error recovery for missing closing brace
        token.immediate(prec(-1, /[;,)\[]/)) // Match semicolon, comma, closing parenthesis, or opening bracket
      )
    )),

    object_field: $ => seq(
      field('key', $.string),
      ':',
      field('value', $.expression)
    ),

    /**
     * Let expression rule
     *
     * This rule handles let expressions, which allow defining local variables
     * within an expression context.
     *
     * We use precedence 5 (higher than conditional_expression's precedence 1) to resolve
     * conflicts between let expressions and other expressions.
     *
     * Examples:
     *   let(x = 10, y = 20) x + y
     *   let(r = 5) circle(r)
     */
    let_expression: $ => prec(5, seq(
      'let',
      '(',
      commaSep1($.let_assignment),
      choice(
        ')',
        // Error recovery for missing closing parenthesis
        token.immediate(prec(-1, /[;,{}\[]/)) // Match semicolon, comma, braces, or opening bracket
      ),
      field('body', $.expression)
    )),

    let_assignment: $ => seq(
      field('name', choice($.identifier, $.special_variable)),
      '=',
      field('value', $.expression)
    ),

    special_variable: $ => token(/\$[\p{L}_][\p{L}\p{N}_]*/u),

    string: $ => choice(
      // Double-quoted strings with proper termination
      seq('"', optional(token.immediate(/[^"]*/)), '"'),
      // Single-quoted strings with proper termination
      seq("'", optional(token.immediate(/[^']*/)), "'"),
      // Error recovery for unterminated double-quoted strings
      seq('"', token.immediate(/[^"\n]*/)),
      // Error recovery for unterminated single-quoted strings
      seq("'", token.immediate(/[^'\n]*/)),
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
  }
});

// Helper function for sequences separated by a delimiter
function sepBy(delimiter, rule) {
  return optional(sepBy1(delimiter, rule));
}

function sepBy1(delimiter, rule) {
  return seq(rule, repeat(seq(delimiter, rule)));
}
