import {
  Clock,
  FileText,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDeleteDocument } from "../../hooks/document/useDeleteDocument";
import { renderMarkdown, stripTitleHeading } from "../../lib/markdown";
import type { Docu, Id } from "../../types/types";

interface Props {
  doc: Docu;
  bookId: Id;
  onEdit: () => void; // 수정 모드로 전환하는 함수
}

const DocumentDetail = ({ doc, bookId, onEdit }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteDocument = useDeleteDocument();

  const handleDelete = () => {
    setIsMenuOpen(false);
    if (!confirm(`"${doc.title}" 문서를 휴지통으로 이동하시겠습니까?`)) return;
    deleteDocument.mutate({ id: doc.id, bookId, isSelected: true });
  };

  // 메뉴 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contentText = doc.content;
  const html = useMemo(
    () => renderMarkdown(stripTitleHeading(contentText, doc.title)),
    [contentText, doc.title],
  );

  return (
    <div className="h-full min-h-0 flex flex-col gap-6 py-2 select-none">
      {/* 1. 상단 액션 툴바 (메타 뱃지 & 우측 더보기 메뉴) */}
      <div className="shrink-0 flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-600">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> 읽기 전용
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            최근 수정됨:{" "}
            {new Date(doc.updatedAt).toLocaleString("ko-KR", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        {/* 더보기 메뉴 버튼 (드롭다운) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            aria-label="더보기 메뉴"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* 드롭다운 메뉴 팝오버 */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>문서 수정</span>
              </button>

              <hr className="my-1 border-slate-100" />

              <button
                onClick={handleDelete}
                disabled={deleteDocument.isPending}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>휴지통으로 이동</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. 본문 리딩 영역 flex flex-col gap-4 */}
      <div className="flex-1 min-h-0 overflow-y-auto py-6">
        {/* 문서 제목 */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
          {doc.title}
        </h1>

        <hr className="border-slate-100 my-1" />

        {/* 문서 본문 내용 */}
        <div className="text-base text-slate-700 leading-relaxed select-text">
          {contentText ? (
            <div
              className="prose prose-slate max-w-none select-text"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <span className="text-slate-300 italic">
              작성된 내용이 없습니다.
            </span>
          )}
        </div>
      </div>
      {/* 3. 하단 유틸리티바 (글자 수 카운트) */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
        <div>
          공백 포함 {contentText.length}자 | 공백 제외{" "}
          {contentText.replace(/\s+/g, "").length}자
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>수정하려면 우측 상단의 메뉴를 클릭하세요</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
