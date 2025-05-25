import { NodeLocation } from '../../../node-location';

export abstract class AstNode {
  constructor(public readonly location: NodeLocation) {}

  abstract accept<T>(visitor: any): T;
}
