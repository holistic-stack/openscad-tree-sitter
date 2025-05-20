import { TSNode, getLocation } from '../utils/location-utils';
import * as ast from '../ast-types';
import { BaseGenerator } from './base-generator';

/**
 * Generator for CSG operation nodes (union, difference, intersection, hull, minkowski)
 */
export class CSGGenerator extends BaseGenerator {
  /**
   * Create an AST node based on the function name
   */
  protected createASTNode(node: TSNode, functionName: string, args: ast.Parameter[]): ast.ASTNode | null {
    switch (functionName) {
      case 'union':
        return this.createUnionNode(node, args);
      case 'difference':
        return this.createDifferenceNode(node, args);
      case 'intersection':
        return this.createIntersectionNode(node, args);
      case 'hull':
        return this.createHullNode(node, args);
      case 'minkowski':
        return this.createMinkowskiNode(node, args);
      default:
        return null;
    }
  }

  /**
   * Create a union node
   */
  private createUnionNode(node: TSNode, args: ast.Parameter[]): ast.UnionNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'union',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a difference node
   */
  private createDifferenceNode(node: TSNode, args: ast.Parameter[]): ast.DifferenceNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'difference',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create an intersection node
   */
  private createIntersectionNode(node: TSNode, args: ast.Parameter[]): ast.IntersectionNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'intersection',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a hull node
   */
  private createHullNode(node: TSNode, args: ast.Parameter[]): ast.HullNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'hull',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Create a minkowski node
   */
  private createMinkowskiNode(node: TSNode, args: ast.Parameter[]): ast.MinkowskiNode {
    const children: ast.ASTNode[] = [];
    this.processChildNodes(node, children);

    return {
      type: 'minkowski',
      children,
      location: getLocation(node)
    };
  }

  /**
   * Process child nodes of a CSG operation node
   */
  private processChildNodes(node: TSNode, children: ast.ASTNode[]): void {
    // Check for a body node
    const bodyNode = node.childForFieldName('body');
    if (bodyNode) {
      if (bodyNode.type === 'block') {
        console.log(`[CSGGenerator.processChildNodes] Found block body for ${node.text.substring(0,30)}`);
        for (const statementCSTNode of bodyNode.children) {
          if (statementCSTNode && statementCSTNode.type === 'statement') {
            this.processNode(statementCSTNode, children);
          }
        }
      } else if (bodyNode.type === 'statement') {
        console.log(`[CSGGenerator.processChildNodes] Found statement body for ${node.text.substring(0,30)}: ${bodyNode.text.substring(0,20)}`);
        this.processNode(bodyNode, children);
      }
    } else {
      console.log(`[CSGGenerator.processChildNodes] No body found for ${node.text.substring(0,30)}`);
    }
  }
}
