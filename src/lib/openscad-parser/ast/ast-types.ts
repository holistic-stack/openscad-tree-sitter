/**
 * Base interface for all AST nodes
 */
export interface BaseNode {
  /**
   * The type of the node
   */
  type: string;
  
  /**
   * The source location of the node
   */
  location?: SourceLocation;
}

/**
 * Represents a source code location
 */
export interface SourceLocation {
  /**
   * The start position of the node
   */
  start: Position;
  
  /**
   * The end position of the node
   */
  end: Position;
  
  /**
   * The source code text of the node
   */
  text?: string;
}

/**
 * Represents a position in the source code
 */
export interface Position {
  /**
   * The 0-based line number
   */
  line: number;
  
  /**
   * The 0-based column number
   */
  column: number;
  
  /**
   * The 0-based byte offset
   */
  offset: number;
}

/**
 * Represents a 3D vector [x, y, z]
 */
export type Vector3D = [number, number, number];

/**
 * Represents a 2D vector [x, y]
 */
export type Vector2D = [number, number];

/**
 * Represents a parameter value which can be a literal or an expression
 */
export type ParameterValue = 
  | number 
  | boolean 
  | string 
  | Vector2D 
  | Vector3D 
  | ExpressionNode
  | undefined;

/**
 * Represents a parameter with an optional name
 */
export interface Parameter {
  name?: string;
  value: ParameterValue;
}

/**
 * Base interface for expression nodes
 */
export interface ExpressionNode extends BaseNode {
  type: 'expression';
  expressionType: string;
}

/**
 * Represents a literal value (number, string, boolean)
 */
export interface LiteralNode extends ExpressionNode {
  expressionType: 'literal';
  value: number | string | boolean;
}

/**
 * Represents a variable reference
 */
export interface VariableNode extends ExpressionNode {
  expressionType: 'variable';
  name: string;
}

/**
 * Represents a function call
 */
export interface FunctionCallNode extends BaseNode {
  type: 'function_call';
  name: string;
  arguments: Parameter[];
}

/**
 * Represents a translate node
 */
export interface TranslateNode extends BaseNode {
  type: 'translate';
  v: Vector2D | Vector3D;
  children: ASTNode[];
}

/**
 * Represents a cube primitive
 */
export interface CubeNode extends BaseNode {
  type: 'cube';
  size: ParameterValue;
  center?: boolean;
}

/**
 * Represents a sphere primitive
 */
export interface SphereNode extends BaseNode {
  type: 'sphere';
  r?: number;
  d?: number;
  $fn?: number;
  $fa?: number;
  $fs?: number;
}

/**
 * Represents a cylinder primitive
 */
export interface CylinderNode extends BaseNode {
  type: 'cylinder';
  h: number;
  r1?: number;
  r2?: number;
  r?: number;
  d1?: number;
  d2?: number;
  d?: number;
  center?: boolean;
  $fn?: number;
  $fa?: number;
  $fs?: number;
}

/**
 * Represents a polyhedron primitive
 */
export interface PolyhedronNode extends BaseNode {
  type: 'polyhedron';
  points: Vector3D[];
  faces: number[][];
  convexity?: number;
}

/**
 * Represents a 2D polygon
 */
export interface PolygonNode extends BaseNode {
  type: 'polygon';
  points: Vector2D[];
  paths?: number[][];
  convexity?: number;
}

/**
 * Represents a 2D circle
 */
export interface CircleNode extends BaseNode {
  type: 'circle';
  r?: number;
  d?: number;
  $fn?: number;
  $fa?: number;
  $fs?: number;
}

/**
 * Represents a 2D square
 */
export interface SquareNode extends BaseNode {
  type: 'square';
  size: number | Vector2D;
  center?: boolean;
}

/**
 * Represents a text node
 */
export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
  size?: number;
  font?: string;
  halign?: 'left' | 'center' | 'right';
  valign?: 'baseline' | 'bottom' | 'center' | 'top';
  spacing?: number;
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  language?: string;
  script?: string;
  $fn?: number;
}

/**
 * Union type of all possible AST nodes
 */
export type ASTNode = 
  | CubeNode
  | SphereNode
  | CylinderNode
  | PolyhedronNode
  | PolygonNode
  | CircleNode
  | SquareNode
  | TextNode
  | TranslateNode
  | FunctionCallNode
  | LiteralNode
  | VariableNode
  | ExpressionNode;
