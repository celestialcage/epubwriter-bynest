import { useMutation, useQuery } from "@tanstack/react-query";
import type { Id } from "../../types/types";
import { queryKeys } from "../../services/queryKeys";
import { getChaptersApi } from "../../services/folder";
import { downloadEpubApi } from "../../services/epub";
import { Download, Loader2 } from "lucide-react";
import { UNSAVED_KEYS, useUnsavedStore } from "../../stores/unsavedStore";

export default function EpubDownloadSection({ bookId }: { bookId: Id }) {
  const { data: chapters } = useQuery({
    queryKey: queryKeys.chapters(bookId),
    queryFn: () => getChaptersApi(bookId),
  });

  const download = useMutation({ mutationFn: () => downloadEpubApi(bookId) });

  const hasNoChapters = chapters?.length === 0; // 백엔드가 400을 주는 경우를 미리 막기

  const hasUnsavedMetadata = useUnsavedStore(
    (s) => UNSAVED_KEYS.bookMetadata in s.entries,
  );

  const handleDownload = () => {
    if (
      hasUnsavedMetadata &&
      !confirm(
        "저장하지 않은 메타데이터 변경사항이 있어요.\n저장된 값으로 다운로드할까요?",
      )
    ) {
      return;
    }
    download.mutate();
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 space-y-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={download.isPending || hasNoChapters}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm transition"
      >
        {download.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>EPUB 파일 생성 중...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>EPUB 다운로드</span>
          </>
        )}
      </button>

      <p
        className={`text-[10px] text-center ${
          download.error
            ? "text-red-500"
            : hasUnsavedMetadata
              ? "text-amber-600"
              : "text-slate-400"
        }`}
      >
        {download.error
          ? download.error.message
          : hasUnsavedMetadata
            ? "메타데이터를 저장해야 EPUB에 반영돼요"
            : hasNoChapters
              ? "챕터를 하나 이상 만들어야 내보낼 수 있어요"
              : "표준 ePub 3.0 포맷으로 내보내집니다"}
      </p>
    </div>
  );
}
