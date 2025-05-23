import { describe, it, expect } from 'vitest';
import { SyntaxError, ParserError } from './lib/openscad-parser/error-handling/error-types';
import { RecoveryStrategyRegistry } from './lib/openscad-parser/error-handling/recovery-strategies';

describe('Debug Custom Strategy', () => {
  it('should debug custom strategy registration', () => {
    const registry = new RecoveryStrategyRegistry();
    
    // Create a custom strategy
    const customStrategy = {
      canHandle: (error: ParserError) => {
        console.log(`Custom strategy canHandle called with: "${error.message}"`);
        const result = error.message.toLowerCase().includes('custom');
        console.log(`Custom strategy canHandle result: ${result}`);
        return result;
      },
      recover: () => {
        console.log('Custom strategy recover called');
        return 'custom recovery';
      }
    };

    // Register the custom strategy
    registry.register(customStrategy);

    // Create an error that the custom strategy can handle
    const error = new SyntaxError('Custom error');
    console.log(`Created error: "${error.message}"`);
    console.log(`Error instanceof SyntaxError: ${error instanceof SyntaxError}`);

    // The registry should delegate to the custom strategy
    const recovered = registry.recover(error, 'custom code');
    console.log(`Recovery result: ${recovered}`);

    expect(recovered).toBe('custom recovery');
  });
});
