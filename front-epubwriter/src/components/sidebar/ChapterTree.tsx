import { useEffect, useState } from "react";
import { useSelectedDocId } from "../../hooks/useSelectedDocId";
import { useSidebarStore } from "../../stores/sidebarStore";
import type { Id } from "../../types/types";
import { useCreateFolder } from "../../hooks/useCreateFolder";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { getChaptersApi } from "../../services/folder";
import { ApiError } from "../../services/client";
import { Plus } from "lucide-react";
import CreateFolderModal from "../common/CreateFolderModal";
import ChapterItem from "./ChapterItem";

export default function ChapterTree({ bookId }: { bookId: Id }) {
  const selectedDocId = useSelectedDocId();
  const expandChapter = useSidebarStore((s) => s.expandChapter);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const createFolder = useCreateFolder();

  const {
    data: chapters,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.chapters(bookId),
    queryFn: () => getChaptersApi(bookId),
  });

  // 보고 있는 문서가 속한 챕터는 자동으로 펼치기
  useEffect(() => {
    if (!chapters || selectedDocId === null) return;
    const parent = chapters.find((c) =>
      c.docs.some((d) => d.id === selectedDocId),
    );
    if (parent) expandChapter(parent.id);
  }, [chapters, selectedDocId, expandChapter]);

  const closeCreateModal = () => {
    setIsCreatingChapter(false);
    createFolder.reset();
  };

  /* isPending과 error를 먼저 걸러내고 나면 그 아래에서 TypeScript가 chapters를 Chapter[]로 좁혀줘서 
  chapters?. 같은 옵셔널 체이닝이 필요 없음. 404 처리는 다른 탭에서 책을 지웠거나 URL을 직접 입력한 경우를 위한 거 */
  if (isPending)
    return <p className="px-2 py-1.5 text-xs text-slate-400">불러오는 중...</p>;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <p className="px-2 py-1.5 text-xs text-red-500">
        {notFound
          ? "책을 찾을 수 없어요. 삭제되었을 수 있어요."
          : "목차를 불러오지 못했어요."}
      </p>
    );
  }

  return (
    <div className="space-y-3 text-xs select-none">
      <button
        onClick={() => setIsCreatingChapter(true)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-lg transition border border-slate-200/60"
      >
        <Plus className="w-3.5 h-3.5 text-blue-600" />
        <span>새 챕터</span>
      </button>

      {chapters.length === 0 ? (
        <p className="px-2 text-center text-slate-400 leading-relaxed">
          아직 챕터가 없어요.
          <br />
          챕터를 만든 뒤 문서를 추가하세요.
        </p>
      ) : (
        <div className="space-y-1">
          {chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              bookId={bookId}
              selectedDocId={selectedDocId}
            />
          ))}
        </div>
      )}

      {isCreatingChapter && (
        <CreateFolderModal
          kind="chapter"
          isPending={createFolder.isPending}
          errorMessage={createFolder.error?.message}
          onClose={closeCreateModal}
          onSubmit={(title) =>
            createFolder.mutate(
              { kind: "chapter", title, parentBookId: bookId },
              { onSuccess: closeCreateModal },
            )
          }
        />
      )}
    </div>
  );
}
