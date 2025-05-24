// Re-export from argument-extractor
export {
  extractArguments,
  ExtractedNamedArgument,
  ExtractedParameter,
} from './argument-extractor';

// Re-export from value-extractor with a renamed function to avoid conflict
import { extractValue as extractParameterValue } from './value-extractor';
export { extractParameterValue };
