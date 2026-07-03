# Core Client — Requirements

## Goal

Provide a TypeScript client that can create, update, publish, schedule, unpublish, and delete posts on Substack programmatically. This is Phase 1 — the foundational layer that all subsequent features (markdown transform, notes, read operations) build upon.

## Core Flow

```
User creates SubstackClient with publication URL + session cookie(s)
  → Client validates session (optional, can be lazy)
  → User calls createDraft({ title, subtitle? })
  → Client POSTs to /api/v1/drafts → gets draft shell with ID
  → User calls updateDraft(id, { body, section?, audience? })
  → Client PUTs to /api/v1/drafts/{id} with ProseMirror body
  → User calls publish(id) or schedule(id, date)
  → Client POSTs to /api/v1/drafts/{id}/publish
  → Post is live on Substack
```

## Features

### 1. Authentication
- Accept `substack.sid` cookie (required)
- Accept `connect.sid` cookie (optional, may be needed for some operations)
- Inject cookies into all requests
- Detect expired/invalid session (401 response)
- No programmatic login (captcha blocks it — documented limitation)

### 2. Draft CRUD

#### Create Draft
- Create a new draft with title (required) and subtitle (optional)
- Returns draft ID and metadata
- Draft starts as empty shell (body added via update)

#### Update Draft
- Set body content (ProseMirror JSON, stringified)
- Set section (`draft_section_id`)
- Set audience (`everyone` | `only_paid` | `founding`)
- Set subtitle, social title, description
- Must include `draft_bylines` in payload (Substack quirk)

#### Get Draft
- Fetch a single draft by ID
- Returns full metadata + body

#### List Drafts
- List all drafts for the publication
- Supports pagination (offset/limit)

#### Delete Draft
- Delete a draft by ID
- Irreversible

### 3. Publish / Schedule / Unpublish

#### Publish
- Publish a draft immediately
- Option to send as email to subscribers (`send: true`)
- Set audience at publish time

#### Schedule
- Schedule a draft for future publication
- Provide ISO 8601 datetime
- Set audience at schedule time

#### Unpublish
- Revert a published post back to draft state

### 4. Section Management

#### List Sections
- Get all sections for the publication

#### Create Section
- Create a new section with name and optional description

#### Delete Section
- Delete a section by ID

### 5. HTTP Layer
- Native `fetch` (Node.js 22+)
- Automatic retry with exponential backoff (429, 500, 502, 503, 504)
- Rate limiting (respect Substack's limits)
- Configurable timeout (default 30s)
- Request/response logging (optional, for debugging)

## User Stories

### US-1: Create and publish a post
**As a** developer automating Substack publishing
**I want** to create a draft and publish it in two calls
**So that** I can publish content without using the web editor

**Acceptance Criteria:**
- [ ] `createDraft({ title })` returns a draft with numeric ID
- [ ] `updateDraft(id, { body })` sets ProseMirror body content
- [ ] `publish(id)` makes the post live
- [ ] Published post is visible on the Substack publication

### US-2: Schedule a post
**As a** developer with a content calendar
**I want** to schedule posts for specific dates/times
**So that** content goes live at optimal times

**Acceptance Criteria:**
- [ ] `schedule(id, { date })` accepts ISO 8601 datetime
- [ ] Post appears as "scheduled" in Substack dashboard
- [ ] Post goes live at the specified time

### US-3: Manage sections
**As a** developer with multiple content series
**I want** to create sections and assign posts to them
**So that** my publication is organized by topic

**Acceptance Criteria:**
- [ ] `listSections()` returns all sections with IDs
- [ ] `createSection({ name })` creates a new section
- [ ] Draft can be assigned to a section via `updateDraft(id, { sectionId })`

### US-4: Handle auth errors gracefully
**As a** developer
**I want** clear error messages when my session expires
**So that** I know to refresh my cookie

**Acceptance Criteria:**
- [ ] 401 response throws `SubstackAuthError` with clear message
- [ ] Error includes the endpoint that failed
- [ ] User can catch the error and handle re-auth

### US-5: Retry transient failures
**As a** developer running automation scripts
**I want** the client to handle transient failures automatically
**So that** occasional 503s don't break my publish flow

**Acceptance Criteria:**
- [ ] 429/500/502/503/504 trigger automatic retry
- [ ] Exponential backoff between retries (min 1s, max 30s)
- [ ] Maximum 3 retry attempts before throwing
- [ ] Non-retryable errors (400, 401, 403, 404) throw immediately

## Success Criteria

- Client can create → update → publish a draft end-to-end
- Client can schedule a draft for future publication
- Client can unpublish and delete posts
- Section CRUD works (list, create, delete, assign to draft)
- Auth errors are clear and typed
- Retry logic handles transient failures transparently
- Zero runtime dependencies beyond Node.js built-ins

## Non-Goals (for this spec)

- Markdown → ProseMirror transform (spec 02)
- Image upload (spec 02)
- Paywall node injection (spec 02)
- Notes CRUD (spec 03)
- Read operations — listing published posts, profiles (spec 03)
- Programmatic login (captcha blocks it — documented limitation)
