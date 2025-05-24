export class NodeLocation {
  constructor(
    public readonly startPosition: { row: number; column: number },
    public readonly endPosition: { row: number; column: number },
    public readonly startIndex: number,
    public readonly endIndex: number
  ) {}
}
