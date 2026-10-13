import { useNavigate } from "react-router";
import type { DocSummary, Id } from "../../types/types";
import { useDeleteDocument } from "../../hooks/document/useDeleteDocument";
import { FileText, Trash2 } from "lucide-react";
import ItemMenu from "./ItemMenu";

interface Props {
  doc: DocSummary;
  bookId: Id;
  isActive: boolean;
}

export default function DocItem({ doc, bookId, isActive }: Props) {
  const navigate = useNavigate();
  const deleteDocument = useDeleteDocument();

  const handleDelete = () => {
    if (!confirm(`"${doc.title}" 문서를 휴지통으로 이동하시겠습니까?`)) return;
    deleteDocument.mutate({ id: doc.id, bookId, isSelected: isActive });
  };

  return (
    <div
      onClick={() => navigate(`/docu/books/${bookId}/docs/${doc.id}`)}
      className={`group relative flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition ${
        isActive
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <FileText
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
        />
        <span className="truncate">{doc.title}</span>
      </div>

      <ItemMenu
        actions={[
          {
            label: "문서 삭제",
            icon: Trash2,
            onClick: handleDelete,
            danger: true,
          },
        ]}
      />
    </div>
  );
}
