/**
 * tree-sitter-openscad-parser.ts
 *
 * A parser for OpenSCAD code using the Tree-sitter library.
 * This class provides a simple interface for parsing OpenSCAD code and getting an AST.
 *
 * @module lib/openscad-parser/tree-sitter-openscad-parser/tree-sitter-openscad-parser
 * @author Augment Code
 * @created 2023-07-10
 * @updated 2023-07-10
 *
 * @example
 * ```typescript
 * // Create a parser instance
 * const parser = new TreeSitterOpenSCADParser();
 *
 * // Initialize the parser (must be done before parsing)
 * await parser.init();
 *
 * // Parse some OpenSCAD code
 * const ast = parser.parse('cube([10, 10, 10]);');
 * console.log(ast.rootNode.type); // 'source_file'
 *
 * // Clean up when done
 * parser.dispose();
 * ```
 *
 * @dependencies
 * - web-tree-sitter: For parsing OpenSCAD code
 * - tree-sitter-openscad.wasm: WebAssembly module containing the OpenSCAD grammar
 *
 * @notes
 * - The parser must be initialized with init() before use
 * - Call dispose() when done to free resources
 * - The parser can be reused for multiple parse operations
 */

// Import the Parser class from web-tree-sitter
import {Parser, Language, Tree} from "web-tree-sitter";

/**
 * A parser for OpenSCAD code using the Tree-sitter library.
 *
 * This class provides a simple interface for parsing OpenSCAD code and getting an AST.
 * It handles loading the Tree-sitter WebAssembly module and initializing the parser.
 *
 * Usage:
 * 1. Create an instance of TreeSitterOpenSCADParser
 * 2. Call init() to initialize the parser
 * 3. Call parse() to parse OpenSCAD code
 * 4. Call dispose() when done to free resources
 *
 * @implements {Disposable} - The parser can be disposed to free resources
 */
export class OpenscadParser {
    /**
     * The Tree-sitter parser instance
     * @private
     */
    private parser: Parser | null = null;

    /**
     * The Tree-sitter language
     * @private
     */
    private language: Language | null = null;

    /**
     * Whether the parser has been initialized
     */
    public isInitialized = false;

    /**
     * Initialize the parser by loading the WebAssembly file and setting up the language.
     * This must be called before using the parse method.
     *
     * @returns A promise that resolves when the parser is initialized, or rejects if there's an error
     * @param openscadWasmPath
     */
    public async init(openscadWasmPath = "/tree-sitter-openscad.wasm"): Promise<void> {
        try {
            console.log("Loading Tree-sitter OpenSCAD WebAssembly module...", {openscadWasmPath});
            const bytes = await fetch(openscadWasmPath).then(
                (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.bytes();
                }
            );

            await Parser.init();
            this.parser = new Parser();
            this.language = await Language.load(bytes);

            // Set the language for the parser
            this.parser.setLanguage(this.language);
            // Mark the parser as initialized
            this.isInitialized = true;
        } catch (err) {
            console.error("Failed to initialize TreeSitterOpenSCADParser:", err);
            // Re-throw the error to ensure the promise returned by the async function rejects
            throw new Error(`Failed to initialize TreeSitterOpenSCADParser: ${err}`);
        }
    }

    /**
     *
     * Parse OpenSCAD code and return an AST.
     *
     * @param code - The OpenSCAD code to parse
     * @param previousTree - Optional previous parse tree for incremental parsing
     * @returns The parse tree or null
     * @throws If the parser hasn't been initialized or there's an error parsing the code
     */
    public parse(code: string, previousTree?: Tree | null): Tree | null {
        if (!this.isInitialized || !this.parser) {
            // This case should still throw synchronously as it's a precondition failure
            throw new Error("Parser not initialized. Call init() first.");
        }

        try {
            // Tree-sitter's parse method is synchronous, so we can just return its result
            return this.parser.parse(code, previousTree);
        } catch (err) {
            console.error("Failed to parse OpenSCAD code:", err);
            // Re-throw the error as this is a synchronous function
            throw new Error(`Failed to parse OpenSCAD code: ${err}`);
        }
    }

    /**
     * Dispose of the parser and free resources.
     * Call this when you're done with the parser to avoid memory leaks.
     */
    public dispose(): void {
        if (this.parser) {
            this.parser.delete();
            this.parser = null;
            this.language = null;
            this.isInitialized = false;
        }
    }
}
