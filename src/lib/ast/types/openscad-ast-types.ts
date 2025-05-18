/**
 * OpenSCAD-specific AST type definitions
 * 
 * This file defines type interfaces for all OpenSCAD language elements
 * including 2D/3D primitives, transformations, operations, and more.
 */

import { ASTNode, Expression } from './ast-types';

// =============================================
// Base types for OpenSCAD elements
// =============================================

/**
 * Base interface for all OpenSCAD elements that can have children
 */
export interface OpenSCADElementWithChildren extends ASTNode {
  children: ASTNode[];
}

/**
 * Base interface for OpenSCAD transformation elements
 */
export interface TransformationNode extends OpenSCADElementWithChildren {
  type: string;
}

/**
 * Base interface for OpenSCAD operation elements
 */
export interface OperationNode extends OpenSCADElementWithChildren {
  type: string;
}

/**
 * Interface for module call parameters
 */
export interface Parameter {
  name?: string;
  value: Expression;
}

// =============================================
// 2D Primitives
// =============================================

/**
 * Circle 2D primitive
 * Usage: circle(r=radius) or circle(d=diameter)
 */
export interface Circle2D extends ASTNode {
  type: 'Circle2D';
  radius: Expression;
  center?: boolean;
  $fn?: Expression; // Optional facet number
  $fa?: Expression; // Optional facet angle
  $fs?: Expression; // Optional facet size
}

/**
 * Square 2D primitive
 * Usage: square(size, center)
 */
export interface Square2D extends ASTNode {
  type: 'Square2D';
  size: Expression | [Expression, Expression]; // Single value or [x, y]
  center: boolean;
}

/**
 * Polygon 2D primitive
 * Usage: polygon(points, paths, convexity)
 */
export interface Polygon2D extends ASTNode {
  type: 'Polygon2D';
  points: Expression; // Array of points
  paths?: Expression; // Optional paths
  convexity?: Expression; // Optional convexity hint
}

/**
 * Text 2D primitive
 * Usage: text(text, size, font, halign, valign, spacing, direction, language, script)
 */
export interface Text2D extends ASTNode {
  type: 'Text2D';
  text: Expression;
  size?: Expression;
  font?: Expression;
  halign?: Expression;
  valign?: Expression;
  spacing?: Expression;
  direction?: Expression;
  language?: Expression;
  script?: Expression;
}

// =============================================
// 3D Primitives
// =============================================

/**
 * Cube 3D primitive
 * Usage: cube(size, center)
 */
export interface Cube3D extends ASTNode {
  type: 'Cube3D';
  size: Expression | [Expression, Expression, Expression]; // Single value or [x, y, z]
  center: boolean;
}

/**
 * Sphere 3D primitive
 * Usage: sphere(r) or sphere(d)
 */
export interface Sphere3D extends ASTNode {
  type: 'Sphere3D';
  radius: Expression;
  $fn?: Expression;
  $fa?: Expression;
  $fs?: Expression;
}

/**
 * Cylinder 3D primitive
 * Usage: cylinder(h, r1, r2, center) or cylinder(h, d1, d2, center)
 */
export interface Cylinder3D extends ASTNode {
  type: 'Cylinder3D';
  height: Expression;
  radius1: Expression;
  radius2?: Expression; // If different from radius1, creates a cone
  center?: boolean;
  $fn?: Expression;
  $fa?: Expression;
  $fs?: Expression;
}

/**
 * Polyhedron 3D primitive
 * Usage: polyhedron(points, faces, convexity)
 */
export interface Polyhedron3D extends ASTNode {
  type: 'Polyhedron3D';
  points: Expression; // Array of 3D points
  faces: Expression;  // Array of face indices
  convexity?: Expression;
}

// =============================================
// Transformations
// =============================================

/**
 * Translate transformation
 * Usage: translate([x, y, z]) { ... }
 */
export interface TranslateTransform extends TransformationNode {
  type: 'TranslateTransform';
  vector: [Expression, Expression, Expression]; // [x, y, z]
}

