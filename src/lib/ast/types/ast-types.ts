/**
 * AST node base interface
 * Defines properties common to all AST nodes
 */
export interface ASTNode {
  type: string;
  position: ASTPosition;
}

/**
 * Position information for AST nodes
 * Contains start and end line/column information
 */
export interface ASTPosition {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

/**
 * Program node - root of the AST
 */
export interface Program extends ASTNode {
  type: 'Program';
  children: ASTNode[];
}

/**
 * Module declaration node
 */
export interface ModuleDeclaration extends ASTNode {
  type: 'ModuleDeclaration';
  name: string;
  parameters: ParameterDeclaration[];
  body: BlockStatement;
}

/**
 * Parameter declaration node
 */
export interface ParameterDeclaration extends ASTNode {
  type: 'ParameterDeclaration';
  name: string;
  defaultValue?: Expression;
}

/**
 * Block statement node
 */
export interface BlockStatement extends ASTNode {
  type: 'BlockStatement';
  statements: ASTNode[];
}

/**
 * Base interface for all expression nodes
 */
export interface Expression extends ASTNode {
  type: string;
}

/**
 * Literal value expression (number, string, boolean)
 */
export interface LiteralExpression extends Expression {
  type: 'LiteralExpression';
  valueType: 'number' | 'string' | 'boolean';
  value: string | number | boolean;
}

/**
 * Identifier reference expression
 */
export interface IdentifierExpression extends Expression {
  type: 'IdentifierExpression';
  name: string;
}

/**
 * Binary operation expression
 */
export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

/**
 * Function call expression
 */
export interface CallExpression extends Expression {
  type: 'CallExpression';
  callee: IdentifierExpression;
  arguments: Expression[];
}

/**
 * Assignment statement
 */
export interface AssignmentStatement extends ASTNode {
  type: 'AssignmentStatement';
  left: IdentifierExpression;
  right: Expression;
}

/**
 * Conditional statement (if)
 */
export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Expression;
  consequent: BlockStatement;
  alternate?: BlockStatement | IfStatement;
}

/**
 * Loop statement
 */
export interface ForStatement extends ASTNode {
  type: 'ForStatement';
  variable: string;
  iterable: Expression;
  body: BlockStatement;
}
