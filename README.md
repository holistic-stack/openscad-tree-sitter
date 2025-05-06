# OpenSCAD Tree-sitter Grammar

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the [OpenSCAD](https://openscad.org/) language. This grammar provides incremental parsing capabilities for OpenSCAD files, enabling syntax highlighting, code navigation, and more in editors that support Tree-sitter.

## Features

- Complete OpenSCAD syntax support
- Real-time incremental parsing
- Syntax highlighting rules
- Code navigation (symbols, definitions, references)
- Error recovery

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (>=14.0.0)
- A C compiler (for building the parser)

### For Development

1. Clone the repository:
   ```
   git clone https://github.com/user/openscad-tree-sitter.git
   cd openscad-tree-sitter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate the parser:
   ```
   npm run build
   ```

4. Run tests:
   ```
   npm test
   ```

## Usage in Editors

### VSCode

1. Install the [Tree-sitter extension](https://marketplace.visualstudio.com/items?itemName=georgewfraser.vscode-tree-sitter)
2. Configure for OpenSCAD by adding to your `settings.json`:
   ```json
   "tree-sitter.languages": [
     {
       "languageId": "openscad",
       "fileExtensions": ["scad"],
       "parserPath": "/path/to/tree-sitter-openscad.wasm"
     }
   ]
   ```

### Neovim

1. For Neovim 0.9+, configure Tree-sitter:
   ```lua
   require'nvim-treesitter.configs'.setup {
     ensure_installed = { "openscad" },
     highlight = {
       enable = true,
     },
   }
   ```

## Structure

- `grammar.js` - The main grammar definition
- `queries/highlights.scm` - Syntax highlighting rules
- `queries/tags.scm` - Code navigation rules
- `test/corpus/` - Test cases

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- [OpenSCAD](https://openscad.org/) team for the language
- [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) team for the parsing technology 