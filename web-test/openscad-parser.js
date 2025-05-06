/**
 * OpenSCAD Tree-sitter WebAssembly wrapper
 * 
 * This file provides a simple API to initialize and use the OpenSCAD Tree-sitter parser
 * from WebAssembly in a browser environment.
 */

export class OpenSCADParser {
  constructor() {
    this.parser = null;
    this.language = null;
    this.initialized = false;
    this.error = null;
  }

  /**
   * Initialize the parser with the WebAssembly module
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initialize() {
    try {
      // Load the Tree-sitter library
      const TreeSitter = await import('https://unpkg.com/web-tree-sitter@0.20.8/tree-sitter.js');
      await TreeSitter.default.init();

      // Create a parser
      this.parser = new TreeSitter.default();

      // Try to load the OpenSCAD language from the WebAssembly module
      this.language = await TreeSitter.default.Language.load('./tree-sitter-openscad.wasm');
      this.parser.setLanguage(this.language);

      this.initialized = true;
      return true;
    } catch (error) {
      this.error = error;
      console.error('Failed to initialize OpenSCAD parser:', error);
      return false;
    }
  }

  /**
   * Parse OpenSCAD code and return the syntax tree
   * @param {string} code OpenSCAD code to parse
   * @returns {Object|null} The syntax tree or null if parsing failed
   */
  parse(code) {
    if (!this.initialized) {
      console.error('Parser not initialized. Call initialize() first.');
      return null;
    }

    try {
      const tree = this.parser.parse(code);
      return tree;
    } catch (error) {
      console.error('Error parsing OpenSCAD code:', error);
      return null;
    }
  }

  /**
   * Convert a syntax tree to a simplified JSON object for display
   * @param {Object} node The syntax tree node
   * @returns {Object} A simplified JSON representation of the tree
   */
  treeToJson(node) {
    if (!node) return null;

    const result = {
      type: node.type,
      start: { row: node.startPosition.row, column: node.startPosition.column },
      end: { row: node.endPosition.row, column: node.endPosition.column },
      text: node.text
    };

    if (node.childCount > 0) {
      result.children = [];
      for (let i = 0; i < node.childCount; i++) {
        const childNode = node.child(i);
        const fieldName = node.fieldNameForChild(i);
        
        const childJson = this.treeToJson(childNode);
        if (fieldName) {
          childJson.field = fieldName;
        }
        
        result.children.push(childJson);
      }
    }

    return result;
  }

  /**
   * Format a syntax tree node for text display
   * @param {Object} node The syntax tree node
   * @param {number} indent Indentation level
   * @returns {string} A formatted string representation of the tree
   */
  formatTree(node, indent = 0) {
    if (!node) return 'null';

    const indentStr = ' '.repeat(indent * 2);
    let result = `${indentStr}(${node.type} [${node.startPosition.row},${node.startPosition.column}] - [${node.endPosition.row},${node.endPosition.column}]`;
    
    if (node.childCount > 0) {
      result += '\n';
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        const fieldName = node.fieldNameForChild(i);
        
        if (fieldName) {
          result += `${indentStr}  ${fieldName}: `;
        }
        
        result += this.formatTree(child, indent + 1);
        result += '\n';
      }
      result += `${indentStr})`;
    } else {
      const text = node.text.replace(/\n/g, '\\n');
      if (text) {
        result += ` "${text}")`;
      } else {
        result += ')';
      }
    }
    
    return result;
  }
} 