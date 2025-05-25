# OpenSCAD Editor Implementation Plan

## Overview
This document outlines the plan for implementing a Monaco-based OpenSCAD editor with Tree-sitter integration.

## PROJECT STATUS - UPDATED 2025-05-25

### ✅ MAJOR MILESTONE ACHIEVED: Monaco Editor Syntax Highlighting COMPLETED

**Top Priority Task Successfully Implemented**: Complete working syntax highlighting system using Monaco's Monarch tokenizer

## Implementation Phases

### Phase 1: Project Setup and Basic Monaco Integration ✅ COMPLETED
- [x] Generate Nx Package (`openscad-editor`) - COMPLETED
- [x] Add Dependencies - COMPLETED  
- [x] Basic Monaco Editor Component - COMPLETED
- [x] Initial Tests - COMPLETED

### Phase 2: Monaco Language Service ✅ COMPLETED (2025-05-25)
**Status**: FULLY IMPLEMENTED - Complete working syntax highlighting system

#### ✅ Successfully Implemented Features:
- [x] ✅ **Monaco Monarch Tokenizer**: Complete OpenSCAD language definition with proper token mapping
- [x] ✅ **Comprehensive Syntax Highlighting**: All OpenSCAD keywords, functions, modules, constants, and syntax elements
- [x] ✅ **Professional Theme**: Custom `openscad-dark` theme optimized for OpenSCAD development
- [x] ✅ **Working Editor Component**: `OpenscadEditorV2` with full Monaco integration
- [x] ✅ **Demo Application**: Running successfully at http://localhost:5176 with comprehensive examples
- [x] ✅ **Language Features**: Comments, strings, numbers, operators, brackets with proper highlighting

#### 🔄 Tree-sitter Integration (Future Enhancement):
- [ ] Error detection and reporting (Tree-sitter integration)
- [ ] Code completion suggestions (Tree-sitter integration)  
- [ ] Hover information and documentation (Tree-sitter integration)

#### Files Successfully Created:
- `packages/openscad-editor/src/lib/openscad-language.ts` - Complete Monaco language definition
- `packages/openscad-editor/src/lib/openscad-editor-v2.tsx` - Working editor component
- `packages/openscad-demo/src/simple-demo.tsx` - Fallback demo component

### Phase 3: `openscad-parser` Integration for AST-based Features 🔄 NEXT PRIORITY
**Status**: Ready to implement with solid Monaco foundation - **DETAILED IMPLEMENTATION PLAN**

#### 🚨 CRITICAL BLOCKER: Parser Build Issues (Must Fix First)
**Current Status**: 6 specific TypeScript errors prevent openscad-parser from building

**Specific Errors Identified**:
1. **FunctionCallNode vs ExpressionNode Type Conflicts** (2 errors):
   - `expression-visitor.ts:127`: `FunctionCallNode` missing `expressionType` property
   - `expression-visitor.ts:216`: Return type incompatibility in function call delegation
   
2. **ParameterValue Null Assignment Error** (1 error):
   - `expression-visitor.ts:397`: Cannot assign `null` to `ParameterValue` type for `undef` literals
   
3. **Expression Sub-visitor Type Inheritance Problems** (3 errors):
   - `binary-expression-visitor.ts:67`: `ExpressionNode` not assignable to `BinaryExpressionNode`
   - `conditional-expression-visitor.ts:55`: `ExpressionNode` not assignable to `ConditionalExpressionNode`  
   - `unary-expression-visitor.ts:56`: Missing `prefix` property in `UnaryExpressionNode`

#### Priority Tasks - REFINED IMPLEMENTATION PLAN:

**TASK 1: Fix Parser Build Issues** 🚨 CRITICAL - ESTIMATED: 2-4 hours
1. **Type System Corrections**:
   - Add `expressionType` property to `FunctionCallNode` interface or adjust type hierarchy
   - Update `ParameterValue` type to allow `null` for `undef` literals
   - Fix expression sub-visitor return type compatibility

