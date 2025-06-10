/**
 * @file Implementation of the SymbolProvider interface for OpenSCAD.
 * @module ide-support/symbol-provider/symbol-provider
 */

import type {
  ASTNode,
  Position,
  ModuleDefinitionNode,
  FunctionDefinitionNode,
  AssignStatementNode,
  AssignmentNode,
  IdentifierNode,
  SourceLocation,
} from '../../openscad-parser/ast/ast-types.js';
import type { SymbolInfo, SymbolProvider } from './symbol-types.js';
import { OpenscadParser as OpenSCADParser } from '../../openscad-parser/openscad-parser.js';
import { Logger } from '../../openscad-parser/error-handling/logger.js';
import { Severity } from '../../openscad-parser/error-handling/types/error-types.js';
import { SimpleErrorHandler } from '../../openscad-parser/error-handling/simple-error-handler.js';

// Helper function to clone SourceLocation objects
const clonePosition = (pos: Position): Position => ({
  line: pos.line,
  column: pos.column,
  offset: pos.offset,
});

const cloneSourceLocation = (
  loc: SourceLocation | undefined | null
): SourceLocation | undefined => {
  if (!loc) return undefined;
  return {
    start: clonePosition(loc.start),
    end: clonePosition(loc.end),
  };
};

export class OpenSCADSymbolProvider implements SymbolProvider {
  private parser: OpenSCADParser;
  private logger: Logger;
  private errorHandler: SimpleErrorHandler;

  constructor(parser: OpenSCADParser, errorHandler?: SimpleErrorHandler) {
    this.parser = parser;
    this.errorHandler = errorHandler || new SimpleErrorHandler();
    this.logger = new Logger({
      level: Severity.DEBUG,
      includeTimestamp: true,
      includeSeverity: true,
    });
    this.logger.debug('[SymbolProvider] Initialized');
  }

  /**
   * Retrieves all symbols defined in the given Abstract Syntax Tree (AST).
   */
  getSymbols(ast: ASTNode[]): SymbolInfo[] {
    this.logger.debug(
      '[SymbolProvider.getSymbols] called. AST length: ' +
        (ast ? ast.length : 'undefined/null')
    );
    const symbols: SymbolInfo[] = [];

    if (!Array.isArray(ast)) {
      this.logger.warn(
        '[SymbolProvider.getSymbols] Received non-array AST. Returning empty symbols array.'
      );
      return [];
    }

    // Recursively extract symbols from the AST
    this.extractSymbolsRecursively(ast, symbols);

    this.logger.debug(
      `[SymbolProvider.getSymbols] Returning ${symbols.length} symbols. Details:`
    );
    symbols.forEach((s, index) => {
      this.logger.debug(`  Symbol[${index}]: ${s.name}, kind: ${s.kind}`);
      this.logger.debug(`    loc: ${JSON.stringify(s.loc)}`);
      this.logger.debug(
        `    nameLoc: ${s.nameLoc ? JSON.stringify(s.nameLoc) : 'undefined'}`
      );
    });
    this.logger.debug(
      `[SymbolProvider.getSymbols] Final symbols before return: ${JSON.stringify(
        symbols,
        null,
        2
      )}`
    );
    return symbols;
  }

  /**
   * Recursively extracts symbols from AST nodes and their children.
   */
  private extractSymbolsRecursively(nodes: ASTNode[], symbols: SymbolInfo[]): void {
    for (const node of nodes) {
      if (!node || !node.location) {
        this.logger.debug(
          `[SymbolProvider.extractSymbolsRecursively] Skipping node due to missing node or node.location: ${JSON.stringify(
            node
          )}`
        );
        continue;
      }

      // Extract symbol from current node
      this.extractSymbolFromNode(node, symbols);

      // Recursively process children
      this.processNodeChildren(node, symbols);
    }
  }

