import { useState } from "react";
import { useDocument } from "../../hooks/document/useDocument";
import { useSelectedBookId } from "../../hooks/useSelectedBookId";
import { useSelectedDocId } from "../../hooks/useSelectedDocId";
import { ApiError } from "../../services/client";
import type { Id } from "../../types/types";
import Loading from "../common/Loading";
import DocumentDetail from "../docu/DocumentDetail";
import DocumentEditor from "../docu/DocumentEditor";

export default function DocumentPage() {
  const bookId = useSelectedBookId();
  const docId = useSelectedDocId();

  if (bookId === null || docId === null || Number.isNaN(docId)) {
    return <p className="text-sm text-slate-400">잘못된 주소예요.</p>;
  }

  // key: 문서가 바뀌면 수정 모드 등 내부 상태를 초기화
  return <DocumentView key={docId} bookId={bookId} docId={docId} />;
}

function DocumentView({ bookId, docId }: { bookId: Id; docId: Id }) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: doc, isPending, error } = useDocument(docId);

  if (isPending) return <Loading />;

  if (error) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <p className="text-sm text-slate-400">
        {notFound
          ? "문서를 찾을 수 없어요. 휴지통으로 이동되었을 수 있어요."
          : "문서를 불러오지 못했어요."}
      </p>
    );
  }

  return isEditing ? (
    <DocumentEditor
      doc={doc}
      bookId={bookId}
      onDone={() => setIsEditing(false)}
    />
  ) : (
    <DocumentDetail
      doc={doc}
      bookId={bookId}
      onEdit={() => setIsEditing(true)}
    />
  );
}
