import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  Folder,
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  MoreVertical,
  Trash2,
} from "lucide-react";

// Mock Data
const mockChapters = [
  {
    id: "chap-1",
    title: "1장. 리액트 시작하기",
    documents: [
      { id: "doc-1", title: "JSX와 컴포넌트 개념" },
      { id: "doc-2", title: "State와 Props 다루기" },
    ],
  },
  {
    id: "chap-2",
    title: "2장. 상태 관리 심화",
    documents: [
      { id: "doc-3", title: "Context API 활용" },
      { id: "doc-4", title: "TanStack Query 개념" },
    ],
  },
];

export default function Mock_SidebarChildList() {
  const navigate = useNavigate();
  const { id: currentDocId } = useParams();
  const [searchParams] = useSearchParams();
  const currentBookId = searchParams.get("bookId");

  const [expandedChapters, setExpandedChapters] = useState(["chap-1"]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleChapter = (chapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChapters((prev) =>
      prev.includes(chapId)
        ? prev.filter((id) => id !== chapId)
        : [...prev, chapId],
    );
  };

  const handleDocSelect = (docId: string) => {
    navigate(`/docu/books/${currentBookId}/docs/${docId}`);
  };

  const handleCreateNewDoc = () => {
    navigate("/docu/new");
  };

  const handleDeleteItem = (
    type: "챕터" | "문서",
    title: string,
    id: string,
  ) => {
    setActiveMenuId(null);
    if (confirm(`"${title}" ${type}를 삭제(휴지통 이동)하시겠습니까?`)) {
      alert(`${type}가 삭제되었습니다.`);
    }
  };

  if (!currentBookId) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-slate-400 px-2">
        <p>왼쪽에서 책을 선택하면</p>
        <p className="mt-0.5">목차가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs select-none" ref={menuRef}>
      {/* 2단 상단 액션: 새 문서 추가 버튼 */}
      <button
        onClick={handleCreateNewDoc}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium rounded-lg transition border border-slate-200/60"
      >
        <Plus className="w-3.5 h-3.5 text-blue-600" />
        <span>새 문서 작성</span>
      </button>

      {/* 챕터 & 문서 트리 */}
      <div className="space-y-1">
        {mockChapters.map((chap) => {
          const isExpanded = expandedChapters.includes(chap.id);
          const isChapMenuOpen = activeMenuId === chap.id;

          return (
            <div key={chap.id} className="space-y-0.5">
              {/* 챕터 (폴더) 헤더 */}
              <div
                onClick={(e) => toggleChapter(chap.id, e)}
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
                    {chap.title}
                  </span>
                </div>

                {/* Hover 버튼 그룹 (추가 + 더보기) */}
                <div
                  className={`flex items-center gap-0.5 transition-opacity ${
                    isChapMenuOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateNewDoc();
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition"
                    title="이 챕터에 문서 추가"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(isChapMenuOpen ? null : chap.id);
                    }}
                    className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition"
                    title="더보기"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>

                {/* 챕터 드롭다운 메뉴 */}
                {isChapMenuOpen && (
                  <div className="absolute right-2 top-7 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 font-normal animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem("챕터", chap.title, chap.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>챕터 삭제</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 챕터 내 문서 목록 */}
              {isExpanded && (
                <div className="ml-3 pl-2 border-l border-slate-200 space-y-0.5">
                  {chap.documents.map((doc) => {
                    const isActive = currentDocId === doc.id;
                    const isDocMenuOpen = activeMenuId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleDocSelect(doc.id)}
                        className={`group relative flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <FileText
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? "text-blue-600" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{doc.title}</span>
                        </div>

                        {/* 문서 Hover 더보기 버튼 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isDocMenuOpen ? null : doc.id);
                          }}
                          className={`p-0.5 text-slate-400 hover:text-slate-700 rounded transition-opacity ${
                            isDocMenuOpen
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>

                        {/* 문서 드롭다운 메뉴 */}
                        {isDocMenuOpen && (
                          <div className="absolute right-2 top-7 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 font-normal animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem("문서", doc.title, doc.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>문서 삭제</span>
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
        })}
      </div>
    </div>
  );
}
