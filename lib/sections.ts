import type { HttpClient } from './http.js';
import type { CreateSectionInput, Section } from './types.js';

interface RawSection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export async function listSections(http: HttpClient): Promise<Section[]> {
  const raw = await http.get<RawSection[]>('sections');

  return raw.map(mapSection);
}

export async function createSection(http: HttpClient, input: CreateSectionInput): Promise<Section> {
  const payload: Record<string, unknown> = {
    name: input.name,
  };

  if (input.description) {
    payload.description = input.description;
  }

  const raw = await http.post<RawSection>('sections', payload);

  return mapSection(raw);
}

export async function deleteSection(http: HttpClient, id: number): Promise<void> {
  await http.delete(`sections/${id}`);
}

function mapSection(raw: RawSection): Section {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
  };
}
