import { describe, expect, it } from 'vitest';

describe('substack-client', () => {
  it('should be importable', async () => {
    const mod = await import('../lib/index.js');
    expect(mod).toBeDefined();
  });
});
