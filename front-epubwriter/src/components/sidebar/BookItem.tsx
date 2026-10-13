import { useNavigate } from "react-router";
import type { LibraryBook } from "../../types/types";
import { useDeleteFolder } from "../../hooks/useDeleteFolder";
import { Book, BookOpen, Trash2 } from "lucide-react";
import ItemMenu from "./ItemMenu";

interface Props {
  book: LibraryBook;
  isActive: boolean;
  nested?: boolean; // // 시리즈 하위 책이면 true
}

export default function BookItem({ book, isActive, nested = false }: Props) {
  const navigate = useNavigate();
  const deleteFolder = useDeleteFolder();
  const Icon = nested ? Book : BookOpen;

  const handleDelete = () => {
    if (!confirm(`"${book.title}" 책을 휴지통으로 이동하시겠습니까?`)) return;
    deleteFolder.mutate({
      kind: "book",
      id: book.id,
      containsSelected: isActive,
    });
  };

  return (
    <div
      onClick={() => navigate(`/docu/books/${book.id}`)}
      className={`group relative flex items-center justify-between px-2 py-1.5 cursor-pointer text-xs transition ${
        nested ? "rounded-md" : "rounded-lg"
      } ${
        isActive
          ? "bg-blue-100/80 text-blue-700 font-semibold"
          : nested
            ? "text-slate-600 hover:bg-slate-200/50"
            : "text-slate-700 hover:bg-slate-200/60"
      }`}
    >
      <div
        className={`flex items-center gap-2 min-w-0 ${nested ? "" : "ml-5"}`}
      >
        <Icon
          className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}
        />
        <span className="truncate">{book.title}</span>
      </div>
      <ItemMenu
        actions={[
          {
            label: "책 삭제",
            icon: Trash2,
            onClick: handleDelete,
            danger: true,
          },
        ]}
      />
    </div>
  );
}
