# Testing

## Test Framework

### Vitest
- All tests use **Vitest** (NOT Jest, Mocha, or others)
- Configuration in `vitest.config.ts`
- Coverage provider: v8
- Coverage reporters: text, json, json-summary

## Test Structure

### File Organization
```
lib/
└── client.ts
test/
├── client.test.ts
└── fixtures/
    └── draft-response.json
```

Tests in `test/` directory, mirroring `lib/` structure.
Fixtures (mock API responses, sample ProseMirror docs) in `test/fixtures/`.

### Test Pattern (AAA)
```typescript
import { describe, it, expect } from 'vitest';

describe('SubstackClient', () => {
  describe('createDraft', () => {
    it('should create a draft with title and body', async () => {
      // Arrange
      const client = createTestClient();
      const input = { title: 'Test', markdown: '# Hello' };

      // Act
      const draft = await client.createDraft(input);

      // Assert
      expect(draft.id).toBeDefined();
      expect(draft.title).toBe('Test');
    });
  });
});
```

## Mocking

### HTTP Mocking
- Use `msw` (Mock Service Worker) for HTTP mocking
- Define handlers that simulate Substack API responses
- Use real response fixtures captured from the API

### When to Mock
- External HTTP calls (Substack API)
- Timers (scheduling, retry delays)

### When NOT to Mock
- Internal functions, pure transforms
- The markdown → ProseMirror transform (test with real input/output)

## Test Categories

### Unit Tests
- Pure functions (transform, helpers)
- Error class behavior
- Request building (URL, headers, body construction)

### Integration Tests
- Full client → mocked HTTP → parsed response
- Auth flow (cookie injection, session validation)
- Retry logic (simulate 429/503 → retry → success)

## Best Practices

### Test Naming
- Use `should` in test names: "should throw SubstackAuthError when cookie is expired"
- Group by method: `describe('publish', () => { ... })`

### Independence
- Each test must be independent — no shared mutable state
- Use `beforeEach` for client setup

### Edge Cases
- Empty responses, malformed JSON
- HTTP 401/403/429/500 responses
- Network timeouts
- Invalid ProseMirror documents

### Coverage
- Target: 90%+ on `lib/`
- Exclude: `index.ts` barrel re-exports, `types.ts`
