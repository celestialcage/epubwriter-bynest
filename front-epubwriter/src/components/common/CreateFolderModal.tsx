import { BookPlus, FolderPlus, ListPlus, Loader2, X } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import Modal from "./Modal";

type FolderKindName = "series" | "book" | "chapter";

// Tailwind는 소스에 "완성된 클래스 문자열"이 있어야 CSS를 만들어서,
// `bg-${color}-500`처럼 조합하면 안 되고 이렇게 통째로 적어둬야 해요.

const KIND_CONFIG = {
  series: {
    label: "시리즈",
    icon: FolderPlus,
    iconBox: "bg-amber-50 text-amber-600",
    input: "focus:ring-amber-500/20 focus:border-amber-500",
    button: "bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300",
    placeholder: "예: React & Modern Web 가이드",
  },
  book: {
    label: "책",
    icon: BookPlus,
    iconBox: "bg-blue-50 text-blue-600",
    input: "focus:ring-blue-500/20 focus:border-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300",
    placeholder: "예: TanStack Query 완전 정복",
  },
  chapter: {
    label: "챕터",
    icon: ListPlus,
    iconBox: "bg-slate-100 text-slate-600",
    input: "focus:ring-slate-500/20 focus:border-slate-500",
    button: "bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300",
    placeholder: "예: 1장. 시작하며",
  },
} as const;

interface Props {
  kind: FolderKindName;
  parentTitle?: string; // "OO 시리즈에 추가" 같은 안내용
  isPending: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export default function CreateFolderModal({
  kind,
  parentTitle,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const config = KIND_CONFIG[kind];
  const Icon = config.icon;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || isPending) return;
    onSubmit(title.trim());
  };

  return createPortal(
    <Modal onClose={onClose} disableClose={isPending}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-lg ${config.iconBox}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-800">
              새 {config.label} 만들기
            </h2>
            {parentTitle && (
              <p className="text-xs text-slate-400 truncate">
                {parentTitle}에 추가
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={isPending}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label
            htmlFor="folder-title"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {config.label} 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="folder-title"
            type="text"
            placeholder={config.placeholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition ${config.input}`}
            autoFocus
          />
          {errorMessage && (
            <p className="mt-1.5 text-xs text-red-500">{errorMessage}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition ${config.button}`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>생성하기</span>
          </button>
        </div>
      </form>
    </Modal>,
    document.body,
  );
}
