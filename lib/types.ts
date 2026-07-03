/**
 * Client configuration options.
 */
export interface SubstackClientOptions {
  /** Publication URL: "yourname.substack.com" or "https://yourname.substack.com" */
  publication: string;
  /** substack.sid session cookie value */
  sid: string;
  /** connect.sid session cookie value (optional, may be needed for some operations) */
  connectSid?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
  /** Max retry attempts for transient failures (default: 3) */
  maxRetries?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

// --- Drafts ---

export type Audience = 'everyone' | 'only_paid' | 'founding';

export interface CreateDraftInput {
  title: string;
  subtitle?: string;
  sectionId?: number;
}

export interface UpdateDraftInput {
  /** ProseMirror document JSON (stringified) */
  body?: string;
  title?: string;
  subtitle?: string;
  sectionId?: number;
  audience?: Audience;
  socialTitle?: string;
  description?: string;
}

export interface Draft {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  audience: Audience;
  sectionId: number | null;
  draftCreatedAt: string;
  /** Full draft body (ProseMirror JSON string) — only on getDraft, not listDrafts */
  body?: string;
}

export interface ListDraftsOptions {
  offset?: number;
  limit?: number;
}

// --- Publish ---

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

// --- Sections ---

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