  /**
   * Extracts symbol information from a single AST node.
   */
  private extractSymbolFromNode(node: ASTNode, symbols: SymbolInfo[]): void {
    switch (node.type) {
        case 'module_definition': {
          const moduleNode = node as ModuleDefinitionNode;
          if (
            moduleNode.name &&
            typeof moduleNode.name.name === 'string' &&
            moduleNode.location &&
            moduleNode.name.location
          ) {
            const locObj = cloneSourceLocation(moduleNode.location);
            const nameLocObj = cloneSourceLocation(moduleNode.name.location); // name node's location for nameLoc

            if (!locObj || !nameLocObj) {
              this.logger.warn(
                `[SymbolProvider.getSymbols] Missing locObj or nameLocObj for module: ${moduleNode.name.name}`
              );
              return;
            }

            const symbolInfo: SymbolInfo = {
              name: moduleNode.name.name,
              kind: 'module',
              loc: locObj,
              nameLoc: nameLocObj,
            };
            symbols.push(symbolInfo);
            this.logger.debug(
              `[SymbolProvider.getSymbols] Added module: ${JSON.stringify(
                symbolInfo
              )}`
            );
          }
          break;
        }
        case 'function_definition': {
          const functionNode = node as FunctionDefinitionNode;
          if (
            functionNode.name &&
            typeof functionNode.name.name === 'string' &&
            functionNode.location &&
            functionNode.name.location
          ) {
            const locObj = cloneSourceLocation(functionNode.location);
            const nameLocObj = cloneSourceLocation(functionNode.name.location); // name node's location for nameLoc

            if (!locObj || !nameLocObj) {
              this.logger.warn(
                `[SymbolProvider.extractSymbolFromNode] Missing locObj or nameLocObj for function: ${functionNode.name.name}`
              );
              return;
            }

            const symbolInfo: SymbolInfo = {
              name: functionNode.name.name,
              kind: 'function',
              loc: locObj,
              nameLoc: nameLocObj,
            };
            symbols.push(symbolInfo);
            this.logger.debug(
              `[SymbolProvider.getSymbols] Added function: ${JSON.stringify(
                symbolInfo
              )}`
            );
          }
          break;
        }
        case 'assign': {
          const assignStNode = node as AssignStatementNode;
          if (
            assignStNode.assignments &&
            Array.isArray(assignStNode.assignments)
          ) {
            for (const assignment of assignStNode.assignments) {
              if (
                assignment &&
                assignment.location &&
                assignment.variable &&
                typeof assignment.variable.name === 'string' &&
                assignment.variable.location
              ) {
                const locObj = cloneSourceLocation(assignment.location); // Location of the whole assignment expression
                const nameLocObj = cloneSourceLocation(
                  assignment.variable.location
                ); // Location of the variable identifier itself

                if (!locObj || !nameLocObj) {
                  this.logger.warn(
                    `[SymbolProvider.getSymbols] Missing locObj or nameLocObj for assignment: ${assignment.variable.name}`
                  );
                  continue;
                }

                const symbolInfo: SymbolInfo = {
                  name: assignment.variable.name,
                  kind: 'variable',
                  loc: locObj,
                  nameLoc: nameLocObj,
                };
                symbols.push(symbolInfo);
                this.logger.debug(
                  `[SymbolProvider.getSymbols] Added variable: ${JSON.stringify(
                    symbolInfo
                  )}`
                );
              }
            }
          }
          break;
        }
        case 'assignment': {
          const assignmentNode = node as AssignmentNode;
          if (
            assignmentNode.location &&
            assignmentNode.variable &&
            typeof assignmentNode.variable.name === 'string' &&
            assignmentNode.variable.location
          ) {
            const locObj = cloneSourceLocation(assignmentNode.location); // Location of the whole assignment expression
            const nameLocObj = cloneSourceLocation(
              assignmentNode.variable.location
            ); // Location of the variable identifier itself

            if (!locObj || !nameLocObj) {
              this.logger.warn(
                `[SymbolProvider.getSymbols] Missing locObj or nameLocObj for assignment: ${assignmentNode.variable.name}`
              );
              break;
            }

            const symbolInfo: SymbolInfo = {
              name: assignmentNode.variable.name,
              kind: 'variable',
              loc: locObj,
              nameLoc: nameLocObj,
            };
            symbols.push(symbolInfo);
            this.logger.debug(
              `[SymbolProvider.getSymbols] Added variable: ${JSON.stringify(
                symbolInfo
              )}`
            );
          }
          break;
        }
        default:
          this.logger.debug(
            `[SymbolProvider.extractSymbolFromNode] Unhandled node type: ${node.type}`
          );
          break;
      }
  }

  /**
   * Retrieves the symbol defined at a specific position in the source code.
   */
  getSymbolAtPosition(ast: ASTNode[], position: Position): SymbolInfo | null {
    this.logger.debug(
      `[SymbolProvider.getSymbolAtPosition] Called for position: ${JSON.stringify(
        position
      )}`
    );
    const symbols = this.getSymbols(ast); // Potentially optimize later to not re-calculate all symbols

    for (const symbol of symbols) {
      const effectiveLocation = symbol.nameLoc || symbol.loc;

      if (!effectiveLocation) {
        this.logger.debug(
          `Symbol '${symbol.name}' has no effective location (neither nameLoc nor loc), skipping.`
        );
        continue;
      }

      if (!effectiveLocation.start || !effectiveLocation.end) {
        this.logger.warn(
          `[SymbolProvider.getSymbolAtPosition] effectiveLocation is invalid for symbol ${symbol.name}.`
        );
        continue;
      }

      const { start, end } = effectiveLocation;
      this.logger.debug(
        `Checking symbol '${symbol.name}' (kind: ${symbol.kind}) with location: ` +
          `L${start.line} C${start.column} O${start.offset} to L${end.line} C${end.column} O${end.offset}`
      );

      if (
        position.line >= start.line &&
        position.line <= end.line &&
        (position.line > start.line || position.column >= start.column) &&
        (position.line < end.line || position.column < end.column) // end.column is exclusive
      ) {
        this.logger.debug(
          `[SymbolProvider.getSymbolAtPosition] Found symbol '${symbol.name}' at target position.`
        );
        this.logger.debug(
          `  Symbol details - Name: ${symbol.name}, Kind: ${symbol.kind}`
        );
        this.logger.debug(`    loc: ${JSON.stringify(symbol.loc)}`);
        this.logger.debug(
          `    nameLoc: ${
            symbol.nameLoc ? JSON.stringify(symbol.nameLoc) : 'undefined'
          }`
        );
        return symbol;
      }
    }
    this.logger.debug(
      `[SymbolProvider.getSymbolAtPosition] No symbol found at target position: ${JSON.stringify(
        position
      )}.`
    );
    return null;
  }

  /**
   * Processes children of an AST node to extract nested symbols.
   */
  private processNodeChildren(node: ASTNode, symbols: SymbolInfo[]): void {
    // Handle module definitions with body
    if (node.type === 'module_definition') {
      const moduleNode = node as ModuleDefinitionNode;
      if (moduleNode.body && Array.isArray(moduleNode.body)) {
        this.extractSymbolsRecursively(moduleNode.body, symbols);
      }
    }

    // Handle function definitions (they might have nested symbols in the future)
    if (node.type === 'function_definition') {
      const functionNode = node as FunctionDefinitionNode;
      // Functions don't typically have nested symbols, but we could add parameter extraction here
    }

    // Handle other node types that might have children
    // Add more cases as needed for other node types with children
  }
}
