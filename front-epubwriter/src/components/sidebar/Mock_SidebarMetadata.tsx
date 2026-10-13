import React, { useState } from "react";
import {
  Book,
  Download,
  Save,
  Check,
  FileText,
  Folder,
  ChevronDown,
  ChevronRight,
  Globe,
  User,
  AlignLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

interface MetadataForm {
  title: string;
  author: string;
  language: string;
  description: string;
}

// Mock Data (선택된 책의 메타데이터 및 구조 정보)
const mockBookData = {
  id: "book-1",
  title: "React 입문부터 실전까지",
  author: "김개발",
  language: "ko",
  description:
    "리액트의 기초 개념부터 TanStack Query를 활용한 실전 아키텍처까지 다룹니다.",
  chaptersCount: 3,
  documentsCount: 12,
  chapters: [
    {
      id: "chap-1",
      title: "1장. 리액트 시작하기",
      docs: ["JSX 개념", "Component 작성법"],
    },
    {
      id: "chap-2",
      title: "2장. 상태 관리 심화",
      docs: ["Context API", "TanStack Query 활용"],
    },
  ],
};

export default function Mock_SidebarMetadata() {
  // 메타데이터 입력 상태
  const [form, setForm] = useState<MetadataForm>({
    title: mockBookData.title,
    author: mockBookData.author,
    language: mockBookData.language,
    description: mockBookData.description,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);

  // 메타데이터 저장 핸들러
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    // 백엔드 PATCH API 연동 지점
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // EPUB 다운로드 핸들러
  const handleDownloadEpub = async () => {
    setIsExporting(true);
    try {
      // 백엔드 EPUB 생성/다운로드 API 연동 타임아웃 흉내
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`"${form.title}" EPUB 파일 다운로드가 시작되었습니다.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="w-[280px] h-full bg-slate-50 border-l border-slate-200 flex flex-col justify-between select-none text-xs">
      {/* ==================== 1. 상단 스크롤 영역 (메타데이터 + 미리보기) ==================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 헤더 & 저장 버튼 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Book className="w-4 h-4 text-amber-500" />
            <span>책 설정 & 내보내기</span>
          </div>

          <button
            onClick={handleSaveMetadata}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
              isSaved
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>저장됨</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>저장</span>
              </>
            )}
          </button>
        </div>

        {/* 메타데이터 입력 폼 */}
        <form onSubmit={handleSaveMetadata} className="space-y-3">
          <h4 className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            메타 데이터 (EPUB 정보)
          </h4>

          {/* 제목 */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <span>책 제목</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="책 제목 입력"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* 저자 */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>저자</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="저자 이름"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* 언어 선택 */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>언어</span>
            </label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            >
              <option value="ko">한국어 (ko)</option>
              <option value="en">English (en)</option>
              <option value="ja">日本語 (ja)</option>
            </select>
          </div>

          {/* 책 설명 */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <AlignLeft className="w-3 h-3 text-slate-400" />
              <span>책 소개/설명</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="EPUB 패키지에 포함될 간단한 책 소개"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 resize-none leading-relaxed"
            />
          </div>
        </form>

        <hr className="border-slate-200/80" />

        {/* 다운로드 대상 요약 & 구조 미리보기 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
              구성 콘텐츠 요약
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold border border-blue-100">
              EPUB 패키징 대상
            </span>
          </div>

          {/* 요약 뱃지 카운트 */}
          <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded text-amber-600">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">총 챕터</div>
                <div className="font-bold text-slate-700">
                  {mockBookData.chaptersCount}개
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">총 문서</div>
                <div className="font-bold text-slate-700">
                  {mockBookData.documentsCount}개
                </div>
              </div>
            </div>
          </div>

          {/* 목차 구조 미리보기 아코디언 */}
          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              className="w-full px-3 py-2 bg-slate-100/50 flex items-center justify-between text-slate-700 font-medium hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                목차 미리보기
              </span>
              {isPreviewExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isPreviewExpanded && (
              <div className="p-2 space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {mockBookData.chapters.map((chap) => (
                  <div key={chap.id} className="pt-1.5 first:pt-0 space-y-1">
                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{chap.title}</span>
                    </div>
                    <div className="pl-4 space-y-0.5">
                      {chap.docs.map((docTitle, idx) => (
                        <div
                          key={idx}
                          className="text-slate-500 flex items-center gap-1"
                        >
                          <FileText className="w-2.5 h-2.5 text-slate-300" />
                          <span className="truncate">{docTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== 2. 하단 고정 영역 (EPUB 다운로드 버튼) ==================== */}
      <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 space-y-2">
        <button
          onClick={handleDownloadEpub}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm transition"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>EPUB 파일 생성 중...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>EPUB 다운로드</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-400">
          표준 ePub 3.0 포맷으로 내보내집니다
        </p>
      </div>
    </aside>
  );
}
