import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Id } from "../../types/types";
import { useNavigate } from "react-router";
import { deleteDocumentApi } from "../../services/document";
import { queryKeys } from "../../services/queryKeys";

interface DeleteDocumentVars {
  id: Id;
  bookId: Id;
  isSelected: boolean; // 지금 보고 있는 문서인지
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id }: DeleteDocumentVars) => deleteDocumentApi(id),
    onSuccess: (_data, { bookId, isSelected }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chapters(bookId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trash });
      queryClient.invalidateQueries({ queryKey: queryKeys.library });
      if (isSelected) navigate(`/docu/books/${bookId}`);
    },
  });
}
