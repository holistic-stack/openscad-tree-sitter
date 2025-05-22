# OpenSCAD Tree-Sitter Monorepo Structure

The following diagram illustrates the structure of the OpenSCAD Tree-Sitter monorepo after migration:

```mermaid
graph TD
    subgraph "OpenSCAD Tree-Sitter Monorepo"
        Root["Root (/)"]
        
        subgraph "Packages"
            TreeSitter["packages/tree-sitter-openscad"]
            Parser["packages/openscad-parser"]
        end
        
        subgraph "Configuration"
            NxConfig["nx.json"]
            PnpmWorkspace["pnpm-workspace.yaml"]
            RootPackage["package.json"]
        end
        
        subgraph "Documentation"
            Docs["docs/"]
            ReadMe["README.md"]
        end
        
        Root --> Packages
        Root --> Configuration
        Root --> Documentation
        
        subgraph "Tree-Sitter Package"
            TSGrammar["grammar.js"]
            TSQueries["queries/"]
            TSBindings["bindings/"]
            TSExamples["examples/"]
            TSTests["test/corpus/"]
        end
        
        TreeSitter --> TSGrammar
        TreeSitter --> TSQueries
        TreeSitter --> TSBindings
        TreeSitter --> TSExamples
        TreeSitter --> TSTests
        
        subgraph "Parser Package"
            ParserSrc["src/lib/"]
            ParserAST["src/lib/ast/"]
            ParserOpenSCAD["src/lib/openscad-parser/"]
            ParserTestUtils["src/lib/test-utils/"]
            ParserTests["src/lib/**/*.test.ts"]
        end
        
        Parser --> ParserSrc
        ParserSrc --> ParserAST
        ParserSrc --> ParserOpenSCAD
        ParserSrc --> ParserTestUtils
        ParserSrc --> ParserTests
        
        %% Dependencies
        Parser -.-> TreeSitter
```

## Package Descriptions

### Root

The root of the monorepo contains configuration files and documentation.

### packages/tree-sitter-openscad

This package contains the Tree-sitter grammar for OpenSCAD, including:

- `grammar.js`: The grammar definition
- `queries/`: Query files for syntax highlighting and code folding
- `bindings/`: Node.js and WebAssembly bindings
- `examples/`: Example OpenSCAD files
- `test/corpus/`: Test corpus for the grammar

### packages/openscad-parser

This package contains the TypeScript parser for OpenSCAD, including:

- `src/lib/ast/`: Abstract Syntax Tree (AST) definitions and utilities
- `src/lib/openscad-parser/`: The main parser implementation
- `src/lib/test-utils/`: Utilities for testing
- `src/lib/**/*.test.ts`: Test files

## Dependencies

The `openscad-parser` package depends on the `tree-sitter-openscad` package, as indicated by the dashed line in the diagram.

## Configuration Files

- `nx.json`: Configuration for the Nx workspace
- `pnpm-workspace.yaml`: Configuration for PNPM workspaces
- `package.json`: Root package.json with workspace dependencies
