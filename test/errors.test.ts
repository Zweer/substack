import { describe, expect, it } from 'vitest';

import {
  SubstackAuthError,
  SubstackError,
  SubstackNotFoundError,
  SubstackRateLimitError,
} from '../lib/errors.js';

describe('SubstackError', () => {
  it('should carry statusCode, endpoint, and name', () => {
    const error = new SubstackError('Something failed', 500, '/api/v1/drafts');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SubstackError');
    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(500);
    expect(error.endpoint).toBe('/api/v1/drafts');
    expect(error.responseBody).toBeUndefined();
  });

  it('should include responseBody when provided', () => {
    const body = { error: 'internal' };
    const error = new SubstackError('Fail', 500, '/api/v1/drafts', body);

    expect(error.responseBody).toEqual(body);
  });
});

describe('SubstackAuthError', () => {
  it('should default to status 401', () => {
    const error = new SubstackAuthError('/api/v1/drafts');

    expect(error).toBeInstanceOf(SubstackError);
    expect(error.name).toBe('SubstackAuthError');
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Invalid or expired session cookie');
    expect(error.endpoint).toBe('/api/v1/drafts');
  });

  it('should accept status 403', () => {
    const error = new SubstackAuthError('/api/v1/drafts', 403);

    expect(error.statusCode).toBe(403);
  });

  it('should include responseBody when provided', () => {
    const body = { error: 'unauthorized' };
    const error = new SubstackAuthError('/api/v1/drafts', 401, body);

    expect(error.responseBody).toEqual(body);
  });
});

describe('SubstackNotFoundError', () => {
  it('should have status 404 and correct name', () => {
    const error = new SubstackNotFoundError('/api/v1/drafts/999');

    expect(error).toBeInstanceOf(SubstackError);
    expect(error.name).toBe('SubstackNotFoundError');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.endpoint).toBe('/api/v1/drafts/999');
  });
});

describe('SubstackRateLimitError', () => {
  it('should have status 429 and generic message without retryAfter', () => {
    const error = new SubstackRateLimitError('/api/v1/drafts');

    expect(error).toBeInstanceOf(SubstackError);
    expect(error.name).toBe('SubstackRateLimitError');
    expect(error.statusCode).toBe(429);
    expect(error.message).toBe('Rate limited by Substack');
    expect(error.retryAfter).toBeUndefined();
  });

  it('should include retryAfter in message when provided', () => {
    const error = new SubstackRateLimitError('/api/v1/drafts', 30);

    expect(error.retryAfter).toBe(30);
    expect(error.message).toBe('Rate limited — retry after 30s');
  });
});
