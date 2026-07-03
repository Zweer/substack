import type { HttpClient } from './http.js';
import type { CreateDraftInput, Draft, ListDraftsOptions, UpdateDraftInput } from './types.js';

interface RawDraft {
  id: number;
  title: string;
  draft_subtitle: string | null;
  slug: string;
  audience: string;
  draft_section_id: number | null;
  draft_created_at: string;
  draft_body?: string;
  draft_bylines?: RawByline[];
}

interface RawByline {
  id: number;
  is_guest: boolean;
}

export async function createDraft(http: HttpClient, input: CreateDraftInput): Promise<Draft> {
  const payload: Record<string, unknown> = {
    title: input.title,
    type: 'newsletter',
  };

  if (input.subtitle) {
    payload.draft_subtitle = input.subtitle;
  }

  if (input.sectionId) {
    payload.draft_section_id = input.sectionId;
  }

  const raw = await http.post<RawDraft>('drafts', payload);

  return mapDraft(raw);
}

export async function updateDraft(
  http: HttpClient,
  id: number,
  input: UpdateDraftInput,
): Promise<Draft> {
  const bylines = await fetchBylines(http, id);

  const payload: Record<string, unknown> = {
    draft_bylines: bylines,
  };

  if (input.title !== undefined) {
    payload.draft_title = input.title;
  }

  if (input.subtitle !== undefined) {
    payload.draft_subtitle = input.subtitle;
  }

  if (input.body !== undefined) {
    payload.draft_body = input.body;
  }

  if (input.sectionId !== undefined) {
    payload.draft_section_id = input.sectionId;
  }

  if (input.audience !== undefined) {
    payload.audience = input.audience;
  }

  if (input.socialTitle !== undefined) {
    payload.social_title = input.socialTitle;
  }

  if (input.description !== undefined) {
    payload.description = input.description;
  }

  const raw = await http.put<RawDraft>(`drafts/${id}`, payload);

  return mapDraft(raw);
}

export async function getDraft(http: HttpClient, id: number): Promise<Draft> {
  const raw = await http.get<RawDraft>(`drafts/${id}`);

  return mapDraft(raw);
}

export async function listDrafts(http: HttpClient, options?: ListDraftsOptions): Promise<Draft[]> {
  const params: Record<string, string> = {};

  if (options?.offset !== undefined) {
    params.offset = String(options.offset);
  }

  if (options?.limit !== undefined) {
    params.limit = String(options.limit);
  }

  const raw = await http.get<RawDraft[]>('drafts', params);

  return raw.map(mapDraft);
}

export async function deleteDraft(http: HttpClient, id: number): Promise<void> {
  await http.delete(`drafts/${id}`);
}

// --- Helpers ---

async function fetchBylines(http: HttpClient, draftId: number): Promise<RawByline[]> {
  const raw = await http.get<RawDraft>(`drafts/${draftId}`);

  if (raw.draft_bylines && raw.draft_bylines.length > 0) {
    return raw.draft_bylines;
  }

  // Fallback: use draft author id if bylines are empty
  return [{ id: (raw as unknown as { user_id: number }).user_id ?? 0, is_guest: false }];
}

function mapDraft(raw: RawDraft): Draft {
  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.draft_subtitle,
    slug: raw.slug,
    audience: raw.audience as Draft['audience'],
    sectionId: raw.draft_section_id,
    draftCreatedAt: raw.draft_created_at,
    body: raw.draft_body,
  };
}
