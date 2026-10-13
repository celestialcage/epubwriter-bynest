import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Book,
  Plus,
  BookOpen,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface BookItem {
  id: string;
  title: string;
}

interface SeriesItem {
  id: string;
  title: string;
  type: "SERIES" | "BOOK";
  books?: BookItem[];
}

// Mock Data
const mockSeriesList: SeriesItem[] = [
  {
    id: "series-1",
    title: "React & Modern Web",
    type: "SERIES",
    books: [
      { id: "book-1", title: "React 입문부터 실전까지" },
      { id: "book-2", title: "TanStack Query 완전 정복" },
    ],
  },
  {
    id: "series-2",
    title: "판타지 소설 구상집",
    type: "SERIES",
    books: [
      { id: "book-3", title: "세계관 설정집" },
      { id: "book-4", title: "인물 관계도 및 플롯" },
    ],
  },
  {
    id: "book-5",
    title: "NestJS 백엔드 단권",
    type: "BOOK",
  },
];

export default function Mock_SidebarParentList2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentBookId = searchParams.get("bookId");

  const [expandedSeries, setExpandedSeries] = useState<string[]>(["series-1"]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 영역 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSeries = (seriesId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSeries((prev) =>
      prev.includes(seriesId)
        ? prev.filter((id) => id !== seriesId)
        : [...prev, seriesId],
    );
  };

  const handleBookSelect = (bookId: string) => {
    navigate(`/docu/books/${bookId}`);
  };

  const handleDeleteItem = (
    type: "시리즈" | "책",
    title: string,
    id: string,
  ) => {
    setActiveMenuId(null);
    if (confirm(`"${title}" ${type}를 삭제(휴지통 이동)하시겠습니까?`)) {
      alert(`${type}가 삭제되었습니다.`);
    }
  };

  const handleTrashClick = () => {
    navigate("/docu/trash");
  };

  return (
    <div className="flex flex-col h-full text-sm select-none" ref={menuRef}>
      {/* 1. 상단: 스크롤 가능한 시리즈/책 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {mockSeriesList.map((item) => {
          if (item.type === "SERIES") {
            const isExpanded = expandedSeries.includes(item.id);
            const isMenuOpen = activeMenuId === item.id;

            return (
              <div key={item.id} className="space-y-0.5">
                {/* 시리즈 (폴더) 헤더 */}
                <div
                  onClick={(e) => toggleSeries(item.id, e)}
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
                      {item.title}
                    </span>
                  </div>

                  {/* Hover 시 보여지는 액션 버튼 영역 */}
                  <div
                    className={`flex items-center gap-0.5 transition-opacity ${isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert("시리즈 내 새 책 추가");
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded"
                      title="새 책 추가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded"
                      title="더보기"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 시리즈 드롭다운 메뉴 */}
                  {isMenuOpen && (
                    <div className="absolute right-2 top-8 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem("시리즈", item.title, item.id);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>시리즈 삭제</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 하위 책 리스트 */}
                {isExpanded && item.books && (
                  <div className="ml-3.5 pl-2.5 border-l border-slate-200/80 space-y-0.5">
                    {item.books.map((book) => {
                      const isActive = currentBookId === book.id;
                      const isBookMenuOpen = activeMenuId === book.id;

                      return (
                        <div
                          key={book.id}
                          onClick={() => handleBookSelect(book.id)}
                          className={`group relative flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-xs transition ${
                            isActive
                              ? "bg-blue-100/80 text-blue-700 font-semibold"
                              : "text-slate-600 hover:bg-slate-200/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Book
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-blue-600" : "text-slate-400"
                              }`}
                            />
                            <span className="truncate">{book.title}</span>
                          </div>

                          {/* 책 Hover 더보기 버튼 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isBookMenuOpen ? null : book.id);
                            }}
                            className={`p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded transition-opacity ${
                              isBookMenuOpen
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* 책 드롭다운 메뉴 */}
                          {isBookMenuOpen && (
                            <div className="absolute right-2 top-7 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 font-normal animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem("책", book.title, book.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>책 삭제</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // 단일 책
          const isActive = currentBookId === item.id;
          const isBookMenuOpen = activeMenuId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleBookSelect(item.id)}
              className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-xs transition ${
                isActive
                  ? "bg-blue-100/80 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-200/60"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 ml-5">
                <BookOpen
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.title}</span>
              </div>

              {/* 단일 책 Hover 더보기 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(isBookMenuOpen ? null : item.id);
                }}
                className={`p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded transition-opacity ${
                  isBookMenuOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* 단일 책 드롭다운 메뉴 */}
              {isBookMenuOpen && (
                <div className="absolute right-2 top-8 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 font-normal animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem("책", item.title, item.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>책 삭제</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. 하단 고정 영역: 휴지통 UI */}
      <div className="pt-2 mt-2 border-t border-slate-200/80 shrink-0">
        <button
          onClick={handleTrashClick}
          className="w-full flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/80 rounded-lg transition group"
        >
          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span>휴지통</span>
        </button>
      </div>
    </div>
  );
}
