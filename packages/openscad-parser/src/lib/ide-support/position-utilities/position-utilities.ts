/**
 * @file Implementation of the PositionUtilities interface for OpenSCAD.
 * @module ide-support/position-utilities/position-utilities
 */

import type {
  ASTNode,
  Position,
  ModuleDefinitionNode,
  FunctionDefinitionNode,
  AssignStatementNode,
  AssignmentNode,
  ExpressionNode,
} from '../../openscad-parser/ast/ast-types.js';
import type {
  PositionUtilities,
  SourceRange,
  HoverInfo,
  CompletionContext,
} from './position-types.js';
import type { SymbolInfo, SymbolProvider } from '../symbol-provider/symbol-types.js';
import { Logger } from '../../openscad-parser/error-handling/logger.js';
import { Severity } from '../../openscad-parser/error-handling/types/error-types.js';

export class OpenSCADPositionUtilities implements PositionUtilities {
  private logger: Logger;
  private symbolProvider: SymbolProvider | undefined;

  constructor(symbolProvider?: SymbolProvider) {
    this.symbolProvider = symbolProvider;
    this.logger = new Logger({
      level: Severity.DEBUG,
      includeTimestamp: true,
      includeSeverity: true,
    });
    this.logger.debug('[PositionUtilities] Initialized');
  }

  /**
   * Finds the AST node at a specific position in the source code.
   */
  findNodeAt(ast: ASTNode[], position: Position): ASTNode | null {
    this.logger.debug(
      `[PositionUtilities.findNodeAt] Searching for node at position: ${JSON.stringify(position)}`
    );

    if (!Array.isArray(ast)) {
      this.logger.warn('[PositionUtilities.findNodeAt] Received non-array AST');
      return null;
    }

    // Find the most specific (deepest) node that contains the position
    const containingNodes = this.findNodesContaining(ast, position);
    
    if (containingNodes.length === 0) {
      this.logger.debug('[PositionUtilities.findNodeAt] No nodes found at position');
      return null;
    }

    // Return the most specific (last) node
    const targetNode = containingNodes[containingNodes.length - 1];
    if (!targetNode) {
      this.logger.debug('[PositionUtilities.findNodeAt] No target node found');
      return null;
    }
    this.logger.debug(
      `[PositionUtilities.findNodeAt] Found node of type: ${targetNode.type}`
    );
    return targetNode;
  }

  /**
   * Gets the source range for an AST node.
   */
  getNodeRange(node: ASTNode): SourceRange {
    this.logger.debug(`[PositionUtilities.getNodeRange] Getting range for node type: ${node.type}`);

    if (!node.location) {
      this.logger.warn(`[PositionUtilities.getNodeRange] Node has no location information`);
      // Return a default range at origin
      return {
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      };
    }

    const range: SourceRange = {
      start: {
        line: node.location.start.line,
        column: node.location.start.column,
        offset: node.location.start.offset,
      },
      end: {
        line: node.location.end.line,
        column: node.location.end.column,
        offset: node.location.end.offset,
      },
      ...(node.location.text && { text: node.location.text }),
    };

    this.logger.debug(
      `[PositionUtilities.getNodeRange] Range: L${range.start.line}:${range.start.column} to L${range.end.line}:${range.end.column}`
    );
    return range;
  }

  /**
   * Gets hover information for an AST node.
   */
  getHoverInfo(node: ASTNode): HoverInfo | null {
    this.logger.debug(`[PositionUtilities.getHoverInfo] Getting hover info for node type: ${node.type}`);

    const range = this.getNodeRange(node);
    let description = '';
    let kind: HoverInfo['kind'] = 'unknown';
    let context: HoverInfo['context'] | undefined;

    switch (node.type) {
      case 'module_definition': {
        const moduleNode = node as ModuleDefinitionNode;
        kind = 'module';
        description = `Module: ${moduleNode.name?.name || 'unnamed'}`;
        if (moduleNode.parameters && moduleNode.parameters.length > 0) {
          context = {
            parameters: moduleNode.parameters.map(param => ({
              name: param.name || 'unnamed',
              type: this.inferParameterType(param.defaultValue),
              defaultValue: this.formatParameterValue(param.defaultValue),
            })),
          };
          description += `(${moduleNode.parameters.map(p => p.name || 'unnamed').join(', ')})`;
        } else {
          description += '()';
        }
        break;
      }
      case 'function_definition': {
        const functionNode = node as FunctionDefinitionNode;
        kind = 'function';
        description = `Function: ${functionNode.name?.name || 'unnamed'}`;
        if (functionNode.parameters && functionNode.parameters.length > 0) {
          context = {
            parameters: functionNode.parameters.map(param => ({
              name: param.name || 'unnamed',
              type: this.inferParameterType(param.defaultValue),
              defaultValue: this.formatParameterValue(param.defaultValue),
            })),
            returnType: 'any', // OpenSCAD functions can return various types
          };
          description += `(${functionNode.parameters.map(p => p.name || 'unnamed').join(', ')})`;
        } else {
          description += '()';
        }
        break;
      }
      case 'assign': {
        const assignNode = node as AssignStatementNode;
        kind = 'variable';
        if (assignNode.assignments && assignNode.assignments.length > 0) {
          const firstAssignment = assignNode.assignments[0];
          if (firstAssignment) {
            description = `Variable: ${firstAssignment.variable?.name || 'unnamed'}`;
            if (firstAssignment.value) {
              description += ` = ${this.formatParameterValue(firstAssignment.value)}`;
            }
          } else {
            description = 'Variable assignment';
          }
        } else {
          description = 'Variable assignment';
        }
        break;
      }
      case 'assignment': {
        const assignmentNode = node as AssignmentNode;
        kind = 'variable';
        description = `Variable: ${assignmentNode.variable?.name || 'unnamed'}`;
        if (assignmentNode.value) {
          description += ` = ${this.formatParameterValue(assignmentNode.value)}`;
        }
        break;
      }
      case 'expression': {
        const exprNode = node as ExpressionNode;
        kind = 'expression';
        description = `Expression: ${exprNode.expressionType || 'unknown'}`;
        if (exprNode.expressionType === 'identifier' && exprNode.name) {
          description = `Variable: ${exprNode.name}`;
          kind = 'variable';
        } else if (exprNode.expressionType === 'function_call' && exprNode.name) {
          description = `Function call: ${exprNode.name}`;
          kind = 'function';
        }
        break;
      }
      default:
        description = `${node.type}`;
        kind = 'statement';
        break;
    }

    const hoverInfo: HoverInfo = {
      node,
      range,
      description,
      kind,
      ...(context && { context }),
    };

    // Try to get symbol information if available
    if (this.symbolProvider) {
      try {
        // For now, we'll implement a simple symbol lookup
        // This could be enhanced to use the symbol provider more effectively
        this.logger.debug('[PositionUtilities.getHoverInfo] Symbol provider available but not yet integrated');
      } catch (error) {
        this.logger.warn(`[PositionUtilities.getHoverInfo] Error getting symbol info: ${error}`);
      }
    }

    this.logger.debug(`[PositionUtilities.getHoverInfo] Generated hover info: ${description}`);
    return hoverInfo;
  }

