# Core Client — Tasks

## Dependency Graph

```
T1 (Project Setup) → T2 (Types) → T3 (Errors) → T4 (HttpClient)
                                                       │
                                        ┌──────────────┼──────────────┐
                                        ▼              ▼              ▼
                                  T5 (Drafts)    T6 (Publish)   T7 (Sections)
                                        │              │              │
                                        └──────────────┼──────────────┘
                                                       ▼
                                                 T8 (Facade)
                                                       │
                                                       ▼
                                                 T9 (Integration Tests)
```

## T1 — Project Setup ✅

Create the foundational project scaffolding.

- [x] `package.json` — name: `@zweer/substack-client`, type: module, engines: node >=22
- [x] `tsconfig.json` — strict, ESM, target ES2022, declaration
- [x] `tsdown.config.ts` — dual CJS/ESM, dts, two entry points (index + transform)
- [x] `biome.json` — single quotes, 100 width, tabs, import sorting
- [x] `vitest.config.ts` — v8 coverage, include lib/
- [x] `.gitignore` — dist/, node_modules/, coverage/
- [x] Create `lib/` and `test/` directories with placeholder files
- [x] Verify: `npm run build` and `npm test` both pass (empty)

**Acceptance:** `npm run build`, `npm run lint`, `npm test` all exit 0. ✅

## T2 — Type Definitions ✅

Define all public types for the client API surface.

- [x] `lib/types.ts` — All interfaces and type aliases:
  - `SubstackClientOptions`
  - `CreateDraftInput`, `UpdateDraftInput`
  - `Draft`, `Audience`
  - `PublishInput`, `ScheduleInput`
  - `Section`, `CreateSectionInput`
- [x] Export all types from `lib/index.ts`
- [x] Verify: `npm run typecheck` passes

**Acceptance:** Types compile cleanly, are exported, and match the design.md interfaces. ✅

## T3 — Error Classes ✅

Implement typed error hierarchy.

- [x] `lib/errors.ts`:
  - `SubstackError` (base, with statusCode + endpoint + responseBody)
  - `SubstackAuthError` (401/403)
  - `SubstackRateLimitError` (429, with optional retryAfter)
  - `SubstackNotFoundError` (404)
- [x] Export from `lib/index.ts`
- [x] Unit tests: error construction, instanceof checks, message formatting

**Acceptance:** Each error class carries statusCode, endpoint, name. Tests pass. ✅

## T4 — HttpClient ✅

Internal fetch wrapper with auth, retry, and rate limiting.

- [x] `lib/http.ts` — `HttpClient` class:
  - Constructor: accepts `SubstackClientOptions`, resolves base URL
  - Methods: `get(path, params?)`, `post(path, body?)`, `put(path, body?)`, `delete(path)`
  - Cookie injection (`substack.sid`, optionally `connect.sid`)
  - User-Agent header
  - JSON parsing with error handling
  - Timeout via `AbortController`
- [x] Retry logic:
  - Retryable: 408, 429, 500, 502, 503, 504
  - Non-retryable: 400, 401, 403, 404, 422
  - Exponential backoff with jitter (1s base, 2x, max 30s)
  - Configurable max attempts (default 3)
  - 429: respect `Retry-After` header
- [x] Error mapping:
  - 401/403 → `SubstackAuthError`
  - 404 → `SubstackNotFoundError`
  - 429 → `SubstackRateLimitError`
  - Other 4xx/5xx → `SubstackError`
- [x] Unit tests with msw mocking all error scenarios + retry behavior

**Acceptance:** HttpClient retries correctly, throws typed errors, respects timeouts. Full test coverage on error paths. ✅

## T5 — Draft Operations ✅

Implement draft CRUD against Substack API.

- [x] `lib/drafts.ts` — functions or class:
  - `createDraft(http, input)` → POST /api/v1/drafts
  - `updateDraft(http, id, input)` → PUT /api/v1/drafts/{id}
    - Handle byline injection (fetch draft first to get bylines if needed)
  - `getDraft(http, id)` → GET /api/v1/drafts/{id}
  - `listDrafts(http, opts?)` → GET /api/v1/drafts (with offset/limit)
  - `deleteDraft(http, id)` → DELETE /api/v1/drafts/{id}
- [x] Map Substack's snake_case response → our camelCase `Draft` type
- [x] Handle the `draft_bylines` quirk in update
- [x] Unit tests with msw for each operation (happy path + error)

**Acceptance:** All 5 CRUD operations work against mocked API. Response mapping is correct. ✅

## T6 — Publish Operations ✅

Implement publish, schedule, unpublish.

- [x] `lib/publish.ts`:
  - `publish(http, id, input?)` → POST /api/v1/drafts/{id}/publish
  - `schedule(http, id, input)` → POST /api/v1/drafts/{id}/publish (with post_date)
  - `unpublish(http, id)` → POST /api/v1/drafts/{id}/unpublish
- [x] Handle the publish payload quirks (may need to include draft title/body)
- [x] Unit tests for each operation

**Acceptance:** Publish and schedule work against mocked API. Unpublish endpoint confirmed or documented as blocked. ✅

## T7 — Section Operations ✅

Implement section CRUD.

- [x] `lib/sections.ts`:
  - `listSections(http)` → GET /api/v1/sections
  - `createSection(http, input)` → POST /api/v1/sections
  - `deleteSection(http, id)` → DELETE /api/v1/sections/{id}
- [x] Map response to `Section` type
- [x] Unit tests

**Acceptance:** Section CRUD works against mocked API. Section ID usable in `updateDraft`. ✅

## T8 — SubstackClient Facade ✅

Wire everything together in the public API.

- [x] `lib/client.ts` — `SubstackClient` class:
  - Constructor: creates internal `HttpClient`
  - Expose all methods: `createDraft`, `updateDraft`, `getDraft`, `listDrafts`, `deleteDraft`, `publish`, `schedule`, `unpublish`, `listSections`, `createSection`, `deleteSection`
  - Each method delegates to the respective module function
- [x] `lib/index.ts` — Public barrel:
  - Export `SubstackClient`
  - Export all types
  - Export error classes
- [x] Verify the public API matches the README's "Planned API" section

**Acceptance:** A user can `import { SubstackClient } from '@zweer/substack-client'` and access all operations. API matches the documented surface. ✅

## T9 — Integration Tests ✅

End-to-end tests with comprehensive msw mocking.

- [x] Full flow: create draft → update with body → publish
- [x] Full flow: create draft → schedule for future
- [x] Section flow: list → create → assign to draft → delete
- [x] Auth failure: expired cookie → SubstackAuthError
- [x] Retry flow: 503 → 503 → 200 (success on third attempt)
- [x] Rate limit: 429 with Retry-After → wait → retry → success
- [x] Not found: get non-existent draft → SubstackNotFoundError

**Acceptance:** All integration tests pass. No real HTTP calls made. Covers the 5 user stories from requirements.md. ✅
