import { Expression } from '../expression';
import { NodeLocation } from '../../node-location';

type BinaryOperator = 
  | '+' | '-' | '*' | '/' | '%'     // Arithmetic
  | '==' | '!=' | '<' | '<=' | '>' | '>='  // Comparison
  | '&&' | '||';                           // Logical

export class BinaryExpression extends Expression {
  constructor(
    location: NodeLocation,
    public readonly left: Expression,
    public readonly operator: BinaryOperator,
    public readonly right: Expression
  ) {
    super(location);
  }

  toString(): string {
    return `(${this.left} ${this.operator} ${this.right})`;
  }

  accept<T>(visitor: any): T {
    return visitor.visitBinaryExpression(this);
  }
}
