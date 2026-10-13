import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import {
  PanelLeftClose,
  PanelLeftOpen,
  // FolderBook,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Home,
} from "lucide-react";
import SidebarParentList from "../sidebar/SidebarParentList";
import SidebarChildList from "../sidebar/SidebarChildList";
import SidebarMetadata from "../bookPanel/SidebarMetadata";

export const AppLayout = () => {
  const navigate = useNavigate();
  // 1단 & 2단 사이드바 열림/접힘 상태 (기본값: 모두 펼침)
  const [isParentOpen, setIsParentOpen] = useState(true);
  const [isChildOpen, setIsChildOpen] = useState(true);

  return (
    <div className="w-screen h-screen flex bg-slate-50 overflow-hidden select-none">
      {/* ==================== 1단 & 2단 사이드바 영역 ==================== */}
      <aside className="flex h-full shrink-0 border-r border-slate-200 transition-all duration-300 ease-in-out">
        {/* ---------------- 1단 사이드바 (시리즈/책) ---------------- */}
        <div
          className={`h-full bg-slate-100/80 border-r border-slate-200/80 flex flex-col transition-all duration-300 ${
            isParentOpen ? "w-[220px]" : "w-[52px]"
          }`}
        >
          {/* 1단 헤더 & 접기/펼치기 토글 버튼 */}
          <div className="h-12 px-3 flex items-center justify-between border-b border-slate-200/60 shrink-0 gap-1.5">
            {isParentOpen ? (
              <>
                <button
                  onClick={() => navigate("/")}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition shrink-0"
                  title="홈으로"
                >
                  <Home className="w-4 h-4" />
                </button>
                <span className="font-bold text-xs text-slate-600 tracking-wider uppercase truncate flex-1">
                  시리즈 / 책
                </span>
                {/* 시리즈/책 추가 버튼 */}
                <button
                  onClick={() => {
                    /* TODO: 모달 띄우기 로직 */
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition shrink-0"
                  title="새 시리즈 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {/* 사이드바 토글 버튼 */}
                <button
                  onClick={() => setIsParentOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition shrink-0"
                  title="1단 사이드바 접기"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsParentOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition mx-auto"
                title="1단 사이드바 펼치기"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 1단 콘텐츠 (펼침 vs 접힘) */}
          <div className="flex-1 overflow-y-auto p-2">
            {isParentOpen ? (
              <SidebarParentList />
            ) : (
              // 접혔을 때 표시되는 아이콘 미니 뷰
              <div className="flex flex-col items-center gap-1 pt-1">
                <button
                  onClick={() => {
                    /* TODO: 모달 띄우기 로직 */
                  }}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 rounded-lg transition"
                  title="새 시리즈 추가"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <div className="w-6 h-[1px] bg-slate-200 my-1" />
                <button
                  className="p-2 text-slate-500 hover:bg-slate-200/80 rounded-lg transition"
                  title="시리즈/책 목록"
                >
                  <BookOpen className="w-5 h-5 text-amber-500" />
                </button>
                <button
                  onClick={() => navigate("/docu/trash")}
                  className="p-2 text-slate-500 hover:bg-slate-200/80 rounded-lg transition"
                  title="휴지통"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- 2단 사이드바 (챕터/문서) ---------------- */}
        <div
          className={`h-full bg-white flex flex-col transition-all duration-300 ${
            isChildOpen ? "w-[200px]" : "w-[52px]"
          }`}
        >
          {/* 2단 헤더 & 토글 버튼 */}
          <div className="h-12 px-3 flex items-center justify-between border-b border-slate-100 shrink-0">
            {isChildOpen && (
              <span className="w-full font-bold text-xs text-slate-600 tracking-wider uppercase truncate">
                목차 / 문서
              </span>
            )}
            <button
              onClick={() => setIsChildOpen(!isChildOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition mx-auto"
              title={isChildOpen ? "2단 사이드바 접기" : "2단 사이드바 펼치기"}
            >
              {isChildOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 2단 콘텐츠 (펼침 vs 접힘) */}
          <div className="flex-1 overflow-y-auto p-2">
            {isChildOpen ? (
              <SidebarChildList />
            ) : (
              // 접혔을 때 표시되는 아이콘 미니 뷰
              <div className="flex flex-col items-center gap-3 pt-2">
                <button
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                  title="챕터/문서 목록"
                >
                  <FileText className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== 오른쪽 메인 에디터 영역 ==================== */}
      <div className="flex-1 h-full min-h-0 flex justify-center bg-white">
        <main className="h-full min-h-0 max-w-[655px] w-full relative px-6 py-10">
          <Outlet />
        </main>
      </div>
      {/* 우측 3단 메타데이터 & EPUB 다운로드 사이드바 */}
      <SidebarMetadata />
    </div>
  );
};

export default AppLayout;
