import type { HttpClient } from './http.js';
import type { PublishInput, ScheduleInput } from './types.js';

interface PublishResponse {
  id: number;
  post_date: string;
  audience: string;
}

export async function publish(http: HttpClient, id: number, input?: PublishInput): Promise<void> {
  const payload: Record<string, unknown> = {
    send: input?.send ?? true,
  };

  if (input?.audience) {
    payload.audience = input.audience;
  }

  await http.post<PublishResponse>(`drafts/${id}/publish`, payload);
}

export async function schedule(http: HttpClient, id: number, input: ScheduleInput): Promise<void> {
  const payload: Record<string, unknown> = {
    send: input.send ?? true,
    post_date: input.date,
  };

  if (input.audience) {
    payload.audience = input.audience;
  }

  await http.post<PublishResponse>(`drafts/${id}/publish`, payload);
}

export async function unpublish(http: HttpClient, id: number): Promise<void> {
  await http.post(`drafts/${id}/unpublish`, {});
}
