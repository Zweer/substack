import { describe, expect, it } from 'vitest';

import { SubstackAuthError, SubstackClient, SubstackError } from '../lib/index.js';

describe('substack-client exports', () => {
  it('should export SubstackClient class', () => {
    expect(SubstackClient).toBeDefined();
    expect(typeof SubstackClient).toBe('function');
  });

  it('should export error classes', () => {
    expect(SubstackError).toBeDefined();
    expect(SubstackAuthError).toBeDefined();
  });
});
