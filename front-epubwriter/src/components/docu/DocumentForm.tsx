import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { UNSAVED_KEYS } from "../../stores/unsavedStore";

export interface DocumentFormValues {
  title: string;
  content: string;
}

interface Props {
  initialValues?: DocumentFormValues;
  meta: ReactNode; // 툴바 아래 뱃지 줄 (생성: 챕터 선택, 수정: "수정 모드")
  backLabel: string;
  submitLabel: string;
  pendingLabel: string;
  footerHint: string;
  isPending: boolean;
  errorMessage?: string;
  onSubmit: (values: DocumentFormValues) => void;
  onCancel: () => void;
}

export default function DocumentForm({
  initialValues = { title: "", content: "" },
  meta,
  backLabel,
  submitLabel,
  pendingLabel,
  footerHint,
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isDirty =
    title !== initialValues.title || content !== initialValues.content;
  useUnsavedChanges(UNSAVED_KEYS.documentForm, isDirty, "page");

  const canSubmit = title.trim() !== "" && !isPending;

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), content });
  };

  // 제목에서 Enter → 저장 대신 본문으로 이동 (한글 조합 중 Enter는 무시)
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    contentRef.current?.focus();
  };

  // 취소/뒤로가기는 페이지 이동이 아닐 수도 있어서(수정 → 읽기 모드) 폼에서 직접 확인
  const handleCancel = () => {
    if (isDirty && !confirm("작성 중인 내용이 사라져요. 취소할까요?")) return;
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col gap-6 py-2">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition rounded-lg py-1 px-2 -ml-2 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg shadow-sm transition"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isPending ? pendingLabel : submitLabel}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        {meta}
      </div>
      {errorMessage && (
        <p className="text-xs text-red-500 -mt-4">{errorMessage}</p>
      )}

      {/* 제목 */}
      <Input
        placeholder="문서 제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        className="w-full text-2xl md:text-3xl font-bold placeholder:text-slate-300 text-slate-800 border-none bg-transparent focus:outline-none p-0 focus:ring-0"
        autoFocus
      />

      <hr className="border-slate-100 -my-2" />

      {/* 본문 */}
      <div className="flex-1">
        <TextArea
          ref={contentRef}
          placeholder="자유롭게 내용을 작성하세요..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full text-base text-slate-700 placeholder:text-slate-300 border-none bg-transparent focus:outline-none p-0 focus:ring-0 resize-none leading-relaxed"
        />
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
        <div>
          공백 포함 {content.length}자 | 공백 제외{" "}
          {content.replace(/\s+/g, "").length}자
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{footerHint}</span>
        </div>
      </div>
    </form>
  );
}