  /**
   * Gets the completion context at a specific position.
   */
  getCompletionContext(ast: ASTNode[], position: Position): CompletionContext {
    this.logger.debug(
      `[PositionUtilities.getCompletionContext] Getting completion context at position: ${JSON.stringify(position)}`
    );

    const containingNodes = this.findNodesContaining(ast, position);
    const targetNode = containingNodes.length > 0 ? containingNodes[containingNodes.length - 1] : null;
    const parentNode = containingNodes.length > 1 ? containingNodes[containingNodes.length - 2] : null;

    let type: CompletionContext['type'] = 'unknown';
    let availableSymbols: SymbolInfo[] = [];

    // Get available symbols from symbol provider
    if (this.symbolProvider) {
      try {
        availableSymbols = this.symbolProvider.getSymbols(ast);
      } catch (error) {
        this.logger.warn(`[PositionUtilities.getCompletionContext] Error getting symbols: ${error}`);
      }
    }

    // Determine completion context based on node types
    if (targetNode) {
      switch (targetNode.type) {
        case 'expression':
          type = 'expression';
          break;
        case 'assign':
          type = 'assignment';
          break;
        case 'module_definition':
        case 'function_definition':
          type = 'statement';
          break;
        default:
          if (parentNode?.type === 'module_instantiation') {
            type = 'module_call';
          } else {
            type = 'statement';
          }
          break;
      }
    }

    const context: CompletionContext = {
      type,
      availableSymbols,
      ...(targetNode && { node: targetNode }),
      ...(parentNode && { parentNode }),
    };

    this.logger.debug(`[PositionUtilities.getCompletionContext] Context type: ${type}, symbols: ${availableSymbols.length}`);
    return context;
  }

  /**
   * Checks if a position is within a source range.
   */
  isPositionInRange(position: Position, range: SourceRange): boolean {
    return (
      position.line >= range.start.line &&
      position.line <= range.end.line &&
      (position.line > range.start.line || position.column >= range.start.column) &&
      (position.line < range.end.line || position.column < range.end.column)
    );
  }

  /**
   * Finds all nodes that contain a specific position.
   */
  findNodesContaining(ast: ASTNode[], position: Position): ASTNode[] {
    const containingNodes: ASTNode[] = [];

    const searchNode = (node: ASTNode): void => {
      if (!node.location) {
        return;
      }

      const range = this.getNodeRange(node);
      if (this.isPositionInRange(position, range)) {
        containingNodes.push(node);

        // Search children if they exist
        if ('children' in node && Array.isArray(node.children)) {
          for (const child of node.children) {
            searchNode(child);
          }
        }
        if ('body' in node && Array.isArray(node.body)) {
          for (const child of node.body) {
            searchNode(child);
          }
        }
        if ('assignments' in node && Array.isArray(node.assignments)) {
          for (const assignment of node.assignments) {
            if (assignment && typeof assignment === 'object' && 'location' in assignment) {
              searchNode(assignment as ASTNode);
            }
          }
        }
      }
    };

    for (const node of ast) {
      searchNode(node);
    }

    return containingNodes;
  }

  /**
   * Helper method to infer parameter type from value.
   */
  private inferParameterType(value: any): string {
    if (value === null || value === undefined) {
      return 'any';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
    if (typeof value === 'object' && value.type === 'expression') {
      return 'expression';
    }
    return 'any';
  }

  /**
   * Helper method to format parameter value for display.
   */
  private formatParameterValue(value: any): string {
    if (value === null || value === undefined) {
      return 'undef';
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (Array.isArray(value)) {
      return `[${value.map(v => this.formatParameterValue(v)).join(', ')}]`;
    }
    if (typeof value === 'object' && value.type === 'expression') {
      return '<expression>';
    }
    return String(value);
  }
}
