/**
 * Base error for all Substack API failures.
 */
export class SubstackError extends Error {
  override name = 'SubstackError';

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly responseBody?: unknown,
  ) {
    super(message);
  }
}

/**
 * Thrown when the session cookie is invalid or expired (401/403).
 */
export class SubstackAuthError extends SubstackError {
  override name = 'SubstackAuthError';

  constructor(endpoint: string, statusCode: 401 | 403 = 401, responseBody?: unknown) {
    super('Invalid or expired session cookie', statusCode, endpoint, responseBody);
  }
}

/**
 * Thrown when the requested resource does not exist (404).
 */
export class SubstackNotFoundError extends SubstackError {
  override name = 'SubstackNotFoundError';

  constructor(endpoint: string, responseBody?: unknown) {
    super('Resource not found', 404, endpoint, responseBody);
  }
}

/**
 * Thrown when Substack rate-limits the request (429).
 */
export class SubstackRateLimitError extends SubstackError {
  override name = 'SubstackRateLimitError';

  constructor(
    endpoint: string,
    public readonly retryAfter?: number,
  ) {
    super(
      retryAfter ? `Rate limited — retry after ${retryAfter}s` : 'Rate limited by Substack',
      429,
      endpoint,
    );
  }
}
