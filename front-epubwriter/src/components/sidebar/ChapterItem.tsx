import { useNavigate } from "react-router";
import type { Chapter, Id } from "../../types/types";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { ChevronDown, ChevronRight, Folder, Plus, Trash2 } from "lucide-react";
import ItemMenu from "./ItemMenu";
import DocItem from "./DocItem";

interface Props {
  chapter: Chapter;
  bookId: Id;
  selectedDocId: Id | null;
}

export default function ChapterItem({ chapter, bookId, selectedDocId }: Props) {
  const navigate = useNavigate();
  const isExpanded = useSidebarStore((s) =>
    s.expandedChapterIds.includes(chapter.id),
  );
  const toggleChapter = useSidebarStore((s) => s.toggleChapter);
  const deleteFolder = useDeleteFolder();

  const handleDelete = () => {
    const msg = `"${chapter.title}" 챕터와 하위 문서 ${chapter.docs.length}개를 휴지통으로 이동하시겠습니까?`;
    if (!confirm(msg)) return;
    deleteFolder.mutate({
      kind: "chapter",
      id: chapter.id,
      bookId,
      containsSelected: chapter.docs.some((d) => d.id === selectedDocId),
    });
  };

  return (
    <div className="space-y-0.5">
      <div
        onClick={() => toggleChapter(chapter.id)}
        className="group relative flex items-center justify-between px-2 py-1.5 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer transition"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-slate-400 hover:text-slate-600">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
          <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0 fill-slate-200" />
          <span className="font-semibold truncate text-slate-700">
            {chapter.title}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/docu/books/${bookId}/new?chapterId=${chapter.id}`);
            }}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="이 챕터에 문서 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <ItemMenu
            actions={[
              {
                label: "챕터 삭제",
                icon: Trash2,
                onClick: handleDelete,
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5">
          {chapter.docs.length === 0 ? (
            <p className="px-2 py-1 text-slate-300">문서 없음</p>
          ) : (
            chapter.docs.map((doc) => (
              <DocItem
                key={doc.id}
                doc={doc}
                bookId={bookId}
                isActive={doc.id === selectedDocId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
