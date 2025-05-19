import Parser, { TreeCursor } from 'web-tree-sitter';

/**
 * Walks a Tree-sitter CST (concrete syntax tree) using a TreeCursor and logs its structure.
 *
 * @param initialTree The starting Parser.Tree from which to create a cursor.
 * @param code The source code string.
 * @param depth The current depth of recursion (for indentation).
 * @param output Array to accumulate log lines.
 * @returns The accumulated log lines if depth is 0, otherwise void.
 */
export function cstTreeCursorWalkLog(
  initialTree: Parser.Tree,
  code: string,
  depth = 0,
  output: string[] = []
): string[] | void {
  const cursor = initialTree.walk();

  function walkRecursive(currentCursor: TreeCursor, currentDepth: number) {
    const { nodeType, startPosition: start, endPosition: end, nodeIsNamed } = currentCursor;
    const fieldName = currentCursor.currentFieldName || 'child';
    const nodeText = code.substring(currentCursor.startIndex, currentCursor.endIndex).replace(/\n/g, '\\n').substring(0, 50);
    const indent = '  '.repeat(currentDepth);

    output.push(
      `${indent}${nodeType} (field: ${fieldName}) [${start.row},${start.column} → ${end.row},${end.column}]: '${nodeText}' (named: ${nodeIsNamed})`
    );

    if (currentCursor.gotoFirstChild()) {
      do {
        walkRecursive(currentCursor, currentDepth + 1);
      } while (currentCursor.gotoNextSibling());
      currentCursor.gotoParent();
    }
  }

  walkRecursive(cursor, depth);

  if (depth === 0) {
    return output;
  }
}
