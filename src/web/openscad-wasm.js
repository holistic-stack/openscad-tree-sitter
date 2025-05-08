/**
 * @file openscad-wasm.js
 * @description Enhanced WebAssembly initialization for OpenSCAD Tree-sitter grammar
 */

/**
 * OpenSCAD Tree-sitter WebAssembly module
 * @namespace OpenSCADTreeSitter
 */
const OpenSCADTreeSitter = {
  /**
   * Initialize the OpenSCAD Tree-sitter parser
   * @param {Object} Parser - The Tree-sitter Parser object
   * @param {Object} options - Initialization options
   * @param {string} options.wasmPath - Path to the WebAssembly file (default: 'tree-sitter-openscad.wasm')
   * @param {boolean} options.useWorker - Whether to use a Web Worker for parsing (default: false)
   * @param {number} options.timeout - Timeout for initialization in milliseconds (default: 5000)
   * @returns {Promise<Object>} - The initialized parser
   * @throws {Error} - If initialization fails
   */
  async initialize(Parser, options = {}) {
    const {
      wasmPath = 'tree-sitter-openscad.wasm',
      useWorker = false,
      timeout = 5000
    } = options;

    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenSCAD Tree-sitter initialization timed out')), timeout);
    });

    try {
      // Initialize the parser with timeout
      const initPromise = Parser.init();
      await Promise.race([initPromise, timeoutPromise]);

      // Create parser instance
      const parser = new Parser();

      // Load the OpenSCAD language
      const language = await this._loadLanguage(Parser, wasmPath, timeout);
      parser.setLanguage(language);

      // If using a worker, set up the worker
      if (useWorker && typeof Worker !== 'undefined') {
        return this._setupWorker(parser, wasmPath);
      }

      return parser;
    } catch (error) {
      console.error('Failed to initialize OpenSCAD Tree-sitter:', error);
      throw new Error(`OpenSCAD Tree-sitter initialization failed: ${error.message}`);
    }
  },

  /**
   * Load the OpenSCAD language
   * @private
   * @param {Object} Parser - The Tree-sitter Parser object
   * @param {string} wasmPath - Path to the WebAssembly file
   * @param {number} timeout - Timeout for loading in milliseconds
   * @returns {Promise<Object>} - The loaded language
   * @throws {Error} - If loading fails
   */
  async _loadLanguage(Parser, wasmPath, timeout) {
    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenSCAD language loading timed out')), timeout);
    });

    try {
      // Check if the WASM file exists
      const response = await fetch(wasmPath, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`WASM file not found at ${wasmPath} (status: ${response.status})`);
      }

      // Load the language with timeout
      const loadPromise = Parser.Language.load(wasmPath);
      return await Promise.race([loadPromise, timeoutPromise]);
    } catch (error) {
      console.error('Failed to load OpenSCAD language:', error);
      throw new Error(`OpenSCAD language loading failed: ${error.message}`);
    }
  },

  /**
   * Set up a Web Worker for parsing
   * @private
   * @param {Object} parser - The Tree-sitter parser
   * @param {string} wasmPath - Path to the WebAssembly file
   * @returns {Object} - The worker-enabled parser
   */
  _setupWorker(parser, wasmPath) {
    // Create a worker script as a blob
    const workerScript = `
      importScripts('https://cdn.jsdelivr.net/npm/web-tree-sitter@0.25.3/tree-sitter.js');

      const Parser = self.TreeSitter.Parser;
      let parser;

      async function initParser() {
        try {
          await Parser.init();
          parser = new Parser();

          const response = await fetch('${wasmPath}');
          const wasmBuffer = await response.arrayBuffer();

          const language = await Parser.Language.load(wasmBuffer);
          parser.setLanguage(language);

          self.postMessage({ type: 'ready' });
        } catch (error) {
          self.postMessage({ type: 'error', message: error.message });
        }
      }

      self.onmessage = async (event) => {
        if (event.data.type === 'parse') {
          if (!parser) {
            await initParser();
          }

          try {
            const tree = parser.parse(event.data.code);
            self.postMessage({
              type: 'result',
              tree: tree.rootNode.toString()
            });
          } catch (error) {
            self.postMessage({ type: 'error', message: error.message });
          }
        }
      };

      initParser().catch(error => {
        self.postMessage({ type: 'error', message: error.message });
      });
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // Wrap the parser with worker functionality
    const workerParser = {
      _worker: worker,
      _callbacks: new Map(),
      _nextId: 1,

      parse(code, previousTree) {
        return new Promise((resolve, reject) => {
          const id = this._nextId++;

          this._callbacks.set(id, { resolve, reject });

          this._worker.postMessage({
            type: 'parse',
            id,
            code,
            previousTree: previousTree ? previousTree.id : null
          });
        });
      },

      // Add other parser methods as needed

      destroy() {
        this._worker.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };

    // Set up worker message handling
    worker.onmessage = (event) => {
      const { type, id, tree, message } = event.data;

      if (type === 'error') {
        console.error('Worker error:', message);
        // Reject all pending callbacks
        for (const { reject } of workerParser._callbacks.values()) {
          reject(new Error(message));
        }
        workerParser._callbacks.clear();
        return;
      }

      if (type === 'result' && id) {
        const callback = workerParser._callbacks.get(id);
        if (callback) {
          callback.resolve(tree);
          workerParser._callbacks.delete(id);
        }
      }
    };

    return workerParser;
  },

  /**
   * Parse OpenSCAD code
   * @param {Object} parser - The Tree-sitter parser
   * @param {string} code - The OpenSCAD code to parse
   * @param {Object} options - Parsing options
   * @param {boolean} options.includeRanges - Whether to include ranges in the result (default: false)
   * @returns {Object} - The parse result
   * @throws {Error} - If parsing fails
   */
  parse(parser, code, options = {}) {
    try {
      const tree = parser.parse(code);

      if (options.includeRanges) {
        return this._formatTreeWithRanges(tree);
      }

      return tree;
    } catch (error) {
      console.error('Failed to parse OpenSCAD code:', error);
      throw new Error(`OpenSCAD parsing failed: ${error.message}`);
    }
  },

  /**
   * Format a tree with ranges
   * @private
   * @param {Object} tree - The Tree-sitter tree
   * @returns {Object} - The formatted tree with ranges
   */
  _formatTreeWithRanges(tree) {
    const rootNode = tree.rootNode;

    function formatNode(node) {
      const result = {
        type: node.type,
        text: node.text,
        range: {
          startRow: node.startPosition.row,
          startColumn: node.startPosition.column,
          endRow: node.endPosition.row,
          endColumn: node.endPosition.column
        },
        children: []
      };

      for (let i = 0; i < node.childCount; i++) {
        result.children.push(formatNode(node.child(i)));
      }

      return result;
    }

    return formatNode(rootNode);
  }
};

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenSCADTreeSitter;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return OpenSCADTreeSitter; });
} else if (typeof window !== 'undefined') {
  window.OpenSCADTreeSitter = OpenSCADTreeSitter;
}
