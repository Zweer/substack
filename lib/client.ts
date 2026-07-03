import { createDraft, deleteDraft, getDraft, listDrafts, updateDraft } from './drafts.js';
import { HttpClient } from './http.js';
import { publish, schedule, unpublish } from './publish.js';
import { createSection, deleteSection, listSections } from './sections.js';
import type {
  CreateDraftInput,
  CreateSectionInput,
  Draft,
  ListDraftsOptions,
  PublishInput,
  ScheduleInput,
  Section,
  SubstackClientOptions,
  UpdateDraftInput,
} from './types.js';

/**
 * Main client for interacting with Substack's internal API.
 *
 * @example
 * ```typescript
 * const client = new SubstackClient({
 *   publication: 'yourname.substack.com',
 *   sid: process.env.SUBSTACK_SID,
 * });
 *
 * const draft = await client.createDraft({ title: 'Hello' });
 * await client.updateDraft(draft.id, { body: proseMirrorJson });
 * await client.publish(draft.id);
 * ```
 */
export class SubstackClient {
  private readonly http: HttpClient;

  constructor(options: SubstackClientOptions) {
    this.http = new HttpClient(options);
  }

  // --- Drafts ---

  async createDraft(input: CreateDraftInput): Promise<Draft> {
    return createDraft(this.http, input);
  }

  async updateDraft(id: number, input: UpdateDraftInput): Promise<Draft> {
    return updateDraft(this.http, id, input);
  }

  async getDraft(id: number): Promise<Draft> {
    return getDraft(this.http, id);
  }

  async listDrafts(options?: ListDraftsOptions): Promise<Draft[]> {
    return listDrafts(this.http, options);
  }

  async deleteDraft(id: number): Promise<void> {
    return deleteDraft(this.http, id);
  }

  // --- Publish ---

  async publish(id: number, input?: PublishInput): Promise<void> {
    return publish(this.http, id, input);
  }

  async schedule(id: number, input: ScheduleInput): Promise<void> {
    return schedule(this.http, id, input);
  }

  async unpublish(id: number): Promise<void> {
    return unpublish(this.http, id);
  }

  // --- Sections ---

  async listSections(): Promise<Section[]> {
    return listSections(this.http);
  }

  async createSection(input: CreateSectionInput): Promise<Section> {
    return createSection(this.http, input);
  }

  async deleteSection(id: number): Promise<void> {
    return deleteSection(this.http, id);
  }
}
