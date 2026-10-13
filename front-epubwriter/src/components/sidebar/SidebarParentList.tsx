import { useMatch, useNavigate } from "react-router";
import { useSelectedBookId } from "../../hooks/useSelectedBookId";
import { useSidebarStore } from "../../stores/sidebarStore";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { getLibraryApi } from "../../services/folder";
import { useEffect } from "react";
import type { LibraryBook, LibrarySeries } from "../../types/types";
import SeriesItem from "./SeriesItem";
import BookItem from "./BookItem";
import { Trash2 } from "lucide-react";

export default function SidebarParentList() {
  const navigate = useNavigate();
  const selectedBookId = useSelectedBookId();
  const expandSeries = useSidebarStore((s) => s.expandSeries);
  const isTrashActive = useMatch("/docu/trash") !== null;

  const {
    data: library,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.library,
    queryFn: getLibraryApi,
  });

  // 선택된 책이 속한 시리즈는 자동으로 펼치기
  useEffect(() => {
    if (!library || selectedBookId === null) return;
    const parent = library.find(
      (item): item is LibrarySeries =>
        item.kind === "series" &&
        item.books.some((b) => b.id === selectedBookId),
    );
    if (parent) expandSeries(parent.id);
  }, [library, selectedBookId, expandSeries]);

  // 타입 가드. LibraryItem[]에서 분류. LibrarySeries[], LibraryBooks[]로 나뉨
  const seriesList =
    library?.filter((i): i is LibrarySeries => i.kind === "series") ?? [];
  const singleBooks =
    library?.filter((i): i is LibraryBook => i.kind === "book") ?? [];

  return (
    <div className="flex flex-col h-full text-sm select-none">
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {isPending && (
          <p className="px-2 py-1.5 text-xs text-slate-400">불러오는 중...</p>
        )}
        {isError && (
          <p className="px-2 py-1.5 text-xs text-red-500">
            목록을 불러오지 못했어요.
          </p>
        )}
        {library?.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-slate-400">
            아직 시리즈나 책이 없어요.
          </p>
        )}

        {seriesList.map((series) => (
          <SeriesItem
            key={series.id}
            series={series}
            selectedBookId={selectedBookId}
          />
        ))}
        {singleBooks.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            isActive={book.id === selectedBookId}
          />
        ))}
      </div>

      <div className="pt-2 mt-2 border-t border-slate-200/80 shrink-0">
        <button
          onClick={() => navigate("/docu/trash")}
          className={`w-full flex items-center gap-2 px-2 py-2 text-xs font-medium rounded-lg transition group ${
            isTrashActive
              ? "bg-red-50 text-red-600"
              : "text-slate-500 hover:text-red-600 hover:bg-red-50/80"
          }`}
        >
          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>휴지통</span>
        </button>
      </div>
    </div>
  );
}
