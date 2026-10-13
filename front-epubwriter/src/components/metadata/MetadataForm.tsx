import { Loader2 } from "lucide-react";
import { type SyntheticEvent } from "react";
import type { FolderMetadata } from "../../types/types";
import MetadataInputs from "./MetadataInputs";
import { useMetadataForm, type MetadataChanges } from "./useMetadataForm";

interface Props {
  metadata: FolderMetadata;
  titleLabel: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (changes: MetadataChanges) => void;
  onCancel: () => void;
}

export default function MetadataForm({
  metadata,
  titleLabel,
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const { form, setField, changes, isDirty, canSave } =
    useMetadataForm(metadata);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isDirty) return onCancel();
    if (canSave && !isPending) onSubmit(changes);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <MetadataInputs
        form={form}
        original={metadata}
        titleLabel={titleLabel}
        onChange={setField}
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || (isDirty && !canSave)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg shadow-sm transition"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>저장하기</span>
        </button>
      </div>
    </form>
  );
}
