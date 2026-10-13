import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  BookOpen,
  FileText,
} from "lucide-react";
import SidebarParentList from "../sidebar/SidebarParentList";
import SidebarChildList from "../sidebar/SidebarChildList";

export const AppLayout = () => {
  const location = useLocation();

  // 1. 데스크톱용 사이드바 열림/접힘 상태
  const [isParentOpen, setIsParentOpen] = useState(true);
  const [isChildOpen, setIsChildOpen] = useState(true);

  // 2. 모바일/소형 화면용 오버레이 드로어 열림 상태
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // 3. 페이지(문서) 이동 시 모바일 드로어 자동 닫기
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname, location.search]);

  // 4. 화면 크기가 데스크톱 이상으로 커지면 드로어 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden select-none">
      {/* ==================== 모바일 전용 상단 헤더 ==================== */}
      <header className="md:hidden h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-20">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-slate-800">문서 에디터</span>
        <div className="w-8" /> {/* 대칭용 여백 */}
      </header>

      {/* ==================== 모바일 오버레이 드로어 ==================== */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* 어두운 배경 (클릭 시 닫기) */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* 드로어 컨텐츠 영역 */}
          <div className="relative w-[320px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* 드로어 헤더 */}
            <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-100/60">
              <span className="font-bold text-sm text-slate-700">탐색기</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 드로어 바디 (1단 + 2단 세로 스택) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              <div className="p-3 bg-slate-50/50">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 px-1">
                  시리즈 / 책
                </h4>
                <SidebarParentList />
              </div>
              <div className="p-3 bg-white">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 px-1">
                  목차 / 문서
                </h4>
                <SidebarChildList />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 데스크톱 2단 사이드바 (md 이상) ==================== */}
      <aside className="hidden md:flex h-full shrink-0 border-r border-slate-200 transition-all duration-300 ease-in-out">
        {/* 1단 사이드바 (시리즈/책) */}
        <div
          className={`h-full bg-slate-100/80 border-r border-slate-200/80 flex flex-col transition-all duration-300 ${
            isParentOpen ? "w-[220px]" : "w-[52px]"
          }`}
        >
          <div className="h-12 px-3 flex items-center justify-between border-b border-slate-200/60 shrink-0">
            {isParentOpen && (
              <span className="font-bold text-xs text-slate-600 tracking-wider uppercase truncate">
                시리즈 / 책
              </span>
            )}
            <button
              onClick={() => setIsParentOpen(!isParentOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition mx-auto"
            >
              {isParentOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isParentOpen ? (
              <SidebarParentList />
            ) : (
              <div className="flex flex-col items-center gap-3 pt-2">
                <button className="p-2 text-slate-500 hover:bg-slate-200/80 rounded-lg transition">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2단 사이드바 (챕터/문서) */}
        <div
          className={`h-full bg-white flex flex-col transition-all duration-300 ${
            isChildOpen ? "w-[200px]" : "w-[52px]"
          }`}
        >
          <div className="h-12 px-3 flex items-center justify-between border-b border-slate-100 shrink-0">
            {isChildOpen && (
              <span className="font-bold text-xs text-slate-600 tracking-wider uppercase truncate">
                목차 / 문서
              </span>
            )}
            <button
              onClick={() => setIsChildOpen(!isChildOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition mx-auto"
            >
              {isChildOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {isChildOpen ? (
              <SidebarChildList />
            ) : (
              <div className="flex flex-col items-center gap-3 pt-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
                  <FileText className="w-5 h-5 text-blue-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== 메인 콘텐츠 영역 ==================== */}
      <div className="flex-1 h-full flex justify-center overflow-y-auto py-6 md:py-10 bg-white">
        <main className="max-w-[655px] w-full relative px-4 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
