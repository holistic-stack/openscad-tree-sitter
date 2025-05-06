/**
 * @file debug-member-access.test.ts
 * @description Focused debugging tests for member access.
 */

import { describe, it, expect } from 'vitest';
import { parseCode, hasErrors } from '../helpers/parser-test-utils'; // Corrected path

describe('Debug Member Access', () => {
  it('should parse basic member access: identifier.identifier', () => {
    const code = 'a = point.x;';
    const tree = parseCode(code);
    // We expect this to fail initially with the full grammar, 
    // but aim to make it pass with a minimal grammar.
    expect(hasErrors(tree.rootNode)).toBe(false);
  });
}); 