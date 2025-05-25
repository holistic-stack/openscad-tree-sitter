import * as monaco from 'monaco-editor';
// Try importing Parser as a named export and alias it
import { Parser as TreeSitterParserClass, Language, Query, Tree, Point } from 'web-tree-sitter';

// Define a mapping from Tree-sitter capture names to Monaco token types
const captureToTokenMap: Record<string, string> = {
  'keyword': 'keyword.openscad',
  'number': 'number.openscad',
  'string': 'string.openscad',
  'variable': 'variable.openscad',
  'operator': 'operator.openscad',
  'punctuation.bracket': 'punctuation.bracket.openscad',
  'punctuation.delimiter': 'punctuation.delimiter.openscad',
  'comment': 'comment.openscad',
  'function': 'entity.name.function.openscad',
  'function.call': 'entity.name.function.call.openscad',
  'special': 'keyword.operator.modifier.openscad',
  'conditional': 'keyword.control.conditional.openscad',
  'constant.builtin': 'constant.language.openscad',
  'constructor': 'entity.name.function.constructor.openscad',
  'escape': 'constant.character.escape.openscad',
  'function.builtin': 'support.function.builtin.openscad',
  'include': 'keyword.control.include.openscad',
  'module': 'entity.name.type.module.openscad',
  'parameter': 'variable.parameter.openscad',
  'property': 'variable.other.property.openscad',
  'punctuation.special': 'punctuation.definition.string.begin.openscad',
  'repeat': 'keyword.control.repeat.openscad',
  'string.escape': 'constant.character.escape.openscad',
  'type.builtin': 'support.type.builtin.openscad',
  'variable.builtin': 'support.variable.builtin.openscad',
};

export class OpenSCADTokensProvider implements monaco.languages.TokensProvider {
  // Use the aliased imported class for type annotation
  private parserInstance: TreeSitterParserClass | null = null;
  private language: Language | null = null;
  private highlightQuery: Query | null = null;
  private tree: Tree | null = null;
  private codeVersion = -1;

  constructor(
    parser: TreeSitterParserClass, // Use aliased imported class for type annotation
    openscadLanguage: Language,
    highlightQueryText: string,
  ) {
    this.parserInstance = parser;
    this.language = openscadLanguage;
    this.highlightQuery = this.language.query(highlightQueryText);
  }

  getInitialState(): monaco.languages.IState {
    return new TokenizerState(null, 0); 
  }

  tokenize(
    line: string, // This is the content of the line to tokenize
    state: monaco.languages.IState, // The state returned by the previous tokenize call (or getInitialState)
  ): monaco.languages.ILineTokens {
    if (!(state instanceof TokenizerState)) {
      // Fallback or error for invalid state
      const freshState = this.getInitialState();
      return { tokens: [{ startIndex: 0, scopes: 'source.openscad' }], endState: freshState };
    }

    // The `tokenize` method in Monaco is called line by line. Tree-sitter parses the whole document.
    // A robust solution requires careful management of the tree and mapping line numbers.
    // The TokenizerState could carry the line number and a reference to the model.
    const model = state.model; // Assuming TokenizerState is enhanced
    const lineNumber = state.lineNumber; // Assuming TokenizerState is enhanced

    if (model && lineNumber && this.tree) {
      return {
        tokens: this.getTokensForLine(lineNumber, model),
        endState: new TokenizerState(this.tree, lineNumber + 1, model),
      };
    }

    // Fallback if we don't have enough info or tree is not ready
    return {
      tokens: [{ startIndex: 0, scopes: 'source.openscad' }],
      endState: state, // Preserve state or return a new initial state
    };
  }

  public updateDocument(content: string, versionId: number): void {
    if (!this.parserInstance || !this.language) return;

    if (this.codeVersion === versionId && this.tree) {
      return;
    }
    
    this.tree = this.parserInstance.parse(content);
    this.codeVersion = versionId;
  }

  public getTokensForLine(lineNumber: number, model: monaco.editor.ITextModel): monaco.languages.IToken[] {
    if (!this.tree || !this.highlightQuery) {
      return [{ startIndex: 0, scopes: 'source.openscad' }];
    }

    const lineContent = model.getLineContent(lineNumber);
    const lineLength = lineContent.length;
    if (lineLength === 0) {
        return [{ startIndex: 0, scopes: 'source.openscad' }];
    }
    
    const tokens: monaco.languages.IToken[] = [];
    let lastTokenEndIndex = 0;

    const startPoint: Point = { row: lineNumber - 1, column: 0 };
    const endPoint: Point = { row: lineNumber - 1, column: lineLength }; 
    
    const rootNode = this.tree.rootNode;
    if (!rootNode) {
        return [{ startIndex: 0, scopes: 'source.openscad' }];
    }

    // Adjust the call to captures to use a QueryOptions object for the second argument
    const captures = this.highlightQuery.captures(rootNode, {
      startPosition: startPoint,
      endPosition: endPoint
    });

    for (const capture of captures) { // Iterate over captures from the ranged query
      const tokenType = captureToTokenMap[capture.name];
      if (tokenType) {
        const node = capture.node;
        const nodeStartRow = node.startPosition.row;
        const nodeEndRow = node.endPosition.row;
        let nodeStartColumn = node.startPosition.column;
        let nodeEndColumn = node.endPosition.column;

        if (nodeStartRow < startPoint.row) nodeStartColumn = 0;
        if (nodeEndRow > startPoint.row) nodeEndColumn = lineLength;
        
        nodeStartColumn = Math.max(0, nodeStartColumn);
        nodeEndColumn = Math.min(lineLength, nodeEndColumn);

        if (nodeStartColumn < nodeEndColumn) {
            if (nodeStartColumn > lastTokenEndIndex) {
              tokens.push({ startIndex: lastTokenEndIndex, scopes: 'source.openscad' });
            }
            tokens.push({
              startIndex: nodeStartColumn,
              scopes: tokenType,
            });
            lastTokenEndIndex = nodeEndColumn;
        }
      }
    }
    
    if (lastTokenEndIndex < lineLength) {
        tokens.push({ startIndex: lastTokenEndIndex, scopes: 'source.openscad' });
    }
    
    if (tokens.length === 0 && lineLength > 0) {
        tokens.push({ startIndex: 0, scopes: 'source.openscad' });
    }

    tokens.sort((a, b) => a.startIndex - b.startIndex);
    
    const finalTokens: monaco.languages.IToken[] = [];
    if (tokens.length > 0) {
        let currentToken = tokens[0];
        for (let i = 1; i < tokens.length; i++) {
            if (tokens[i].startIndex > currentToken.startIndex) {
                finalTokens.push(currentToken);
                currentToken = tokens[i];
            } else if (tokens[i].startIndex === currentToken.startIndex) {
                if (tokens[i].scopes.length >= currentToken.scopes.length) { 
                    currentToken = tokens[i];
                }
            }
        }
        finalTokens.push(currentToken);
    }
    return finalTokens.length > 0 ? finalTokens : [{ startIndex: 0, scopes: 'source.openscad' }];
  }
}

class TokenizerState implements monaco.languages.IState {
  constructor(
    public readonly treeSnapshot: Tree | null,
    public readonly lineNumber: number, 
    public readonly model?: monaco.editor.ITextModel 
  ) {}

  clone(): monaco.languages.IState {
    return new TokenizerState(this.treeSnapshot, this.lineNumber, this.model);
  }

  equals(other: monaco.languages.IState): boolean {
    return other instanceof TokenizerState && 
           this.treeSnapshot === other.treeSnapshot &&
           this.lineNumber === other.lineNumber &&
           this.model === other.model;
  }
}
