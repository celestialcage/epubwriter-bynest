import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileEdit } from "lucide-react";
import { updateDocumentApi } from "../../services/document";
import { queryKeys } from "../../services/queryKeys";
import type { Docu, Id } from "../../types/types";
import DocumentForm from "./DocumentForm";

interface Props {
  doc: Docu;
  bookId: Id;
  onDone: () => void;
}

export default function DocumentEditor({ doc, bookId, onDone }: Props) {
  const queryClient = useQueryClient();

  const update = useMutation({
    mutationFn: updateDocumentApi,
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.document(doc.id), updated); // 응답으로 바로 캐시 교체
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(bookId) }); // 사이드바 제목 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
      onDone(); // 읽기 모드로 복귀
    },
  });

  return (
    <DocumentForm
      initialValues={{ title: doc.title, content: doc.content }}
      meta={
        <>
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md font-medium border border-amber-200/60">
            <FileEdit className="w-3.5 h-3.5 text-amber-600" /> 문서 수정 모드
          </span>
          <span>•</span>
          <span className="text-slate-400">저장하면 즉시 반영됩니다</span>
        </>
      }
      backLabel="읽기 모드로 돌아가기"
      submitLabel="저장하기"
      pendingLabel="저장 중..."
      footerHint="수정 완료 후 상단의 [저장하기]를 누르세요"
      isPending={update.isPending}
      errorMessage={update.error?.message}
      onSubmit={(values) => update.mutate({ id: doc.id, ...values })}
      onCancel={onDone}
    />
  );
}
