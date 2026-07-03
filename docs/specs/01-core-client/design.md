# Core Client — Design

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Code                          │
│                                                     │
│  const client = new SubstackClient({ ... })         │
│  const draft = await client.createDraft({ ... })    │
│  await client.publish(draft.id)                     │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│              SubstackClient (facade)                  │
│                                                      │
│  - createDraft()    - getDraft()    - deleteDraft()  │
│  - updateDraft()    - listDrafts()                   │
│  - publish()        - schedule()    - unpublish()    │
│  - listSections()   - createSection() - deleteSection│
└───────────────────────┬──────────────────────────────┘
                        │ delegates to
┌───────────────────────▼──────────────────────────────┐
│              HttpClient (internal)                     │
│                                                       │
│  - get(path, params?)                                 │
│  - post(path, body?)                                  │
│  - put(path, body?)                                   │
│  - delete(path)                                       │
│                                                       │
│  Handles: cookies, headers, retry, rate limit, errors │
└───────────────────────┬───────────────────────────────┘
                        │ native fetch
┌───────────────────────▼───────────────────────────────┐
│          Substack API (internal, undocumented)         │
│                                                       │
│  POST   {pub}/api/v1/drafts                           │
│  PUT    {pub}/api/v1/drafts/{id}                      │
│  GET    {pub}/api/v1/drafts/{id}                      │
│  GET    {pub}/api/v1/drafts                           │
│  DELETE {pub}/api/v1/drafts/{id}                      │
│  POST   {pub}/api/v1/drafts/{id}/publish              │
│  PATCH  {pub}/api/v1/drafts/{id}/unpublish (TBD)     │
│  GET    {pub}/api/v1/sections                         │
│  POST   {pub}/api/v1/sections                         │
│  DELETE {pub}/api/v1/sections/{id}                     │
└───────────────────────────────────────────────────────┘
```

## File Structure

```
lib/
├── index.ts              # Public barrel: export { SubstackClient } + types
├── client.ts             # SubstackClient class (facade)
├── http.ts               # HttpClient (fetch wrapper with retry/auth)
├── drafts.ts             # Draft operations (create, update, get, list, delete)
├── publish.ts            # Publish, schedule, unpublish
├── sections.ts           # Section CRUD
├── errors.ts             # Error classes
└── types.ts              # All type definitions
```

## Type Definitions

### Client Options

```typescript
export interface SubstackClientOptions {
  /** Publication URL: "yourname.substack.com" or custom domain */
  publication: string;
  /** substack.sid session cookie value */
  sid: string;
  /** connect.sid session cookie value (optional, may be needed for some ops) */
  connectSid?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Max retry attempts for transient failures (default: 3) */
  maxRetries?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

### Draft Types

```typescript
export interface CreateDraftInput {
  title: string;
  subtitle?: string;
  /** Assign to a section at creation time */
  sectionId?: number;
}

export interface UpdateDraftInput {
  /** ProseMirror document JSON (stringified) */
  body?: string;
  title?: string;
  subtitle?: string;
  /** Numeric section ID */
  sectionId?: number;
  /** Post audience */
  audience?: Audience;
  /** Social title (for sharing) */
  socialTitle?: string;
  /** Meta description */
  description?: string;
}

export type Audience = 'everyone' | 'only_paid' | 'founding';

export interface Draft {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  audience: Audience;
  sectionId: number | null;
  draftCreatedAt: string;
  /** True if body has been set */
  hasBody: boolean;
  /** Full draft body (ProseMirror JSON) — only present on getDraft, not listDrafts */
  body?: string;
}
```

### Publish Types

```typescript
export interface PublishInput {
  /** Send as email to subscribers (default: true) */
  send?: boolean;
  /** Override audience at publish time */
  audience?: Audience;
}

export interface ScheduleInput {
  /** ISO 8601 datetime for scheduled publication */
  date: string;
  /** Send as email to subscribers (default: true) */
  send?: boolean;
  /** Override audience at schedule time */
  audience?: Audience;
}
```

### Section Types

```typescript
export interface Section {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface CreateSectionInput {
  name: string;
  description?: string;
}
```

### Error Types

```typescript
export class SubstackError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = 'SubstackError';
  }
}

export class SubstackAuthError extends SubstackError {
  constructor(endpoint: string, responseBody?: unknown) {
    super('Invalid or expired session cookie', 401, endpoint, responseBody);
    this.name = 'SubstackAuthError';
  }
}

export class SubstackRateLimitError extends SubstackError {
  constructor(
    endpoint: string,
    public readonly retryAfter?: number,
  ) {
    super('Rate limited by Substack', 429, endpoint);
    this.name = 'SubstackRateLimitError';
  }
}
```

## HttpClient Design

### Cookie Injection
```typescript
// All requests include:
headers: {
  'Cookie': `substack.sid=${sid}; connect.sid=${connectSid}`,
  'Content-Type': 'application/json',
  'User-Agent': 'substack-client/1.0.0',
}
```

### Retry Strategy
- **Retryable status codes:** 408, 429, 500, 502, 503, 504
- **Non-retryable:** 400, 401, 403, 404, 422
- **Backoff:** exponential (1s, 2s, 4s) with jitter
- **Max attempts:** configurable, default 3
- **429 handling:** respect `Retry-After` header if present

### Rate Limiting
- Built-in delay between requests (configurable, default ~500ms)
- Respect 429 response and back off

### Base URL Resolution
```typescript
// Input: "yourname.substack.com" or "https://yourname.substack.com"
// Resolved: "https://yourname.substack.com"
// All API calls: `${baseUrl}/api/v1/${path}`
```

## API Payload Quirks (handled internally)

### Draft Creation (POST /api/v1/drafts)
```json
{
  "title": "My Post",
  "draft_subtitle": "A subtitle",
  "draft_section_id": 12345,
  "type": "newsletter"
}
```
Returns: draft object with `id`.

### Draft Update (PUT /api/v1/drafts/{id})
```json
{
  "draft_title": "My Post",
  "draft_subtitle": "A subtitle",
  "draft_body": "{\"type\":\"doc\",\"content\":[...]}",
  "draft_bylines": [{"id": <user_id>, "is_guest": false}],
  "draft_section_id": 12345,
  "audience": "everyone"
}
```
**Key quirk:** `draft_bylines` must be included even though GET returns null. We'll fetch the user ID from the draft metadata or a `/me` endpoint.

### Publish (POST /api/v1/drafts/{id}/publish)
```json
{
  "send": true,
  "audience": "everyone",
  "draft_title": "My Post",
  "draft_subtitle": "A subtitle",
  "draft_body": "{...}"
}
```

### Schedule (same endpoint, with date)
```json
{
  "send": true,
  "audience": "everyone",
  "post_date": "2026-09-01T09:00:00.000Z"
}
```

## Data Flow: Create → Publish

```
1. createDraft({ title: "Hello" })
   → POST /api/v1/drafts { title: "Hello", type: "newsletter" }
   ← { id: 123456, ... }

2. updateDraft(123456, { body: proseMirrorJson })
   → Need user_id for bylines
   → GET /api/v1/drafts/123456 (extract byline info)
   → PUT /api/v1/drafts/123456 { draft_body: "...", draft_bylines: [...] }
   ← { id: 123456, ... }

3. publish(123456, { send: true })
   → POST /api/v1/drafts/123456/publish { send: true }
   ← { id: 123456, post_date: "...", ... }
```

## Open Questions

- [ ] Exact unpublish endpoint — might be PUT with `{ draft_is_published: false }` or PATCH
- [ ] Whether `connect.sid` is needed for draft operations (vs only notes)
- [ ] Byline injection: can we get user_id from the draft response or need a separate call?
- [ ] Section assignment: numeric `draft_section_id` only, or also UUID tags?
- [ ] Rate limit thresholds (how aggressive can we be?)

These will be resolved during implementation via browser DevTools observation.