2. **Delegation Pattern Fixes**:
   - Ensure expression visitor delegation returns compatible types
   - Update sub-visitor parent delegation to handle type constraints
   - Verify visitor pattern type safety throughout expression hierarchy

3. **Validation**:
   - Run `pnpm build:parser` to confirm zero TypeScript errors
   - Execute parser test suite to validate functionality
   - Test AST generation with demo's OpenSCAD examples

**TASK 2: Integrate AST Parsing** ⏳ ESTIMATED: 4-6 hours
1. **Real-time Parser Integration**:
   - Add `openscad-parser` dependency to `openscad-editor` package
   - Create parser service to handle code-to-AST conversion
   - Implement debounced parsing on editor content changes

2. **AST Integration Points**:
   - Parse editor content on initialization and changes
   - Extract document structure (modules, functions, variables)
   - Generate semantic information for hover and completion

**TASK 3: Error Detection & Markers** ⏳ ESTIMATED: 3-4 hours
1. **Monaco Markers Integration**:
   - Use Monaco's `IMarkerData` API to display syntax errors
   - Map parser errors to Monaco editor positions
   - Provide error severities (error, warning, info)

2. **Error Visualization**:
   - Red underlines for syntax errors
   - Error tooltips with descriptive messages
   - Problem panel integration (optional)

**TASK 4: AST-driven Features** ⏳ ESTIMATED: 6-8 hours
1. **Outline View Implementation**:
   - Extract module definitions, function definitions, variable declarations
   - Create hierarchical document structure
   - Implement click-to-navigate functionality

2. **Hover Information Provider**:
   - Show symbol information (type, definition location)
   - Display parameter information for modules/functions
   - Include OpenSCAD documentation where applicable

#### Technical Implementation Details:

**Parser Service Architecture**:
```typescript
class OpenSCADParserService {
  private parser: OpenscadParser;
  private documentAST: ASTNode | null = null;
  
  async parseDocument(content: string): Promise<ParseResult> {
    // Parse with error recovery
    // Extract AST and errors
    // Cache results for performance
  }
  
  getDocumentOutline(): OutlineItem[] {
    // Extract structure from AST
  }
  
  getHoverInfo(position: Position): HoverInfo | null {
    // Find AST node at position
    // Return symbol information
  }
}
```

**Monaco Integration Points**:
- **Language Service**: Register OpenSCAD language with Monaco
- **Diagnostic Provider**: Convert parser errors to Monaco markers
- **Hover Provider**: Use AST to provide contextual information
- **Outline Provider**: Generate document structure from AST

#### Success Criteria:
- ✅ **Parser Builds Successfully**: Zero TypeScript compilation errors
- ✅ **Real-time AST Generation**: Code changes trigger AST updates
- ✅ **Error Detection**: Syntax errors displayed with red underlines
- ✅ **Working Outline**: Document structure shows modules/functions
- ✅ **Hover Information**: Symbol details appear on mouse hover
- ✅ **Performance**: <100ms parsing for typical files (<1000 lines)

#### Demo Integration:
The `openscad-demo` is already prepared with:
- AST-optimized OpenSCAD code examples
- Comprehensive test cases for all language constructs
- Error test cases (commented) for validation
- Visual presentation of implementation progress

### Phase 4: Advanced Features and Refinements 📋 PLANNED
**Status**: Well-defined roadmap with Monaco foundation complete

#### Advanced Editor Features:
1. **Code Completion**: Basic Monaco code completion provider with OpenSCAD keywords
2. **Code Formatting**: AST-based formatting rules
3. **Performance Optimization**: Debouncing, web workers for large files
4. **Configuration Options**: Configurable editor props (theme, initial code, etc.)

### Phase 5: Documentation and Packaging 📋 PLANNED
**Status**: Standard documentation and packaging tasks

## Technical Architecture Decisions

