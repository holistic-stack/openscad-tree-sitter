# OpenSCAD Editor Demo Plan (`packages/openscad-demo`)

## 1. Objective

The primary objective of the `openscad-demo` package is to provide a simple, functional, and easy-to-understand demonstration of the `openscad-editor` component. This demo will showcase the editor's core features, such as OpenSCAD syntax highlighting and code editing capabilities, within a web browser environment.

## 2. Key Features to Showcase

The demo should effectively highlight the following features of the `openscad-editor`:

*   **Instantiation**: How to embed and initialize the editor component.
*   **OpenSCAD Syntax Highlighting**: Visual confirmation of correct syntax highlighting based on the `tree-sitter-openscad` grammar.
*   **Code Editing**: Basic code editing functionalities (typing, deleting, selecting text).
*   **Loading Initial Content**: Demonstrating how to load an initial OpenSCAD script into the editor.

## 3. Setup `openscad-demo`

### 3.1. Project Structure Overview
```
packages/openscad-demo/
├── index.html            # Main HTML entry point
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
└── src/
    ├── index.css         # Basic styling for the demo page
    ├── index.ts          # Entry script for React application
    └── main.tsx          # Main React component hosting the editor
```

### 3.2. Dependencies
Ensure `package.json` in `packages/openscad-demo` includes:
*   `react` and `react-dom`
*   `@openscad/openscad-editor` (or the appropriate workspace link, e.g., `workspace:*`)
*   Development dependencies like `vite`, `@vitejs/plugin-react`, `typescript`.

### 3.3. HTML Structure (`index.html`)
A simple HTML file with a root element for the React application.
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OpenSCAD Editor Demo</title>
  <link rel="stylesheet" href="/src/index.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.ts"></script>
</body>
</html>
```

### 3.4. Entry Script (`src/index.ts`)
This script will render the main React component.
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './main'; // Assuming main.tsx exports App

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

## 4. Core Demo Implementation (`src/main.tsx`)

The `main.tsx` component will be responsible for instantiating and displaying the `openscad-editor`.

```tsx
import React, { useEffect, useRef, useState } from 'react';
// Adjust the import path based on how openscad-editor exports its component
// For example: import { OpenscadEditor } from '@openscad/openscad-editor';

// Placeholder for the actual editor component and its props
// interface OpenscadEditorProps {
//   initialCode?: string;
//   onCodeChange?: (code: string) => void;
//   // ... other props
// }
// const OpenscadEditor: React.FC<OpenscadEditorProps> = ({ initialCode }) => {
//   // This is a mock. Replace with actual editor integration.
//   const editorRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (editorRef.current) {
//       // Logic to initialize the actual editor instance
//       // e.g., new RealOpenscadEditor(editorRef.current, { code: initialCode });
//       editorRef.current.textContent = `Editor Placeholder. Initial code: 
${initialCode}`;
//     }
//   }, [initialCode]);
//   return <div ref={editorRef} style={{ border: '1px solid #ccc', height: '400px', fontFamily: 'monospace' }}></div>;
// };


const App: React.FC = () => {
  const [code, setCode] = useState<string>('// Sample OpenSCAD Code

cube(10);
');

  // This is where you'd import and use the actual OpenscadEditor component
  // For now, we'll assume a placeholder or that the editor component is globally available
  // or imported directly.

  // Example:
  // import { EditorComponent } from '@openscad/openscad-editor'; // Fictional import

  return (
    <div style={{ padding: '20px' }}>
      <h1>OpenSCAD Editor Demo</h1>
      <p>This demo showcases the <code>openscad-editor</code> component.</p>
      
      {/* 
        Replace the div below with the actual OpenscadEditor component.
        You'll need to know how to instantiate it and pass props like initial code.
        Example:
        <EditorComponent
          initialCode={code}
          onCodeChange={(newCode) => setCode(newCode)}
        />
      */}
      <div 
        style={{ 
          border: '1px solid black', 
          height: '500px', 
          width: '100%',
          overflow: 'auto',
          whiteSpace: 'pre',
          fontFamily: 'monospace',
          padding: '10px'
        }}
      >
        {/* This is a temporary placeholder for where the editor would go. */}
        {/* The actual editor component from packages/openscad-editor will be rendered here. */}
        {`// Editor would be rendered here. Current code:
${code}`}
      </div>

      {/* Optional: Display current code for debugging */}
      {/* <details>
        <summary>Current Code (State)</summary>
        <pre>{code}</pre>
      </details> */}
    </div>
  );
};

export default App;
```

**Note**: The `OpenscadEditor` component and its props in the example above are illustrative. The actual implementation will depend on the API exposed by `packages/openscad-editor/src/index.ts`.

## 5. Development Steps

1.  **Verify `openscad-editor` Exports**:
    *   Ensure `packages/openscad-editor/src/index.ts` exports the necessary editor component and types.
    *   Confirm how to initialize and interact with the editor (e.g., passing initial code, listening to changes).

2.  **Setup `openscad-demo` Project**:
    *   Initialize `package.json` with `pnpm init`.
    *   Install React, ReactDOM, Vite, and TypeScript dependencies.
    *   Add `openscad-editor` as a workspace dependency: `pnpm add @openscad/openscad-editor@workspace:* -w` (or the correct package name if different).
    *   Configure `vite.config.ts` for a React+TypeScript project.
    *   Create `index.html`, `src/index.ts`, `src/main.tsx`, and `src/index.css`.

3.  **Integrate `openscad-editor` into `main.tsx`**:
    *   Import the editor component from `@openscad/openscad-editor`.
    *   Instantiate the editor within the `App` component.
    *   Pass a sample OpenSCAD script as initial content.
    *   Ensure the editor renders correctly and displays syntax highlighting.

4.  **Styling**:
    *   Add basic CSS in `src/index.css` to ensure the demo page is presentable and the editor is clearly visible.

5.  **Build and Test**:
    *   Use Vite's development server (`pnpm dev` from within `packages/openscad-demo` or `pnpm nx dev openscad-demo` from the root) to test the demo locally.
    *   Verify that the editor loads, displays the sample code, and highlights syntax correctly.

6.  **Documentation (README)**:
    *   Update `packages/openscad-demo/README.md` with instructions on how to run the demo and what it showcases.

## 6. Potential Enhancements (Future Considerations)

*   **Multiple Examples**: Allow users to select from a list of different OpenSCAD code samples to load into the editor.
*   **Read-only Mode**: Demonstrate toggling a read-only mode if the editor supports it.
*   **Theme Selection**: If the editor supports themes, provide a way to switch between them.
*   **AST Preview**: (Advanced) If the `openscad-parser` can provide an AST, display a simple visualization of the AST for the current code. This would require deeper integration with the parser.
*   **Error Display**: If the editor can report syntax errors, demonstrate how these are shown.

## 7. Build and Run

*   **Development**: `pnpm nx dev openscad-demo` (from the monorepo root)
*   **Build**: `pnpm nx build openscad-demo` (from the monorepo root)

This plan provides a roadmap for creating a functional and informative demo for the `openscad-editor`.
