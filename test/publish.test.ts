import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { HttpClient } from '../lib/http.js';
import { publish, schedule, unpublish } from '../lib/publish.js';

const BASE_URL = 'https://test.substack.com';
const API = `${BASE_URL}/api/v1`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createHttpClient(): HttpClient {
  return new HttpClient({ publication: BASE_URL, sid: 'test-sid' });
}

describe('publish', () => {
  it('should send correct POST payload with send:true by default', async () => {
    server.use(
      http.post(`${API}/drafts/123/publish`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.send).toBe(true);
        return HttpResponse.json({
          id: 123,
          post_date: '2026-07-03T10:00:00Z',
          audience: 'everyone',
        });
      }),
    );

    const http_ = createHttpClient();
    await publish(http_, 123);
  });

  it('should pass audience when provided', async () => {
    server.use(
      http.post(`${API}/drafts/123/publish`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.audience).toBe('only_paid');
        expect(body.send).toBe(false);
        return HttpResponse.json({
          id: 123,
          post_date: '2026-07-03T10:00:00Z',
          audience: 'only_paid',
        });
      }),
    );

    const http_ = createHttpClient();
    await publish(http_, 123, { audience: 'only_paid', send: false });
  });
});

describe('schedule', () => {
  it('should send payload with post_date', async () => {
    server.use(
      http.post(`${API}/drafts/456/publish`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.post_date).toBe('2026-09-01T09:00:00Z');
        expect(body.send).toBe(true);
        return HttpResponse.json({
          id: 456,
          post_date: '2026-09-01T09:00:00Z',
          audience: 'everyone',
        });
      }),
    );

    const http_ = createHttpClient();
    await schedule(http_, 456, { date: '2026-09-01T09:00:00Z' });
  });

  it('should pass audience when provided', async () => {
    server.use(
      http.post(`${API}/drafts/456/publish`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.audience).toBe('founding');
        expect(body.post_date).toBe('2026-09-01T09:00:00Z');
        return HttpResponse.json({
          id: 456,
          post_date: '2026-09-01T09:00:00Z',
          audience: 'founding',
        });
      }),
    );

    const http_ = createHttpClient();
    await schedule(http_, 456, { date: '2026-09-01T09:00:00Z', audience: 'founding' });
  });
});

describe('unpublish', () => {
  it('should send POST to unpublish endpoint', async () => {
    let called = false;

    server.use(
      http.post(`${API}/drafts/123/unpublish`, () => {
        called = true;
        return HttpResponse.json({});
      }),
    );

    const http_ = createHttpClient();
    await unpublish(http_, 123);

    expect(called).toBe(true);
  });
});
