import { useNavigate } from "react-router";
import type { Id, LibraryItem } from "../../types/types";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { useState } from "react";
import type { MenuAction } from "../sidebar/ItemMenu";
import { Book, Clock, Folder, Settings2, Trash2 } from "lucide-react";
import SeriesMetadataModal from "../metadata/SeriesMetadataModal";
import ItemMenu from "../sidebar/ItemMenu";
import { formatDateTime, formatRelative } from "../../lib/date";

interface Props {
  item: LibraryItem;
  onOpenSeries: (id: Id) => void;
}

export default function LibraryCard({ item, onOpenSeries }: Props) {
  const navigate = useNavigate();
  const deleteFolder = useDeleteFolder();
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const isSeries = item.kind === "series";
  /* item.books.length처럼 시리즈에만 있는 필드를 쓰는 곳은 
  isSeries 대신 item.kind === "series"로 직접 검사. 
  그래야 TypeScript가 그 분기 안에서 item을 LibrarySeries로 좁혀줌. */

  const handleClick = () => {
    if (item.kind === "series") onOpenSeries(item.id);
    else navigate(`/docu/books/${item.id}`);
  };

  const handleDelete = () => {
    const msg =
      item.kind === "series"
        ? `"${item.title}" 시리즈와 하위 책 ${item.books.length}권을 휴지통으로 이동하시겠습니까?`
        : `"${item.title}" 책을 휴지통으로 이동하시겠습니까?`;
    if (!confirm(msg)) return;
    deleteFolder.mutate({
      kind: item.kind,
      id: item.id,
      containsSelected: false,
    });
  };

  const actions: MenuAction[] = [
    ...(isSeries
      ? [
          {
            label: "메타데이터 편집",
            icon: Settings2,
            onClick: () => setIsEditingMeta(true),
          },
        ]
      : []),
    {
      label: isSeries ? "시리즈 삭제" : "책 삭제",
      icon: Trash2,
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <>
      <div
        onClick={handleClick}
        className={`group relative flex flex-col justify-between p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
          isSeries
            ? "border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-400"
            : "border-slate-200 hover:border-blue-400"
        }`}
      >
        <div>
          <div className="flex items-start justify-between mb-3">
            <div
              className={`p-2.5 rounded-lg ${isSeries ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
            >
              {isSeries ? (
                <Folder className="w-6 h-6 fill-amber-500/20" />
              ) : (
                <Book className="w-6 h-6" />
              )}
            </div>
            <ItemMenu actions={actions} />
          </div>

          <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
            {item.title}
          </h3>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {item.kind === "series" ? (
            <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              시리즈 • {item.books.length}권 포함
            </span>
          ) : (
            <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {item.parentId === null ? "단일 책" : "책"}
            </span>
          )}

          <div
            className="flex items-center gap-1 text-slate-400"
            title={formatDateTime(item.lastEditedAt)}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatRelative(item.lastEditedAt)}</span>
          </div>
        </div>
      </div>

      {isEditingMeta && (
        <SeriesMetadataModal
          seriesId={item.id}
          seriesTitle={item.title}
          onClose={() => setIsEditingMeta(false)}
        />
      )}
    </>
  );
}
