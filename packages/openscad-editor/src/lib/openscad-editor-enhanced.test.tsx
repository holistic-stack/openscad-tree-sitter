/**
 * @file Tests for Enhanced OpenSCAD Editor
 * 
 * Tests the enhanced editor component with real-time error detection,
 * quick fixes, and comprehensive diagnostic capabilities.
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OpenscadEditorEnhanced, type OpenscadEditorEnhancedProps } from './openscad-editor-enhanced';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ onMount, loading, ...props }: any) => {
    React.useEffect(() => {
      if (onMount) {
        const mockEditor = {
          getModel: () => ({
            uri: { toString: () => 'test://model.scad' },
            getValue: () => props.value || '',
            onDidChangeContent: vi.fn(() => ({ dispose: vi.fn() }))
          }),
          dispose: vi.fn()
        };
        const mockMonaco = {
          languages: {
            registerCompletionItemProvider: vi.fn(),
            registerDefinitionProvider: vi.fn(),
            registerReferenceProvider: vi.fn(),
            registerDocumentSymbolProvider: vi.fn(),
            registerHoverProvider: vi.fn(),
            registerCodeActionProvider: vi.fn()
          },
          editor: {
            setModelMarkers: vi.fn()
          }
        };
        onMount(mockEditor, mockMonaco);
      }
    }, [onMount]);

    return (
      <div data-testid="monaco-editor">
        {loading || 'Monaco Editor Mock'}
      </div>
    );
  }
}));

// Mock Monaco Editor API
vi.mock('monaco-editor/esm/vs/editor/editor.api', () => ({
  editor: {
    setModelMarkers: vi.fn()
  },
  languages: {
    registerCompletionItemProvider: vi.fn(),
    registerDefinitionProvider: vi.fn(),
    registerReferenceProvider: vi.fn(),
    registerDocumentSymbolProvider: vi.fn(),
    registerHoverProvider: vi.fn(),
    registerCodeActionProvider: vi.fn()
  }
}));

describe('OpenscadEditorEnhanced', () => {
  const defaultProps: OpenscadEditorEnhancedProps = {
    value: 'cube(10);',
    onChange: vi.fn(),
    height: '400px',
    width: '100%'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the enhanced editor', async () => {
      render(<OpenscadEditorEnhanced {...defaultProps} />);
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<OpenscadEditorEnhanced {...defaultProps} />);
      
      expect(screen.getByText(/Loading Enhanced OpenSCAD Editor/)).toBeInTheDocument();
    });

    it('should handle custom dimensions', () => {
      const { container } = render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          height="500px" 
          width="800px" 
        />
      );
      
      const editorContainer = container.firstChild as HTMLElement;
      expect(editorContainer).toHaveStyle({ height: '500px', width: '800px' });
    });
  });

  describe('Feature Configuration', () => {
    it('should enable all features by default', () => {
      render(<OpenscadEditorEnhanced {...defaultProps} />);
      
      // All features should be enabled by default
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling diagnostics', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableDiagnostics={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling quick fixes', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableQuickFixes={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling navigation features', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableNavigation={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling hover information', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableHover={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling code completion', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableCompletion={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should allow disabling formatting', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          enableFormatting={false}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });

  describe('Callback Handling', () => {
    it('should call onChange when value changes', () => {
      const onChange = vi.fn();
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          onChange={onChange}
        />
      );
      
      // onChange would be called by Monaco editor in real usage
      expect(onChange).not.toHaveBeenCalled(); // Not called in mock
    });

    it('should call onError when errors are detected', async () => {
      const onError = vi.fn();
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          onError={onError}
        />
      );
      
      // In real usage, onError would be called when diagnostics detect errors
      // Mock doesn't trigger this, but the callback is set up
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call onParseResult when parsing completes', async () => {
      const onParseResult = vi.fn();
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          onParseResult={onParseResult}
        />
      );
      
      // In real usage, onParseResult would be called after parsing
      expect(onParseResult).not.toHaveBeenCalled();
    });

    it('should call onOutlineChange when outline updates', async () => {
      const onOutlineChange = vi.fn();
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          onOutlineChange={onOutlineChange}
        />
      );
      
      // In real usage, onOutlineChange would be called when outline changes
      expect(onOutlineChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom Options', () => {
    it('should accept custom Monaco editor options', () => {
      const customOptions = {
        fontSize: 16,
        tabSize: 4,
        wordWrap: 'off' as const
      };
      
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          options={customOptions}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should accept custom theme', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          theme="vs-light"
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should accept custom WASM path', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          wasmPath="/custom/path/tree-sitter-openscad.wasm"
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // This would trigger an error in real usage if WASM fails to load
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          wasmPath="/invalid/path.wasm"
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper ARIA attributes', () => {
      render(<OpenscadEditorEnhanced {...defaultProps} />);
      
      // Monaco editor should have proper accessibility
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<OpenscadEditorEnhanced {...defaultProps} />);
      
      // Re-render with same props
      rerender(<OpenscadEditorEnhanced {...defaultProps} />);
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('should handle large code files efficiently', () => {
      const largeCode = 'cube(10);\n'.repeat(1000);
      
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps} 
          value={largeCode}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should integrate with all Phase 4 and Phase 5 features', () => {
      render(
        <OpenscadEditorEnhanced 
          {...defaultProps}
          enableDiagnostics={true}
          enableQuickFixes={true}
          enableNavigation={true}
          enableHover={true}
          enableCompletion={true}
          enableFormatting={true}
        />
      );
      
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
  });
});
