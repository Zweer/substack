import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { HttpClient } from '../lib/http.js';
import { createSection, deleteSection, listSections } from '../lib/sections.js';

const BASE_URL = 'https://test.substack.com';
const API = `${BASE_URL}/api/v1`;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createHttpClient(): HttpClient {
  return new HttpClient({ publication: BASE_URL, sid: 'test-sid' });
}

const RAW_SECTION = {
  id: 42,
  name: 'Fiction',
  slug: 'fiction',
  description: 'Short stories and novels',
};

describe('listSections', () => {
  it('should return array of Section objects', async () => {
    server.use(
      http.get(`${API}/sections`, () =>
        HttpResponse.json([
          RAW_SECTION,
          { ...RAW_SECTION, id: 43, name: 'Essays', slug: 'essays' },
        ]),
      ),
    );

    const http_ = createHttpClient();
    const sections = await listSections(http_);

    expect(sections).toHaveLength(2);
    expect(sections[0].id).toBe(42);
    expect(sections[0].name).toBe('Fiction');
    expect(sections[0].slug).toBe('fiction');
    expect(sections[0].description).toBe('Short stories and novels');
    expect(sections[1].id).toBe(43);
  });
});

describe('createSection', () => {
  it('should send correct POST payload', async () => {
    server.use(
      http.post(`${API}/sections`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.name).toBe('New Arc');
        expect(body.description).toBe('A new story arc');
        return HttpResponse.json(RAW_SECTION);
      }),
    );

    const http_ = createHttpClient();
    const section = await createSection(http_, { name: 'New Arc', description: 'A new story arc' });

    expect(section.id).toBe(42);
    expect(section.name).toBe('Fiction');
  });

  it('should omit description when not provided', async () => {
    server.use(
      http.post(`${API}/sections`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.name).toBe('Minimal');
        expect(body).not.toHaveProperty('description');
        return HttpResponse.json(RAW_SECTION);
      }),
    );

    const http_ = createHttpClient();
    await createSection(http_, { name: 'Minimal' });
  });
});

describe('deleteSection', () => {
  it('should send DELETE request', async () => {
    let called = false;

    server.use(
      http.delete(`${API}/sections/42`, () => {
        called = true;
        return HttpResponse.json({});
      }),
    );

    const http_ = createHttpClient();
    await deleteSection(http_, 42);

    expect(called).toBe(true);
  });
});
