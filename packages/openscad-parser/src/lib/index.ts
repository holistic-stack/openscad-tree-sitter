/**
 * Minimal openscad-parser exports for demo functionality
 */

// Just export a simple stub for now to get the build working
export interface OpenscadParserStub {
  init(): Promise<void>;
  parse(code: string): any;
  dispose(): void;
}

export class OpenscadParser implements OpenscadParserStub {
  async init(): Promise<void> {
    // Stub implementation
  }

  parse(code: string): any {
    // Stub implementation
    return null;
  }

  dispose(): void {
    // Stub implementation
  }
}

// Basic AST node interface
export interface ASTNode {
  type: string;
  children?: ASTNode[];
}
