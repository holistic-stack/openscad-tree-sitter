import { AstNode } from './ast-node.js';
import { NodeLocation } from '../../../node-location.js';

export abstract class Expression extends AstNode {
  constructor(location: NodeLocation) {
    super(location);
  }

  abstract accept<T>(visitor: unknown): T;
}
