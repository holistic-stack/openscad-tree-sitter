import { ParserRuleContext } from 'antlr4ts';
import { NodeLocation } from '../../node-location';
import { Expression } from '../nodes/expression';

export abstract class BaseVisitor {
  /**
   * Creates a NodeLocation from a parser rule context
   */
  protected createNodeLocation(ctx: ParserRuleContext): NodeLocation {
    return new NodeLocation(
      { row: ctx.start.line - 1, column: ctx.start.charPositionInLine },
      { row: ctx.stop?.line ? ctx.stop.line - 1 : ctx.start.line - 1, 
        column: ctx.stop?.charPositionInLine ? ctx.stop.charPositionInLine + (ctx.stop.text?.length || 0) : ctx.start.charPositionInLine },
      ctx.start.startIndex,
      ctx.stop?.stopIndex || ctx.start.startIndex
    );
  }

  /**
   * Visits a single node in the parse tree
   */
  protected visitNode(node: ParserRuleContext): Expression | null {
    // This will be implemented by concrete visitors
    throw new Error('Method not implemented.');
  }

  /**
   * Visits an array of parse tree nodes
   */
  protected visitNodes(nodes: ParserRuleContext[]): (Expression | null)[] {
    return nodes.map(node => this.visitNode(node)).filter(Boolean) as Expression[];
  }
}
