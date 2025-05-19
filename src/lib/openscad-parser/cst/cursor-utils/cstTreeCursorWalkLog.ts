import {TreeCursor} from "web-tree-sitter";

/**
 * Logs the CST structure for diagnostics and development using TreeCursor.
 * Features:
 * - Logs node type, field name, start/end positions
 * - Indentation by depth
 * - Recursively traverses and logs all children
 * - Preserves cursor position after traversal
 *
 * @param cursor - The tree-sitter TreeCursor to traverse
 * @param source - Source code string for extracting node text
 * @param depth - Current depth (for indentation)
 * @param maxDepth - Maximum depth to traverse
 */
export const cstTreeCursorWalkLog = (
    cursor: TreeCursor | null | undefined,
    source: string,
    depth = 0,
    maxDepth = 10
): void => {
    if (!cursor || depth > maxDepth) return;

    // Store initial cursor state to restore later
    const startNodeType = cursor.nodeType;
    const startFieldName = cursor.currentFieldName;
    const startDepth = cursor.currentDepth;

    const indent = "  ".repeat(depth);
    const type = cursor.nodeType;
    const fieldName = cursor.currentFieldName ? `(field: ${cursor.currentFieldName})` : '';

    // Extract text from source using cursor positions
    const startRow = cursor.startPosition.row;
    const startCol = cursor.startPosition.column;
    const endRow = cursor.endPosition.row;
    const endCol = cursor.endPosition.column;

    let text = '';
    const lines = source.split('\n');

    if (startRow === endRow) {
        // Single line node
        text = lines[startRow]?.substring(startCol, endCol) || '';
    } else {
        // Multi-line node - truncate for display
        const firstLine = lines[startRow]?.substring(startCol) || '';
        const lastLine = lines[endRow]?.substring(0, endCol) || '';
        text = firstLine + (endRow - startRow > 1 ? '...' : '') + lastLine;
    }

    // Clean up text for display (limit length, escape newlines)
    const displayText = text.length > 50
        ? text.substring(0, 47) + '...'
        : text;
    const cleanText = displayText.replace(/\n/g, '\\n');

    // Log node information
    const logLine = `${indent}${type} ${fieldName} [${startRow},${startCol} → ${endRow},${endCol}]: '${cleanText}'`;
    console.log(
        logLine
    );

    // Recursively traverse children
    if (cursor.gotoFirstChild()) {
        do {
            cstTreeCursorWalkLog(cursor, source, depth + 1, maxDepth);
        } while (cursor.gotoNextSibling());

        // Return cursor to parent after traversing all children
        cursor.gotoParent();
    }

    // Verify we're back at the starting point
    if (cursor.nodeType !== startNodeType ||
        cursor.currentFieldName !== startFieldName ||
        cursor.currentDepth !== startDepth) {
        console.error(
            `Cursor state changed after traversal. Expected ${startNodeType} at depth ${startDepth}, ` +
            `got ${cursor.nodeType} at depth ${cursor.currentDepth}`
        );
    }
};
