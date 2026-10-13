import { useState } from "react";
import { useSearchParams } from "react-router";
import { useCreateFolder } from "../../hooks/useCreateFolder";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { getLibraryApi } from "../../services/folder";
import type { Id, LibraryItem, LibrarySeries } from "../../types/types";
import CreateFolderModal from "../common/CreateFolderModal";
import LibraryCard from "../home/LibraryCard";
import { Book, BookOpen, ChevronRight, Folder, Plus } from "lucide-react";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState<"series" | "book" | null>(null);
  const createFolder = useCreateFolder();

  const {
    data: library,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.library,
    queryFn: getLibraryApi,
  });

  // ?series=3 이면 그 시리즈 안을 보여줌. 없거나 지워진 시리즈면 루트
  const seriesId = Number(searchParams.get("series")) || null;
  const currentSeries = library?.find(
    (i): i is LibrarySeries => i.kind === "series" && i.id === seriesId,
  );

  const items: LibraryItem[] = currentSeries
    ? currentSeries.books
    : (library ?? []);
  // ISO 문자열은 사전순 비교가 곧 시간순 비교
  const sortedItems = [...items].sort((a, b) =>
    b.lastEditedAt.localeCompare(a.lastEditedAt),
  );

  const openSeries = (id: Id) => setSearchParams({ series: String(id) });
  const goRoot = () => setSearchParams({});

  const closeModal = () => {
    setCreating(null);
    createFolder.reset();
  };

  const handleCreate = (title: string) => {
    if (creating === "series") {
      createFolder.mutate({ kind: "series", title }, { onSuccess: closeModal });
    } else {
      // 시리즈 안에서 만들면 그 시리즈의 책으로. 성공하면 훅이 새 책으로 이동시킴
      createFolder.mutate(
        {
          kind: "book",
          title,
          parentSeriesId: currentSeries?.id,
        },
        { onSuccess: closeModal },
      );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 헤더 & 생성 버튼 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Shabetty's Library
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                시리즈와 단일 책을 관리하고 새 문서를 작성하세요.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!currentSeries && (
                <button
                  onClick={() => setCreating("series")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm transition"
                >
                  <Folder className="w-4 h-4 text-amber-500" />
                  <span>새 시리즈</span>
                </button>
              )}
              <button
                onClick={() => setCreating("book")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {currentSeries ? "이 시리즈에 책 추가" : "새 책 만들기"}
                </span>
              </button>
            </div>
          </div>

          {/* 빵부스러기 */}
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <button
              onClick={goRoot}
              className={`flex items-center gap-1 ${
                currentSeries
                  ? "text-slate-500 hover:text-slate-900"
                  : "font-semibold text-slate-900"
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" /> Root
            </button>
            {currentSeries && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-900 truncate">
                  {currentSeries.title}
                </span>
              </>
            )}
          </nav>

          {/* 카드 영역 */}
          {isPending ? (
            <p className="text-sm text-slate-400">불러오는 중...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">목록을 불러오지 못했어요.</p>
          ) : sortedItems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl">
              <Book className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">
                {currentSeries
                  ? "이 시리즈에 아직 책이 없습니다"
                  : "아직 작성된 책이 없습니다"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                {currentSeries
                  ? "첫 책을 추가해 보세요."
                  : "새 시리즈를 만들거나 단일 책을 추가해 보세요."}
              </p>
              <button
                onClick={() => setCreating("book")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                첫 책 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedItems.map((item) => (
                <LibraryCard
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onOpenSeries={openSeries}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {creating && (
        <CreateFolderModal
          kind={creating}
          parentTitle={creating === "book" ? currentSeries?.title : undefined}
          isPending={createFolder.isPending}
          errorMessage={createFolder.error?.message}
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
}
