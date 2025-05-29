// Re-export from argument-extractor
export {
  extractArguments,
} from './argument-extractor';

// Re-export types from argument-extractor
export type {
  ExtractedNamedArgument,
  ExtractedParameter,
} from './argument-extractor';

// Re-export from value-extractor with a renamed function to avoid conflict
import { extractValue as extractParameterValue } from './value-extractor.js';
export { extractParameterValue };