/**
 * Rotate transformation
 * Usage: rotate([x, y, z]) { ... } or rotate(a, [x, y, z]) { ... }
 */
export interface RotateTransform extends TransformationNode {
  type: 'RotateTransform';
  angle: Expression | [Expression, Expression, Expression]; // Single value or [x, y, z]
  axis?: [Expression, Expression, Expression]; // Optional rotation axis
}

/**
 * Scale transformation
 * Usage: scale([x, y, z]) { ... } or scale(s) { ... }
 */
export interface ScaleTransform extends TransformationNode {
  type: 'ScaleTransform';
  scaleFactors: {
    type: 'VectorLiteral';
    values: number[];
  };
}

/**
 * Mirror transformation
 * Usage: mirror([x, y, z]) { ... }
 */
export interface MirrorTransform extends TransformationNode {
  type: 'MirrorTransform';
  vector: [Expression, Expression, Expression]; // Normal vector
}

/**
 * Resize transformation
 * Usage: resize([x, y, z], auto) { ... }
 */
export interface ResizeTransform extends TransformationNode {
  type: 'ResizeTransform';
  newSize: [Expression, Expression, Expression]; // [x, y, z]
  auto?: [boolean, boolean, boolean];
}

/**
 * Multmatrix transformation
 * Usage: multmatrix(m) { ... }
 */
export interface MultmatrixTransform extends TransformationNode {
  type: 'MultmatrixTransform';
  matrix: Expression; // 4x4 transformation matrix
}

/**
 * Color transformation
 * Usage: color("colorname") { ... } or color([r, g, b, a]) { ... }
 */
export interface ColorTransform extends TransformationNode {
  type: 'ColorTransform';
  color: Expression; // Color name or [r, g, b, a] array
  alpha?: Expression; // Optional alpha value
}

/**
 * Offset transformation (for 2D shapes)
 * Usage: offset(r) { ... } or offset(delta) { ... }
 */
export interface OffsetTransform extends TransformationNode {
  type: 'OffsetTransform';
  radius?: Expression; // For round corners
  delta?: Expression; // For sharp corners
  chamfer?: boolean; // Optional chamfer flag
}

/**
 * Linear extrude transformation (converts 2D to 3D)
 * Usage: linear_extrude(height, center, convexity, twist, slices, scale) { ... }
 */
export interface LinearExtrudeTransform extends TransformationNode {
  type: 'LinearExtrudeTransform';
  height: Expression;
  center?: Expression;
  convexity?: Expression;
  twist?: Expression;
  slices?: Expression;
  scale?: Expression | [Expression, Expression];
  $fn?: Expression;
  $fa?: Expression;
  $fs?: Expression;
}

/**
 * Rotate extrude transformation (converts 2D to 3D by rotation)
 * Usage: rotate_extrude(angle, convexity) { ... }
 */
export interface RotateExtrudeTransform extends TransformationNode {
  type: 'RotateExtrudeTransform';
  angle?: Expression;
  convexity?: Expression;
  $fn?: Expression;
  $fa?: Expression;
  $fs?: Expression;
}

/**
 * Projection transformation (converts 3D to 2D)
 * Usage: projection(cut) { ... }
 */
export interface ProjectionTransform extends TransformationNode {
  type: 'ProjectionTransform';
  cut?: boolean;
}

// =============================================
// Boolean Operations
// =============================================

/**
 * Union operation (combines shapes)
 * Usage: union() { ... }
 */
export interface UnionOperation extends OperationNode {
  type: 'UnionOperation';
}

/**
 * Difference operation (subtracts shapes)
 * Usage: difference() { ... }
 */
export interface DifferenceOperation extends OperationNode {
  type: 'DifferenceOperation';
}

/**
 * Intersection operation (keeps common parts)
 * Usage: intersection() { ... }
 */
export interface IntersectionOperation extends OperationNode {
  type: 'IntersectionOperation';
}

