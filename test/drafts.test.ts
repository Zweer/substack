import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createDraft, deleteDraft, getDraft, listDrafts, updateDraft } from '../lib/drafts.js';
import { HttpClient } from '../lib/http.js';

const BASE_URL = 'https://test.substack.com';
const API = `${BASE_URL}/api/v1`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createHttpClient(): HttpClient {
  return new HttpClient({ publication: BASE_URL, sid: 'test-sid' });
}

const RAW_DRAFT = {
  id: 123,
  title: 'Test Post',
  draft_subtitle: 'A subtitle',
  slug: 'test-post',
  audience: 'everyone',
  draft_section_id: 42,
  draft_created_at: '2026-07-01T10:00:00Z',
  draft_body: '{"type":"doc","content":[]}',
  draft_bylines: [{ id: 999, is_guest: false }],
};

describe('createDraft', () => {
  it('should send correct POST payload and return mapped Draft', async () => {
    server.use(
      http.post(`${API}/drafts`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.title).toBe('My Post');
        expect(body.type).toBe('newsletter');
        expect(body.draft_subtitle).toBe('A subtitle');
        expect(body.draft_section_id).toBe(7);
        return HttpResponse.json(RAW_DRAFT);
      }),
    );

    const http_ = createHttpClient();
    const draft = await createDraft(http_, {
      title: 'My Post',
      subtitle: 'A subtitle',
      sectionId: 7,
    });

    expect(draft.id).toBe(123);
    expect(draft.title).toBe('Test Post');
    expect(draft.subtitle).toBe('A subtitle');
    expect(draft.sectionId).toBe(42);
    expect(draft.audience).toBe('everyone');
  });

  it('should omit optional fields when not provided', async () => {
    server.use(
      http.post(`${API}/drafts`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.title).toBe('Minimal');
        expect(body.type).toBe('newsletter');
        expect(body).not.toHaveProperty('draft_subtitle');
        expect(body).not.toHaveProperty('draft_section_id');
        return HttpResponse.json(RAW_DRAFT);
      }),
    );

    const http_ = createHttpClient();
    await createDraft(http_, { title: 'Minimal' });
  });
});

describe('updateDraft', () => {
  it('should fetch bylines and include them in PUT payload', async () => {
    server.use(
      http.get(`${API}/drafts/123`, () => HttpResponse.json(RAW_DRAFT)),
      http.put(`${API}/drafts/123`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.draft_bylines).toEqual([{ id: 999, is_guest: false }]);
        expect(body.draft_body).toBe('{"type":"doc","content":[{"type":"paragraph"}]}');
        expect(body.draft_section_id).toBe(10);
        return HttpResponse.json(RAW_DRAFT);
      }),
    );

    const http_ = createHttpClient();
    await updateDraft(http_, 123, {
      body: '{"type":"doc","content":[{"type":"paragraph"}]}',
      sectionId: 10,
    });
  });

  it('should map sectionId to draft_section_id', async () => {
    server.use(
      http.get(`${API}/drafts/123`, () => HttpResponse.json(RAW_DRAFT)),
      http.put(`${API}/drafts/123`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.draft_section_id).toBe(55);
        return HttpResponse.json(RAW_DRAFT);
      }),
    );

    const http_ = createHttpClient();
    await updateDraft(http_, 123, { sectionId: 55 });
  });
});

describe('getDraft', () => {
  it('should return full Draft with body', async () => {
    server.use(http.get(`${API}/drafts/123`, () => HttpResponse.json(RAW_DRAFT)));

    const http_ = createHttpClient();
    const draft = await getDraft(http_, 123);

    expect(draft.id).toBe(123);
    expect(draft.title).toBe('Test Post');
    expect(draft.subtitle).toBe('A subtitle');
    expect(draft.slug).toBe('test-post');
    expect(draft.audience).toBe('everyone');
    expect(draft.sectionId).toBe(42);
    expect(draft.draftCreatedAt).toBe('2026-07-01T10:00:00Z');
    expect(draft.body).toBe('{"type":"doc","content":[]}');
  });
});

describe('listDrafts', () => {
  it('should return array of Draft objects', async () => {
    server.use(
      http.get(`${API}/drafts`, () => HttpResponse.json([RAW_DRAFT, { ...RAW_DRAFT, id: 456 }])),
    );

    const http_ = createHttpClient();
    const drafts = await listDrafts(http_);

    expect(drafts).toHaveLength(2);
    expect(drafts[0].id).toBe(123);
    expect(drafts[1].id).toBe(456);
  });

  it('should pass offset and limit as query params', async () => {
    server.use(
      http.get(`${API}/drafts`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('offset')).toBe('10');
        expect(url.searchParams.get('limit')).toBe('5');
        return HttpResponse.json([]);
      }),
    );

    const http_ = createHttpClient();
    await listDrafts(http_, { offset: 10, limit: 5 });
  });
});

describe('deleteDraft', () => {
  it('should send DELETE request', async () => {
    let called = false;

    server.use(
      http.delete(`${API}/drafts/123`, () => {
        called = true;
        return HttpResponse.json({});
      }),
    );

    const http_ = createHttpClient();
    await deleteDraft(http_, 123);

    expect(called).toBe(true);
  });
});
