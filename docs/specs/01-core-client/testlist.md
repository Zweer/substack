# Core Client — Test List

## Unit Tests

| # | Test | Story | Status |
|---|------|-------|--------|
| U1 | SubstackError carries statusCode, endpoint, name | US-4 | ✅ |
| U2 | SubstackAuthError has statusCode 401 and correct name | US-4 | ✅ |
| U3 | SubstackRateLimitError carries retryAfter value | US-5 | ✅ |
| U4 | HttpClient resolves base URL from bare domain | — | ✅ |
| U5 | HttpClient resolves base URL from full https:// URL | — | ✅ |
| U6 | HttpClient injects substack.sid cookie in all requests | US-4 | ✅ |
| U7 | HttpClient injects connect.sid when provided | US-4 | ✅ |
| U8 | HttpClient throws SubstackAuthError on 401 | US-4 | ✅ |
| U9 | HttpClient throws SubstackAuthError on 403 | US-4 | ✅ |
| U10 | HttpClient throws SubstackNotFoundError on 404 | — | ✅ |
| U11 | HttpClient throws SubstackRateLimitError on 429 | US-5 | ✅ |
| U12 | HttpClient retries on 503, succeeds on second attempt | US-5 | ✅ |
| U13 | HttpClient retries with exponential backoff timing | US-5 | ✅ |
| U14 | HttpClient gives up after maxRetries attempts | US-5 | ✅ |
| U15 | HttpClient does NOT retry on 400 | US-5 | ✅ |
| U16 | HttpClient respects Retry-After header on 429 | US-5 | ✅ |
| U17 | HttpClient throws on timeout (AbortController) | US-5 | ✅ |
| U18 | createDraft sends correct POST payload | US-1 | ✅ |
| U19 | createDraft returns mapped Draft object | US-1 | ✅ |
| U20 | updateDraft sends body + bylines in PUT payload | US-1 | ✅ |
| U21 | updateDraft maps sectionId to draft_section_id | US-3 | ✅ |
| U22 | getDraft returns full Draft with body | US-1 | ✅ |
| U23 | listDrafts returns array of Draft objects | — | ✅ |
| U24 | listDrafts supports offset/limit pagination | — | ✅ |
| U25 | deleteDraft sends DELETE request | — | ✅ |
| U26 | publish sends correct POST payload | US-1 | ✅ |
| U27 | publish includes send:true by default | US-1 | ✅ |
| U28 | schedule sends payload with post_date | US-2 | ✅ |
| U29 | schedule validates date is in the future | US-2 | ⬜ |
| U30 | unpublish reverts post to draft state | — | ✅ |
| U31 | listSections returns array of Section objects | US-3 | ✅ |
| U32 | createSection sends correct POST payload | US-3 | ✅ |
| U33 | deleteSection sends DELETE request | US-3 | ✅ |

## Integration Tests

| # | Test | Story | Status |
|---|------|-------|--------|
| I1 | Full flow: createDraft → updateDraft → publish | US-1 | ✅ |
| I2 | Full flow: createDraft → updateDraft → schedule | US-2 | ✅ |
| I3 | Section flow: listSections → createSection → assign to draft | US-3 | ✅ |
| I4 | Auth failure: expired cookie → SubstackAuthError thrown | US-4 | ✅ |
| I5 | Retry flow: 503 → 503 → 200 (succeeds on third try) | US-5 | ✅ |
| I6 | Rate limit: 429 + Retry-After → waits → retries → success | US-5 | ✅ |
| I7 | Not found: getDraft(999999) → SubstackNotFoundError | — | ✅ |
| I8 | Delete flow: createDraft → deleteDraft → getDraft returns 404 | — | ⬜ |
| I9 | Unpublish flow: publish → unpublish → draft state restored | — | ⬜ |

## Notes

- All tests use `msw` for HTTP mocking — zero real API calls
- Fixtures in `test/fixtures/` contain real Substack response shapes
- Status: ⬜ = pending, ✅ = passing, ❌ = failing
