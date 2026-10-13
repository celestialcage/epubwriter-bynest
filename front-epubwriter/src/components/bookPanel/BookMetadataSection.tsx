import { useQuery } from "@tanstack/react-query";
import type { FolderMetadata, Id } from "../../types/types";
import { queryKeys } from "../../services/queryKeys";
import { getMetadataApi } from "../../services/folder";
import { useMetadataForm } from "../metadata/useMetadataForm";
import { useSaveMetadata } from "../metadata/useSaveMetadata";
import { useEffect, useState, type SyntheticEvent } from "react";
import { Book, Check, Loader2, Save } from "lucide-react";
import MetadataInputs from "../metadata/MetadataInputs";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { UNSAVED_KEYS } from "../../stores/unsavedStore";

export default function BookMetadataSection({ bookId }: { bookId: Id }) {
  const {
    data: metadata,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.metadata(bookId),
    queryFn: () => getMetadataApi(bookId),
  });

  if (isPending) return <p className="text-slate-400">불러오는 중...</p>;
  if (isError)
    return <p className="text-red-500">메타데이터를 불러오지 못했어요.</p>;

  // 데이터가 생긴 뒤에 마운트해야 useState 초기값이 실제 값으로 잡힘
  return <BookMetadataEditor bookId={bookId} metadata={metadata} />;
}

function BookMetadataEditor({
  bookId,
  metadata,
}: {
  bookId: Id;
  metadata: FolderMetadata;
}) {
  const { form, setField, changes, isDirty, canSave, reset } =
    useMetadataForm(metadata);
  useUnsavedChanges(UNSAVED_KEYS.bookMetadata, isDirty, "book");

  const save = useSaveMetadata(bookId);
  const [justSaved, setJustSaved] = useState(false);

  // "저장됨" 표시 2초 후 해제 (언마운트 시 타이머 정리)
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(() => setJustSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave || save.isPending) return;
    save.mutate(changes, { onSuccess: () => setJustSaved(true) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Book className="w-4 h-4 text-amber-500" />
          <span>책 설정 & 내보내기</span>
        </div>

        <button
          type="submit"
          disabled={!canSave || save.isPending}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
            justSaved
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm disabled:opacity-50 disabled:hover:bg-white"
          }`}
        >
          {save.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : justSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>저장됨</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>저장</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            메타 데이터 (EPUB 정보)
          </h4>
          {isDirty && (
            <button
              type="button"
              onClick={reset}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              되돌리기
            </button>
          )}
        </div>

        <MetadataInputs
          form={form}
          original={metadata}
          titleLabel="책 제목"
          onChange={setField}
        />
        {save.error && <p className="text-red-500">{save.error.message}</p>}
      </div>
    </form>
  );
}
