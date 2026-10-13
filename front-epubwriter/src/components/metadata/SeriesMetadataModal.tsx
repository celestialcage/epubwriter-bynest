import { useQuery } from "@tanstack/react-query";
import { Settings2, X } from "lucide-react";
import { getMetadataApi } from "../../services/folder";
import { queryKeys } from "../../services/queryKeys";
import type { Id } from "../../types/types";
import Modal from "../common/Modal";
import MetadataForm from "./MetadataForm";
import { useSaveMetadata } from "./useSaveMetadata";

interface Props {
  seriesId: Id;
  seriesTitle: string;
  onClose: () => void;
}

export default function SeriesMetadataModal({
  seriesId,
  seriesTitle,
  onClose,
}: Props) {
  const save = useSaveMetadata(seriesId);

  const {
    data: metadata,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.metadata(seriesId),
    queryFn: () => getMetadataApi(seriesId),
  });

  return (
    <Modal onClose={onClose} disableClose={save.isPending}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Settings2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800">
              시리즈 메타데이터
            </h2>
            <p className="text-xs text-slate-400 truncate">
              {seriesTitle} · 하위 책이 비어 있는 항목을 상속받아요
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={save.isPending}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {isPending && <p className="text-sm text-slate-400">불러오는 중...</p>}
        {isError && (
          <p className="text-sm text-red-500">
            메타데이터를 불러오지 못했어요.
          </p>
        )}
        {metadata && (
          <MetadataForm
            metadata={metadata}
            titleLabel="시리즈 제목"
            isPending={save.isPending}
            errorMessage={save.error?.message}
            onSubmit={(changes) => save.mutate(changes, { onSuccess: onClose })}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
}
