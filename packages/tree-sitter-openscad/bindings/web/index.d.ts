/**
 * Web bindings for the tree-sitter-openscad grammar
 */
declare module '@openscad/tree-sitter-openscad/bindings/web' {
  /**
   * Path to the WebAssembly file containing the compiled tree-sitter grammar
   */
  export const wasmPath: string;

  /**
   * Language name for the OpenSCAD grammar
   */
  export const languageName: string;

  /**
   * Node types information for the OpenSCAD grammar
   */
  export const nodeTypeInfo?: Record<string, any>;
}
