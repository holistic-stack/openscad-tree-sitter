## Plan for openscad-editor Package

**Objective**: Create a new Nx package `openscad-editor` that provides a React component wrapping a Monaco editor configured for OpenSCAD. This editor will leverage `web-tree-sitter` for syntax highlighting and `openscad-parser` for AST-based features.

**Phase 1: Project Setup and Basic Monaco Integration (4-6 hours)**

1.  **Generate Nx Package (`openscad-editor`)**
    *   Use Nx CLI to generate a new React library package named `openscad-editor` within the `packages/` directory.
    *   Ensure it's configured for TypeScript, Vite (for building), and Vitest (for testing), similar to `openscad-parser`.
    *   Setup basic ESLint and Prettier configurations, inheriting from the root or `openscad-parser`.

2.  **Add Dependencies**
    *   `react`, `react-dom`
    *   `monaco-editor`
    *   `web-tree-sitter`
    *   `openscad-parser` (as a workspace dependency)
    *   `vite`, `vitest`, `@vitejs/plugin-react`
    *   `eslint`, `prettier`, relevant TypeScript and ESLint plugins.

3.  **Basic Monaco Editor Component**
    *   Create a simple React component (`OpenSCADEditor`) that renders a basic Monaco editor instance.
    *   Ensure the editor can be displayed and basic text input works.
    *   Configure Vite to correctly bundle `monaco-editor`. This might involve looking into Vite plugins for Monaco or manual asset handling, as traditional Webpack plugins like `monaco-editor-webpack-plugin` won't directly apply. The search results highlighted the need for specific loaders for WASM and editor assets.

4.  **Initial Tests**
    *   Write basic Vitest tests to ensure the `OpenSCADEditor` component renders without errors.

**Phase 2: Tree-sitter Integration for Syntax Highlighting (6-8 hours)**

1.  **Load OpenSCAD Grammar (WASM)**
    *   The `tree-sitter-openscad` package should provide the `.wasm` file for the OpenSCAD grammar.
    *   Configure Vite to serve this WASM file (e.g., via the `public` directory or a WASM plugin like `vite-plugin-wasm`).
    *   In the `OpenSCADEditor` component, use `web-tree-sitter` to load the OpenSCAD grammar WASM. (Refer to `Parser.init()` and `Language.load()` from `web-tree-sitter` docs).

2.  **Integrate with Monaco for Highlighting**
    *   Investigate using the `monaco-tree-sitter` library (found in web search: `https://github.com/Menci/monaco-tree-sitter`) to connect `web-tree-sitter` parsing with Monaco's highlighting. Assess its compatibility and suitability.
    *   If `monaco-tree-sitter` is viable, follow its integration guide.
    *   Alternatively, a more manual approach would be to implement a custom Monaco `TokensProvider` that uses `web-tree-sitter` to parse code and map tokens.

3.  **Highlighting Tests**
    *   Test that basic OpenSCAD syntax (keywords, comments, numbers, strings) is correctly highlighted using sample code.

**Phase 3: `openscad-parser` Integration for AST-based Features (8-10 hours)**

1.  **Parse Code with `openscad-parser`**
    *   On editor content changes, use the `openscad-parser` (which depends on `tree-sitter-openscad`) to get an AST.
    *   Consider performing this asynchronously (e.g., in a web worker) to keep the UI responsive.

2.  **Display Syntax Errors (Markers API)**
    *   Use Monaco's `monaco.editor.setModelMarkers` API to show syntax errors from `openscad-parser` as in-editor diagnostics (e.g., squiggly lines).

3.  **Basic AST-driven Features (Proof of Concept)**
    *   **Outline View**: Create a basic outline (e.g., list of module/function definitions) by traversing the AST from `openscad-parser`. This could be a separate React component.
    *   **Hover Provider (Optional)**: Implement a basic hover provider to show symbol information from the AST.

4.  **Integration Tests**
    *   Test error display with invalid OpenSCAD code.
    *   Test the outline view with sample OpenSCAD files.

**Phase 4: Advanced Features and Refinements (6-8 hours)**

1.  **Code Completion (Basic)**
    *   Implement a basic Monaco code completion provider. Initial suggestions can include OpenSCAD keywords, later expanding to symbols from the `openscad-parser` AST.

2.  **Code Formatting (Optional)**
    *   Explore integrating a Prettier plugin for OpenSCAD if one exists.
    *   Alternatively, implement basic formatting rules based on the AST.

3.  **Performance Optimization**
    *   Profile with large OpenSCAD files and optimize parsing (debouncing, web workers).

4.  **Configuration Options**
    *   Make the `OpenSCADEditor` component configurable via props (e.g., initial code, theme).

5.  **Comprehensive Testing**
    *   Add detailed integration tests for all features and edge cases.

**Phase 5: Documentation and Packaging (4-6 hours)**

1.  **API Documentation**
    *   Write JSDoc/TSDoc for the `OpenSCADEditor` component and its API.

2.  **Usage Examples**
    *   Provide examples of how to use the `OpenSCADEditor` component.

3.  **Build and Package Configuration**
    *   Finalize Vite library mode configuration.
    *   Ensure `package.json` is correctly set up for publishing.

4.  **README**
    *   Write a comprehensive README for `openscad-editor`.

**Key Considerations & Challenges:**

*   **Monaco Editor Bundling with Vite**: This is a known challenge. Research Vite-specific solutions for handling Monaco's assets (workers, CSS, fonts) and WASM files.
*   **Tree-sitter WASM**: Ensure the `tree-sitter-openscad.wasm` is correctly loaded by `web-tree-sitter`. The `locateFile` option in `Parser.init()` might be needed.
*   **`monaco-tree-sitter` Library**: Verify its current status and compatibility.
*   **Synchronization**: Efficiently sync Monaco's content, Tree-sitter's parse tree, and `openscad-parser`'s AST.
*   **Performance**: Debouncing, web workers, and potentially incremental parsing will be key for larger files.
*   **Nx Workspace**: Ensure correct dependency setup on `openscad-parser` and integration into the monorepo's build/test workflows.

**Technology Choices Based on Research & Project Context:**

*   **Monaco Editor**: Core editor.
*   **`web-tree-sitter`**: For browser-based Tree-sitter grammar execution.
*   **`tree-sitter-openscad`**: Your existing OpenSCAD grammar (providing `.wasm`).
*   **`openscad-parser`**: Your existing TypeScript parser for AST and semantic analysis.
*   **`@menci/monaco-tree-sitter`**: Potential library for Tree-sitter/Monaco highlighting integration (to be verified).
*   **React**: For the editor component.
*   **Vite**: For building the library.
*   **Vitest**: For testing.
*   **Nx**: For monorepo management.
*   **ESLint, Prettier, TypeScript**: For code quality and consistency, mirroring `openscad-parser`.
