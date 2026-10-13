import {
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useSidebarStore } from "../../stores/sidebarStore";
import type { Id, LibrarySeries } from "../../types/types";
import ItemMenu from "./ItemMenu";
import BookItem from "./BookItem";
import { useState } from "react";
import { useCreateFolder } from "../../hooks/useCreateFolder";
import CreateFolderModal from "../common/CreateFolderModal";
import SeriesMetadataModal from "../metadata/SeriesMetadataModal";

interface Props {
  series: LibrarySeries;
  selectedBookId: Id | null;
}

export default function SeriesItem({ series, selectedBookId }: Props) {
  const isExpanded = useSidebarStore((s) =>
    s.expandedSeriesIds.includes(series.id),
  );
  const toggleSeries = useSidebarStore((s) => s.toggleSeries);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();

  const closeCreateModal = () => {
    setIsCreatingBook(false);
    createFolder.reset(); // 다음에 열 때 이전 에러가 남지 않게
  };

  const handleDelete = () => {
    const msg = `"${series.title}" 시리즈와 하위 책 ${series.books.length}권을 휴지통으로 이동하시겠습니까?`;
    if (!confirm(msg)) return;
    deleteFolder.mutate({
      kind: "series",
      id: series.id,
      containsSelected: series.books.some((b) => b.id === selectedBookId),
    });
  };

  return (
    <>
      <div className="space-y-0.5">
        <div
          onClick={() => toggleSeries(series.id)}
          className="group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 hover:text-slate-600">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
            <Folder className="w-4 h-4 text-amber-500 shrink-0 fill-amber-500/20" />
            <span className="font-medium truncate text-xs text-slate-800">
              {series.title}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCreatingBook(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="새 책 추가"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <ItemMenu
              actions={[
                {
                  label: "메타데이터 편집",
                  icon: Settings2,
                  onClick: () => setIsEditingMeta(true),
                },
                {
                  label: "시리즈 삭제",
                  icon: Trash2,
                  onClick: handleDelete,
                  danger: true,
                },
              ]}
            />
          </div>
        </div>

        {isExpanded && series.books.length > 0 && (
          <div className="ml-3.5 pl-2.5 border-l border-slate-200/80 space-y-0.5">
            {series.books.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                isActive={book.id === selectedBookId}
              />
            ))}
          </div>
        )}
      </div>

      {isCreatingBook && (
        <CreateFolderModal
          kind="book"
          parentTitle={series.title}
          isPending={createFolder.isPending}
          errorMessage={createFolder.error?.message}
          onClose={closeCreateModal}
          onSubmit={(title) =>
            createFolder.mutate(
              { kind: "book", title, parentSeriesId: series.id },
              { onSuccess: closeCreateModal },
            )
          }
        />
      )}

      {isEditingMeta && (
        <SeriesMetadataModal
          seriesId={series.id}
          seriesTitle={series.title}
          onClose={() => setIsEditingMeta(false)}
        />
      )}
    </>
  );
}
