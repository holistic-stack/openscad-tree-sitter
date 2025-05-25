import { AstNode } from './ast-node';
import { NodeLocation } from '../../../node-location';

export abstract class Expression extends AstNode {
  constructor(location: NodeLocation) {
    super(location);
  }

  abstract accept<T>(visitor: any): T;
}
