## Plan for openscad-editor Package

**Objective**: Create a new Nx package `openscad-editor` that provides a React component wrapping a Monaco editor configured for OpenSCAD. This editor will leverage `web-tree-sitter` for syntax highlighting and `openscad-parser` for AST-based features.

**Phase 1: Project Setup and Basic Monaco Integration (4-6 hours) - COMPLETED**

1.  **Generate Nx Package (`openscad-editor`) - COMPLETED**
    *   Used Nx CLI to generate a new React library package named `openscad-editor` within the `packages/` directory.
    *   Configured for TypeScript, Vite (for building), and Vitest (for testing).
    *   Setup basic ESLint and Prettier configurations, adapted from `openscad-parser`.

2.  **Add Dependencies - COMPLETED**
    *   `react`, `react-dom` (scaffolded by Nx)
    *   `monaco-editor`, `@monaco-editor/react` (installed)
    *   `vite-plugin-monaco-editor` (installed for Vite integration)
    *   `web-tree-sitter` (installed)
    *   `openscad-parser` (as a workspace dependency - added)
    *   `vite`, `vitest`, `@vitejs/plugin-react` (scaffolded/configured by Nx)
    *   `eslint`, `prettier`, relevant TypeScript and ESLint plugins (configured).

3.  **Basic Monaco Editor Component - COMPLETED**
    *   Created a simple React component (`OpenSCADEditor`) that renders a basic Monaco editor instance using `@monaco-editor/react`.
    *   Ensured the editor can be displayed and basic text input works.
    *   Configured Vite using `vite-plugin-monaco-editor` to correctly bundle `monaco-editor` assets.

4.  **Initial Tests - COMPLETED**
    *   Wrote basic Vitest tests to ensure the `OpenSCADEditor` component renders without errors, mocking the Monaco editor itself.

**Phase 2: Tree-sitter Integration for Syntax Highlighting (6-8 hours) - MOSTLY COMPLETED**

1.  **Load OpenSCAD Grammar (WASM) & Queries - COMPLETED**
    *   The `tree-sitter-openscad` package provides the `.wasm` file for the OpenSCAD grammar. (Verified & build process updated to generate `tree-sitter-openscad.wasm` at package root via `npm run build:wasm` in its `install` script).
    *   The `openscad-demo` package now has a `postinstall` script to copy `tree-sitter-openscad.wasm` (from `@openscad/tree-sitter-openscad`) and `tree-sitter.wasm` (from `web-tree-sitter`) into its `public/` directory. (Verified, WASM files are present in demo's public folder).
    *   Vite is configured to serve these WASM files from the `public` directory. (`tree-sitter-openscad.wasm` copied to `packages/openscad-editor/public/` for library asset bundling, and also handled by the demo app).
    *   `highlights.scm` from `packages/tree-sitter-openscad/queries/` copied to `packages/openscad-editor/public/`. (Completed)
    *   In the `OpenSCADEditor` component, `web-tree-sitter` is used to initialize the parser and load the OpenSCAD grammar WASM. (Basic loading implemented, `highlights.scm` is also fetched). (Corrected `web-tree-sitter` import and initialization in `openscad-editor.tsx`)

2.  **Integrate with Monaco for Highlighting - PIVOTED & IN PROGRESS**
    *   Initial investigation of `monaco-tree-sitter` library showed it to be outdated and problematic for integration. (Attempted and abandoned)
    *   **New Approach**: Implement a custom Monaco `monaco.languages.TokensProvider` that uses `web-tree-sitter` to parse code and map Tree-sitter nodes to Monaco tokens.
        *   The custom provider (`OpenSCADTokensProvider.ts`) will be created.
        *   It will fetch and use `highlights.scm` to determine token types by querying the Tree-sitter tree.
        *   It will map these capture names to Monaco token scopes (e.g., `keyword.openscad`, `comment.openscad`).

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
    *   Ensure `package.json` is correctly set up for publishing. (Initial setup for publishing completed, including `private: false`, `publishConfig`, `files`, `repository`, `keywords`, `license`, and peer dependencies).

4.  **README**
    *   Write a comprehensive README for `openscad-editor`.

**Key Considerations & Challenges:**

*   **Monaco Editor Bundling with Vite**: This is a known challenge. Research Vite-specific solutions for handling Monaco's assets (workers, CSS, fonts) and WASM files. (Addressed with `vite-plugin-monaco-editor`)
*   **Tree-sitter WASM**: Ensure the `tree-sitter-openscad.wasm` is correctly loaded by `web-tree-sitter`. The `locateFile` option in `Parser.init()` might be needed.
*   **`monaco-tree-sitter` Library**: ~~Verify its current status and compatibility.~~ (Verified as unsuitable for this project due to age/compatibility issues).
*   **Synchronization**: Efficiently sync Monaco's content, Tree-sitter's parse tree, and `openscad-parser`'s AST.
*   **Performance**: Debouncing, web workers, and potentially incremental parsing will be key for larger files.
*   **Nx Workspace**: Ensure correct dependency setup on `openscad-parser` and integration into the monorepo's build/test workflows.

**Technology Choices Based on Research & Project Context:**

*   **Monaco Editor**: Core editor.
*   `@monaco-editor/react`: React wrapper for Monaco.
*   `vite-plugin-monaco-editor`: Vite plugin for Monaco assets.
*   **`web-tree-sitter`**: For browser-based Tree-sitter grammar execution. (Integrated)
*   **`tree-sitter-openscad`**: Your existing OpenSCAD grammar (providing `.wasm`).
*   **`openscad-parser`**: Your existing TypeScript parser for AST and semantic analysis.
*   **React**: For the editor component.
*   **Vite**: For building the library.
*   **Vitest**: For testing.
*   **Nx**: For monorepo management.
*   **ESLint, Prettier, TypeScript**: For code quality and consistency, mirroring `openscad-parser`.
