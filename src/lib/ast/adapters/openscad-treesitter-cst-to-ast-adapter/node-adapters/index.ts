/**
 * Export all node adapters from a single entry point
 * Follows DRY principles by centralizing imports
 */
export * from './program-adapter/program-adapter';
export * from './call-expression-adapter/call-expression-adapter';
export * from './literal-adapter/literal-adapter';
export * from './identifier-adapter/identifier-adapter';
export * from './assignment-adapter/assignment-adapter';
