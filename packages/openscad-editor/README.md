# @openscad/editor

A React-based Monaco editor component for OpenSCAD with syntax highlighting powered by Tree-sitter.

This package provides a React component that embeds the Monaco editor and configures it for the OpenSCAD language. It uses `web-tree-sitter` and the `@openscad/tree-sitter-openscad` grammar to provide accurate syntax highlighting.

## Features

- Monaco editor integration for a rich editing experience.
- OpenSCAD syntax highlighting using Tree-sitter.
- Customizable via props (initial code, theme, etc.).
- Easy integration into React applications.

## Installation

```bash
npm install @openscad/editor react react-dom
# or
yarn add @openscad/editor react react-dom
# or
pnpm add @openscad/editor react react-dom
```

`react` and `react-dom` are peer dependencies and need to be installed separately.

## Usage

```tsx
import React, { useState } from 'react';
import { OpenscadEditor } from '@openscad/editor';
// Ensure you have copied the .wasm and .scm files to your public assets folder
// and that they are served correctly.
// For example, if they are in `public/` and served from the root:
// const wasmPath = '/tree-sitter-openscad.wasm';
// const highlightQueryPath = '/highlights.scm';

// If using Vite, you might need to import them as assets:
// import wasmPath from './assets/tree-sitter-openscad.wasm?url';
// import highlightQueryPath from './assets/highlights.scm?url';


const App = () => {
  const [code, setCode] = useState('cube(10);');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    console.log('Code changed:', newCode);
  };

  return (
    <div>
      <h1>OpenSCAD Editor</h1>
      <OpenscadEditor
        initialCode={code}
        onCodeChange={handleCodeChange}
        theme="vs-dark" // Optional: "vs-light" or custom Monaco theme
        // Optional: Override paths if your assets are served from a different location
        // wasmPath="/path/to/your/tree-sitter-openscad.wasm"
        // highlightQueryPath="/path/to/your/highlights.scm"
      />
      <pre>Current Code: {code}</pre>
    </div>
  );
};

export default App;
```

### Asset Handling

For the editor to function correctly, you need to make the Tree-sitter WASM file (`tree-sitter-openscad.wasm`) and the highlight query file (`highlights.scm`) available to your application. These files are typically placed in a `public` assets directory and served by your web server.

The `OpenscadEditor` component accepts `wasmPath` and `highlightQueryPath` props to specify the URLs where these files can be fetched. By default, it attempts to load them from:
- `/tree-sitter-openscad.wasm`
- `/highlights.scm`

**Ensure these files are copied from `@openscad/editor/public/` to your project's public asset serving directory.**

For example, if you are using Vite, you can place them in your `public` directory.
If you are using Create React App, you can also place them in the `public` directory.

Refer to your bundler's or framework's documentation on how to serve static assets.

## Props

| Prop                 | Type                      | Default                               | Description                                                                 |
| -------------------- | ------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `initialCode`        | `string`                  | `''`                                  | The initial code to display in the editor.                                  |
| `onCodeChange`       | `(code: string) => void`  | `undefined`                           | Callback function triggered when the editor content changes.                |
| `theme`              | `string`                  | `'vs-dark'`                           | The Monaco editor theme to use (e.g., 'vs-dark', 'vs-light').               |
| `wasmPath`           | `string`                  | `'/tree-sitter-openscad.wasm'`        | URL path to the `tree-sitter-openscad.wasm` file.                           |
| `highlightQueryPath` | `string`                  | `'/highlights.scm'`                   | URL path to the `highlights.scm` (Tree-sitter highlight query) file.        |


## Development

This package is part of the `openscad-tree-sitter-p1` monorepo.

### Building the package

Run `pnpm build:editor` from the monorepo root.

### Running unit tests

Run `pnpm test:editor` to execute the unit tests via [Vitest](https://vitest.dev/).

## License

MIT
