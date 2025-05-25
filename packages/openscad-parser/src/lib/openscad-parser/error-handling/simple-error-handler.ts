/**
 * @file Simple error handler for OpenSCAD parser
 * 
 * This is a minimal implementation of the error handling system
 * that provides the interface expected by the visitors while
 * avoiding the complex dependencies of the full error handling system.
 */

/**
 * Simple error handler interface
 */
export interface IErrorHandler {
  logInfo(message: string): void;
  logWarning(message: string): void;
  handleError(error: Error | string): void;
}

/**
 * Simple error handler implementation
 * 
 * This provides basic error handling functionality without
 * the complex dependencies of the full error handling system.
 */
export class SimpleErrorHandler implements IErrorHandler {
  private errors: string[] = [];
  private warnings: string[] = [];
  private infos: string[] = [];

  /**
   * Log an informational message
   */
  logInfo(message: string): void {
    this.infos.push(message);
    console.info(`[INFO] ${message}`);
  }

  /**
   * Log a warning message
   */
  logWarning(message: string): void {
    this.warnings.push(message);
    console.warn(`[WARNING] ${message}`);
  }

  /**
   * Handle an error
   */
  handleError(error: Error | string): void {
    const errorMessage = error instanceof Error ? error.message : error;
    this.errors.push(errorMessage);
    console.error(`[ERROR] ${errorMessage}`);
  }

  /**
   * Get all collected errors
   */
  getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Get all collected warnings
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }

  /**
   * Get all collected info messages
   */
  getInfos(): string[] {
    return [...this.infos];
  }

  /**
   * Clear all collected messages
   */
  clear(): void {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
}
