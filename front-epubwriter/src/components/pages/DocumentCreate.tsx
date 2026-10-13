import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useSelectedBookId } from "../../hooks/useSelectedBookId";
import { createDocumentApi } from "../../services/document"; // POST API
import { getChaptersApi } from "../../services/folder";
import { queryKeys } from "../../services/queryKeys";
import { useSidebarStore } from "../../stores/sidebarStore";
import type { Id } from "../../types/types";
import Loading from "../common/Loading";
import DocumentForm from "../docu/DocumentForm";
import { SKIP_UNSAVED_GUARD } from "../../hooks/useUnsavedChangesGuard";

export default function DocumentCreate() {
  const bookId = useSelectedBookId();
  if (bookId === null)
    return <p className="text-sm text-slate-400">잘못된 주소예요.</p>;
  return <DocumentCreateForm bookId={bookId} />;
}

function DocumentCreateForm({ bookId }: { bookId: Id }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const expandChapter = useSidebarStore((s) => s.expandChapter);
  const [searchParams] = useSearchParams();
  const [chapterId, setChapterId] = useState<Id | null>(
    Number(searchParams.get("chapterId")) || null,
  );

  // 2단 사이드바와 같은 키라 대부분 캐시에서 바로 나옴
  const { data: chapters, isPending } = useQuery({
    queryKey: queryKeys.chapters(bookId),
    queryFn: () => getChaptersApi(bookId),
  });

  const create = useMutation({
    mutationFn: createDocumentApi,
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.document(created.id), created);
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
      expandChapter(created.chapterId);
      // replace: 뒤로가기로 빈 작성 폼에 다시 돌아오지 않게
      navigate(`/docu/books/${bookId}/docs/${created.id}`, {
        replace: true,
        state: SKIP_UNSAVED_GUARD,
      });
    },
  });

  const goBack = () =>
    navigate(`/docu/books/${bookId}`, { state: SKIP_UNSAVED_GUARD });

  if (isPending) return <Loading />;
  if (!chapters || chapters.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        문서를 넣을 챕터가 없어요. 왼쪽에서 챕터를 먼저 만들어주세요.
      </p>
    );
  }

  // 쿼리의 chapterId가 이 책의 챕터가 아니면 첫 챕터로
  const selectedChapterId = chapters.some((c) => c.id === chapterId)
    ? chapterId!
    : chapters[0].id;

  return (
    <DocumentForm
      meta={
        <>
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-600">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> 새 문서
          </span>
          <span>•</span>
          <select
            value={selectedChapterId}
            onChange={(e) => setChapterId(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 focus:outline-none focus:border-blue-400"
          >
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <span className="text-slate-400">에 저장됩니다</span>
        </>
      }
      backLabel="뒤로가기"
      submitLabel="저장하기"
      pendingLabel="생성 중..."
      footerHint="작성 후 상단의 [저장하기]를 누르세요"
      isPending={create.isPending}
      errorMessage={create.error?.message}
      onSubmit={(values) =>
        create.mutate({ ...values, chapterId: selectedChapterId })
      }
      onCancel={goBack}
    />
  );
}
