import { useMemo, useState } from "react";
import type {
  FolderMetadata,
  MetadataFields,
  UpdateMetadataBody,
} from "../../types/types";

export type MetaKey = keyof MetadataFields;
export const META_KEYS: MetaKey[] = [
  "author",
  "publisher",
  "language",
  "description",
];

export type MetadataFormState = { title: string } & Record<MetaKey, string>;

/** 저장할 변경분. title은 PATCH /folders/:id, meta는 PATCH /folders/:id/metadata */
export interface MetadataChanges {
  title?: string;
  meta: UpdateMetadataBody;
}

function toFormState(m: FolderMetadata): MetadataFormState {
  return {
    title: m.title,
    author: m.author ?? "",
    publisher: m.publisher ?? "",
    language: m.language ?? "",
    description: m.description ?? "",
  };
}

function buildChanges(
  original: FolderMetadata,
  form: MetadataFormState,
): MetadataChanges {
  const meta: UpdateMetadataBody = {};
  for (const key of META_KEYS) {
    const trimmed = form[key].trim();
    const next = trimmed === "" ? null : trimmed; // 빈 칸 = null(상속으로 되돌리기)
    if (next !== original[key]) meta[key] = next;
  }
  const title = form.title.trim();
  return {
    title: title !== "" && title !== original.title ? title : undefined,
    meta,
  };
}

export function useMetadataForm(metadata: FolderMetadata) {
  const [form, setForm] = useState(() => toFormState(metadata));

  const setField = (key: keyof MetadataFormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const changes = useMemo(() => buildChanges(metadata, form), [metadata, form]); // 메모 의미 안 큰 편이래
  const isDirty =
    changes.title !== undefined || Object.keys(changes.meta).length > 0;
  const canSave = isDirty && form.title.trim() !== "";
  const reset = () => setForm(toFormState(metadata));

  return { form, setField, changes, isDirty, canSave, reset };
}