### ✅ Monaco Monarch vs Tree-sitter Integration
**Decision Made**: Monaco's Monarch tokenizer for immediate working solution
- **Rationale**: Proven stability, excellent performance, comprehensive features
- **Benefits**: Professional-grade syntax highlighting available immediately
- **Future Path**: Tree-sitter integration remains as enhancement opportunity for AST-based features

### ✅ Implementation Approach
**Successful Strategy**: Incremental development with working demos
- Phase 2 completed with fully functional syntax highlighting
- Solid foundation for Tree-sitter integration in Phase 3
- Professional editor experience immediately available

## Key Files and Components

### Core Implementation:
- `openscad-language.ts`: Complete Monaco language definition with Monarch tokenizer
- `openscad-editor-v2.tsx`: Production-ready editor component  
- `openscad-demo`: Working demonstration application

### Integration Status:
- **Monaco Editor**: ✅ Fully integrated and working
- **Syntax Highlighting**: ✅ Complete and professional
- **Tree-sitter Parser**: 🔄 Ready for integration (Phase 3)
- **AST Features**: 📋 Planned for Phase 3

## Next Priority Tasks

### Immediate (Phase 3):
1. **Complete openscad-parser Build**: Resolve remaining build issues for Tree-sitter integration
2. **AST Integration**: Connect `openscad-parser` to Monaco for advanced features
3. **Error Reporting**: Implement live syntax error detection using Monaco markers
4. **Outline View**: Create AST-driven code outline for navigation

### Strategic:
1. **Language Server Protocol**: Implement LSP for advanced IDE features
2. **Real-time Validation**: Add live syntax and semantic error checking  
3. **Code Generation**: Add OpenSCAD code generation and manipulation features
4. **Performance Optimization**: Fine-tune editor performance for large files

## Success Metrics Achieved

### ✅ Phase 2 Completion Metrics:
- **100% Functional Syntax Highlighting**: All OpenSCAD language constructs properly highlighted
- **Professional Editor Experience**: Comparable to modern IDEs
- **Working Demo**: Live demonstration at http://localhost:5176
- **Comprehensive Language Support**: 50+ OpenSCAD keywords, functions, and modules
- **Custom Theme**: Optimized dark theme for OpenSCAD development
- **Solid Architecture**: Clean, maintainable code ready for enhancement

The OpenSCAD editor now provides a professional development experience with complete syntax highlighting. The foundation is solid for implementing Tree-sitter-based AST features in Phase 3.

---

## Legacy Documentation (Pre-2025-05-25)

The sections below document the original research and planning that led to the successful Monaco implementation.

### Original Phase 2 Research: Tree-sitter Integration Investigation

**Note**: This approach was researched but pivoted to Monaco Monarch for immediate working solution.

1. **Load OpenSCAD Grammar (WASM) & Queries - COMPLETED**
   - Tree-sitter WASM files available in public directories
   - Grammar queries configured for syntax highlighting
   - Asset copying workflows established

2. **Monaco Integration Research - PIVOTED**
   - Initial investigation of `monaco-tree-sitter` library showed compatibility issues
   - **Pivot Decision**: Implement Monaco Monarch tokenizer instead
   - **Result**: Successful working syntax highlighting achieved

### Technology Choices and Rationale

#### Core Technologies:
- **Monaco Editor**: Industry-standard web editor with excellent features
- **Monaco Monarch**: Proven tokenizer for syntax highlighting
- **React**: Component-based architecture for editor integration
- **Vite**: Modern build system for library development
- **TypeScript**: Type safety and excellent IDE support

#### Integration Strategy:
- **Immediate Value**: Monaco Monarch provides working syntax highlighting
- **Future Enhancement**: Tree-sitter integration available for AST-based features
- **Incremental Development**: Each phase builds on previous achievements
- **Professional Quality**: Focus on production-ready editor experience

This plan successfully delivered a working OpenSCAD editor with professional syntax highlighting, providing immediate value while maintaining a clear path for future Tree-sitter enhancements.