/**
 * Minkowski sum operation
 * Usage: minkowski() { ... }
 */
export interface MinkowskiOperation extends OperationNode {
  type: 'MinkowskiOperation';
  convexity?: Expression;
}

/**
 * Hull operation (creates convex hull)
 * Usage: hull() { ... }
 */
export interface HullOperation extends OperationNode {
  type: 'HullOperation';
}

// =============================================
// Control Flow
// =============================================

/**
 * For loop statement
 * Usage: for(i = [start:step:end]) { ... }
 */
export interface ForStatement extends OpenSCADElementWithChildren {
  type: 'ForStatement';
  variable: string;
  iterable: Expression;
}

/**
 * Intersection for loop
 * Usage: intersection_for(i = [start:step:end]) { ... }
 */
export interface IntersectionForStatement extends OpenSCADElementWithChildren {
  type: 'IntersectionForStatement';
  variable: string;
  iterable: Expression;
}

/**
 * Conditional if statement
 * Usage: if (condition) { ... } else { ... }
 */
export interface IfStatement extends ASTNode {
  type: 'IfStatement';
  condition: Expression;
  thenBranch: ASTNode[];
  elseBranch?: ASTNode[];
}

/**
 * Let statement (assigns variables for a local scope)
 * Usage: let(var1 = value1, var2 = value2) { ... }
 */
export interface LetStatement extends OpenSCADElementWithChildren {
  type: 'LetStatement';
  assignments: { name: string; value: Expression }[];
}

/**
 * Each statement (iterates over children)
 * Usage: each [child1, child2, ...] { ... }
 */
export interface EachStatement extends OpenSCADElementWithChildren {
  type: 'EachStatement';
  collection: Expression;
}

// =============================================
// Module & Function Declarations
// =============================================

/**
 * Module declaration
 * Usage: module name(params) { ... }
 */
export interface ModuleDeclaration extends ASTNode {
  type: 'ModuleDeclaration';
  name: string;
  parameters: Parameter[];
  body: ASTNode[];
}

/**
 * Function declaration
 * Usage: function name(params) = expression;
 */
export interface FunctionDeclaration extends ASTNode {
  type: 'FunctionDeclaration';
  name: string;
  parameters: Parameter[];
  expression: Expression;
}

/**
 * Module instantiation (calling a module)
 * Usage: name(args) { ... }
 */
export interface ModuleInstantiation extends OpenSCADElementWithChildren {
  type: 'ModuleInstantiation';
  name: string;
  arguments: Parameter[];
}

/**
 * Function call (calling a function)
 * Usage: name(args)
 */
export interface FunctionCall extends Expression {
  type: 'FunctionCall';
  name: string;
  arguments: Parameter[];
}

// =============================================
// Special Variables
// =============================================

/**
 * Special variable reference
 * Examples: $fn, $fa, $fs, $t, etc.
 */
export interface SpecialVariable extends Expression {
  type: 'SpecialVariable';
  name: string; // $fn, $fa, $fs, $t, etc.
  value?: Expression;
}

// =============================================
// Import & Include
// =============================================

/**
 * Include statement (textually includes the file)
 * Usage: include <filename> or include "filename"
 */
export interface IncludeStatement extends ASTNode {
  type: 'IncludeStatement';
  path: string;
}

/**
 * Use statement (imports the modules and functions)
 * Usage: use <filename> or use "filename"
 */
export interface UseStatement extends ASTNode {
  type: 'UseStatement';
  path: string;
}

/**
 * Import statement (imports a file for use)
 * Usage: import("filename")
 */
export interface ImportStatement extends ASTNode {
  type: 'ImportStatement';
  path: string;
  convexity?: Expression;
  layer?: Expression;
}

/**
 * Surface statement (imports a heightmap)
 * Usage: surface("filename", center, invert, convexity)
 */
export interface SurfaceStatement extends ASTNode {
  type: 'SurfaceStatement';
  file: string;
  center?: boolean;
  invert?: boolean;
  convexity?: Expression;
}
