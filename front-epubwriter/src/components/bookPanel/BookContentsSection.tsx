import { useState } from "react";
import type { Id } from "../../types/types";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import { getChaptersApi } from "../../services/folder";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  Sparkles,
} from "lucide-react";

export default function BookContentsSection({ bookId }: { bookId: Id }) {
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(true);
  const { data: chapters = [], isPending } = useQuery({
    queryKey: queryKeys.chapters(bookId),
    queryFn: () => getChaptersApi(bookId),
  });

  const docCount = chapters.reduce((sum, c) => sum + c.docs.length, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
          구성 콘텐츠 요약
        </h4>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-semibold border border-blue-100">
          EPUB 패키징 대상
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 rounded text-amber-600">
            <Folder className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400">총 챕터</div>
            <div className="font-bold text-slate-700">
              {isPending ? "-" : `${chapters.length}개`}
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
              {isPending ? "-" : `${docCount}개`}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPreviewExpanded((v) => !v)}
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
            {chapters.length === 0 ? (
              <p className="py-2 text-center text-slate-400">챕터가 없어요.</p>
            ) : (
              chapters.map((chap) => (
                <div key={chap.id} className="pt-1.5 first:pt-0 space-y-1">
                  <div className="font-semibold text-slate-700 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{chap.title}</span>
                  </div>
                  <div className="pl-4 space-y-0.5">
                    {chap.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="text-slate-500 flex items-center gap-1"
                      >
                        <FileText className="w-2.5 h-2.5 text-slate-300" />
                        <span className="truncate">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
