import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Id } from "../types/types";
import { useNavigate } from "react-router";
import {
  deleteBookApi,
  deleteChapterApi,
  deleteSeriesApi,
} from "../services/folder";
import { queryKeys } from "../services/queryKeys";

type DeleteFolderVars =
  | {
      kind: "series" | "book";
      id: Id;
      containsSelected: boolean; // 지금 보고 있는 책이 함께 지워지는지
    }
  | {
      kind: "chapter";
      id: Id;
      bookId: Id;
      containsSelected: boolean;
    };

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (vars: DeleteFolderVars) => {
      switch (vars.kind) {
        case "series":
          return deleteSeriesApi(vars.id);
        case "book":
          return deleteBookApi(vars.id);
        case "chapter":
          return deleteChapterApi(vars.id);
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trash });

      if (vars.kind === "chapter") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chapters(vars.bookId),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.library });
        if (vars.containsSelected) navigate(`/docu/books/${vars.bookId}`); // 보던 문서가 지워지면 책 화면으로
        return;
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.library });
      if (vars.containsSelected) navigate("/docu"); // 보던 책이 사라지면 빈 화면으로
    },
  });
}
