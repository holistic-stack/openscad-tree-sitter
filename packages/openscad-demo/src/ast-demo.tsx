import React, { useState, useCallback } from 'react';
import { OpenscadEditorAST, OpenscadOutline, FormattingConfig, type ParseResult, type OutlineItem, type FormattingService } from '@openscad/editor';

const ASTDemo: React.FC = () => {
  const [code, setCode] = useState<string>(`// 🎉 OpenSCAD Editor with Smart Navigation & Code Formatting!
// ✨ NEW: Advanced formatting and navigation features!

// 🎯 NAVIGATION SHORTCUTS:
// F12 - Go to definition (click on symbol first)
// Shift+F12 - Find all references  
// Ctrl+G - Go to line number
// Ctrl+T - Search symbols
// Ctrl+Shift+O - Go to symbol

// 🎨 FORMATTING SHORTCUTS:
// Shift+Alt+F - Format entire document
// Ctrl+K Ctrl+F - Format selection
// Use the Format Config panel to customize formatting rules!

// Poorly formatted code for testing (try formatting!)
width=20;height=10;depth=15;$fn=32;

// Function that uses variables
function calculate_volume(w,h,d){return w*h*d;}

// Badly formatted shapes
cube([width,height,depth]);translate([25,0,0])sphere(r=8,$fn=50);

// Messy control structures  
for(i=[0:2:10]){translate([0,i*15,0])cylinder(h=height,r=3,$fn=6);}

// Conditional expressions
size=width>15?20:10;

// Custom module definition (poor formatting)
module my_shape(size=10,holes=true){difference(){cube(size,center=true);if(holes){for(x=[-1,1]){for(y=[-1,1]){translate([x*size/3,y*size/3,0])cylinder(h=size+1,r=size/8,center=true);}}}}}

// Function call
my_shape(15,true);

// Mathematical expressions
result=width*height+depth;
complex_value=sin(30)+cos(45)*sqrt(16);
volume=calculate_volume(width,height,depth);

// Vector expressions  
points=[[0,0],[10,0],[10,10],[0,10]];

// Advanced operations (unformatted)
hull(){translate([0,30,0])sphere(5);translate([20,30,0])sphere(5);translate([10,40,10])sphere(3);}

// Another module to test navigation
module test_navigation(){my_shape(size=width);}

test_navigation();

echo("Try formatting with Shift+Alt+F or use the Format Config panel!");
`);

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [formattingService, setFormattingService] = useState<FormattingService | null>(null);
  const [showFormatConfig, setShowFormatConfig] = useState(false);

  const handleParseResult = useCallback((result: ParseResult) => {
    setParseResult(result);
    console.log('📊 Parse Result:', result);
  }, []);

  const handleOutlineChange = useCallback((newOutline: OutlineItem[]) => {
    setOutline(newOutline);
    console.log('🌳 Outline Updated:', newOutline);
  }, []);

  const handleFormattingServiceReady = useCallback((service: FormattingService) => {
    setFormattingService(service);
    console.log('🎨 Formatting Service Ready:', service);
  }, []);

  const handleOutlineItemClick = useCallback((item: OutlineItem) => {
    console.log('🎯 Navigate to:', item);
    // TODO: Implement navigation to the specific line/column
  }, []);

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      background: '#1e1e1e',
      color: '#d4d4d4'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        background: '#252526',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            🎉 OpenSCAD Editor with Smart Navigation & Code Formatting!
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#aaa' }}>
            Parsing • Error detection • Outline • Hover • Completion • Navigation • <strong>Code Formatting (Shift+Alt+F)</strong>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Format Config Toggle */}
          <button
            onClick={() => setShowFormatConfig(!showFormatConfig)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: showFormatConfig ? '#007acc' : '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🎨 Format Config
          </button>
          
          {parseResult && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              <span style={{ 
                color: parseResult.success ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {parseResult.success ? '✅ PARSED' : '❌ ERRORS'}
              </span>
              {parseResult.errors.length > 0 && (
                <span style={{ color: '#f44336' }}>
                  {parseResult.errors.length} error{parseResult.errors.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: showFormatConfig ? '1fr 300px 300px' : '1fr 300px',
        gap: '1px',
        background: '#333'
      }}>
        {/* Editor */}
        <div style={{ background: '#1e1e1e' }}>
          <OpenscadEditorAST
            initialCode={code}
            onCodeChange={setCode}
            onParseResult={handleParseResult}
            onOutlineChange={handleOutlineChange}
            onFormattingServiceReady={handleFormattingServiceReady}
            height="100%"
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* Sidebar - Outline */}
        <div style={{ 
          background: '#1e1e1e',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Outline */}
          <div style={{ flex: 1 }}>
            <OpenscadOutline
              outline={outline}
              onItemClick={handleOutlineItemClick}
              title="Document Outline"
            />
          </div>

          {/* Features Info */}
          <div style={{
            borderTop: '1px solid #333',
            padding: '12px',
            fontSize: '11px',
            lineHeight: '1.5',
            background: '#252526'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#4fc3f7' }}>🎯 Smart Navigation & Formatting!</h4>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#aaa' }}>
              <li>🔍 <strong>Real-time parsing</strong> - AST updates as you type</li>
              <li>❌ <strong>Error detection</strong> - Red underlines for syntax errors</li>
              <li>🌳 <strong>Outline view</strong> - Navigate document structure</li>
              <li>💡 <strong>Hover information</strong> - Details on mouse hover</li>
              <li>✨ <strong>Code completion</strong> - Built-in symbols + user-defined</li>
              <li>🎯 <strong>Smart navigation</strong> - Go-to-definition, find references</li>
              <li>🎨 <strong>Code formatting</strong> - AST-based intelligent formatting</li>
              <li>📊 <strong>Performance metrics</strong> - Parse time and node count</li>
            </ul>
            
            <div style={{ 
              marginTop: '12px',
              padding: '8px',
              background: '#1e1e1e',
              borderRadius: '4px',
              fontSize: '10px'
            }}>
              <strong>Navigation:</strong> Click on any symbol and press <strong>F12</strong> (go-to-definition) 
              or <strong>Shift+F12</strong> (find references). Use <strong>Ctrl+G</strong> for go-to-line!<br/>
              <strong>Formatting:</strong> Press <strong>Shift+Alt+F</strong> to format the document!
            </div>
          </div>
        </div>

        {/* Format Config Panel */}
        {showFormatConfig && formattingService && (
          <div style={{ 
            background: '#1e1e1e',
            borderLeft: '1px solid #333'
          }}>
            <FormattingConfig 
              formattingService={formattingService} 
              currentCode={code}
              onFormattedCode={setCode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ASTDemo;
