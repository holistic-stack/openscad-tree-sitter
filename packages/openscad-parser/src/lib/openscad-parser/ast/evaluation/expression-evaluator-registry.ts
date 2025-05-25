/**
 * @file Expression Evaluator Registry
 * 
 * Central registry for managing expression evaluators.
 * Uses the Strategy pattern to select the appropriate evaluator for each node type.
 */

import { Node as TSNode } from 'web-tree-sitter';
import { IExpressionEvaluator, LiteralEvaluator, IdentifierEvaluator } from './expression-evaluator';
import { BinaryExpressionEvaluator } from './binary-expression-evaluator';
import { ExpressionEvaluationContext, EvaluationResult } from './expression-evaluation-context';
import { ErrorHandler } from '../../error-handling';

/**
 * Registry for managing and dispatching expression evaluators
 */
export class ExpressionEvaluatorRegistry {
  private evaluators: IExpressionEvaluator[] = [];
  private evaluatorCache: Map<string, IExpressionEvaluator> = new Map();

  constructor(private errorHandler: ErrorHandler) {
    this.registerDefaultEvaluators();
  }

  /**
   * Register an expression evaluator
   */
  registerEvaluator(evaluator: IExpressionEvaluator): void {
    this.evaluators.push(evaluator);
    // Sort by priority (highest first)
    this.evaluators.sort((a, b) => b.getPriority() - a.getPriority());
    // Clear cache when evaluators change
    this.evaluatorCache.clear();
  }

  /**
   * Find the best evaluator for a given node
   */
  findEvaluator(node: TSNode): IExpressionEvaluator | null {
    const nodeType = node.type;
    
    // Check cache first
    const cached = this.evaluatorCache.get(nodeType);
    if (cached && cached.canEvaluate(node)) {
      return cached;
    }

    // Find the best evaluator
    for (const evaluator of this.evaluators) {
      if (evaluator.canEvaluate(node)) {
        this.evaluatorCache.set(nodeType, evaluator);
        return evaluator;
      }
    }

    return null;
  }

  /**
   * Evaluate an expression node
   */
  evaluate(node: TSNode, context: ExpressionEvaluationContext): EvaluationResult {
    this.errorHandler.logInfo(
      `[ExpressionEvaluatorRegistry] Evaluating node: ${node.type} "${node.text.substring(0, 50)}"`
    );

    const evaluator = this.findEvaluator(node);
    if (!evaluator) {
      this.errorHandler.logWarning(
        `No evaluator found for node type: ${node.type}`
      );
      return {
        value: null,
        type: 'undef'
      };
    }

    try {
      const result = evaluator.evaluate(node, context);
      this.errorHandler.logInfo(
        `[ExpressionEvaluatorRegistry] Evaluation result: ${result.type} = ${result.value}`
      );
      return result;
    } catch (error) {
      this.errorHandler.handleError(
        new Error(`Failed to evaluate expression: ${error}`)
      );
      return {
        value: null,
        type: 'undef'
      };
    }
  }

  /**
   * Evaluate with automatic context creation
   */
  evaluateWithContext(node: TSNode, variables: Record<string, any> = {}): EvaluationResult {
    const context = new ExpressionEvaluationContext(this.errorHandler);
    
    // Set variables in context
    for (const [name, value] of Object.entries(variables)) {
      context.setVariable(name, {
        value,
        type: this.inferType(value)
      });
    }

    return this.evaluate(node, context);
  }

  /**
   * Get all registered evaluators
   */
  getEvaluators(): IExpressionEvaluator[] {
    return [...this.evaluators];
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.evaluatorCache.clear();
  }

  /**
   * Register default evaluators
   */
  private registerDefaultEvaluators(): void {
    // Register in order of specificity (most specific first)
    this.registerEvaluator(new LiteralEvaluator());
    this.registerEvaluator(new IdentifierEvaluator());
    this.registerEvaluator(new BinaryExpressionEvaluator());
    
    // Patch binary expression evaluator to use this registry
    this.patchBinaryExpressionEvaluator();
  }

  /**
   * Patch the binary expression evaluator to use this registry for operand evaluation
   */
  private patchBinaryExpressionEvaluator(): void {
    const binaryEvaluator = this.evaluators.find(e => e instanceof BinaryExpressionEvaluator) as BinaryExpressionEvaluator;
    if (binaryEvaluator) {
      // Override the evaluateOperand method to use this registry
      (binaryEvaluator as any).evaluateOperand = (node: TSNode, context: ExpressionEvaluationContext) => {
        return this.evaluate(node, context);
      };
    }
  }

  /**
   * Infer type from JavaScript value
   */
  private inferType(value: any): 'number' | 'string' | 'boolean' | 'vector' | 'undef' {
    if (value === null || value === undefined) {
      return 'undef';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (Array.isArray(value)) {
      return 'vector';
    }
    return 'undef';
  }
}

/**
 * Factory function to create a configured expression evaluator registry
 */
export function createExpressionEvaluatorRegistry(errorHandler: ErrorHandler): ExpressionEvaluatorRegistry {
  return new ExpressionEvaluatorRegistry(errorHandler);
}

/**
 * Convenience function to evaluate a simple expression
 */
export function evaluateExpression(
  node: TSNode,
  errorHandler: ErrorHandler,
  variables: Record<string, any> = {}
): EvaluationResult {
  const registry = createExpressionEvaluatorRegistry(errorHandler);
  return registry.evaluateWithContext(node, variables);
}

/**
 * Convenience function to evaluate an expression and return just the value
 */
export function evaluateExpressionValue(
  node: TSNode,
  errorHandler: ErrorHandler,
  variables: Record<string, any> = {}
): any {
  const result = evaluateExpression(node, errorHandler, variables);
  return result.value;
}
