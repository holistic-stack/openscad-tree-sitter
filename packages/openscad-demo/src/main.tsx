import React, { useState } from 'react';
// import { OpenscadEditor } from '@openscad/openscad-editor';
// Corrected import path assuming the package name is @openscad/openscad-editor
// and it correctly exports OpenscadEditor
import { OpenscadEditor } from '@openscad/editor'; // Corrected import path

const App: React.FC = () => {
  const [code, setCode] = useState<string>('// Sample OpenSCAD Code\n\ncube(10);\n');

  return (
    <div style={{ padding: '20px' }}>
      <h1>OpenSCAD Editor Demo</h1>
      <p>This demo showcases the <code>openscad-editor</code> component.</p>
      
      <div style={{ height: '500px', border: '1px solid #ccc'}}>
        <OpenscadEditor
          initialCode={code}
          onCodeChange={(newCode: string) => setCode(newCode)} // Added type for newCode
        />
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
