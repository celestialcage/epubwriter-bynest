import { FolderPlus, Loader2, X } from "lucide-react";
import { useEffect, useState, type SyntheticEvent } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
  }) => void | Promise<void>;
}

export default function CreateSeriesModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // ESC 키 누르면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      // 상위 컴포넌트(또는 TanStack Query mutate)로 데이터 전달
      await onSubmit({ title, description });
      onClose();
    } catch (error) {
      console.error("시리즈 생성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. 모달 오버레이 (배경 어둡게)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      {/* 2. 모달 컨테이너 (클릭 시 이벤트 전파 방지) */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              새 시리즈 만들기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 시리즈 제목 입력 */}
          <div>
            <label
              htmlFor="series-title"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              시리즈 제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="series-title"
              type="text"
              required
              placeholder="예: React & Modern Web 가이드"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              autoFocus
            />
          </div>

          {/* 시리즈 설명 입력 (선택) */}
          <div>
            <label
              htmlFor="series-desc"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              설명 <span className="text-xs text-slate-400">(선택)</span>
            </label>
            <textarea
              id="series-desc"
              rows={3}
              placeholder="시리즈에 대한 간단한 설명을 입력하세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
            />
          </div>

          {/* 하단 버튼 영역 */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-lg shadow-sm transition"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>생성하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
