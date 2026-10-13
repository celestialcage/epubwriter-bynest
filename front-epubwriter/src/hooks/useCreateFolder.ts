import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Chapter, Id, LibraryBook, LibrarySeries } from "../types/types";
import { useNavigate } from "react-router";
import { useSidebarStore } from "../stores/sidebarStore";
import {
  createBookApi,
  createChapterApi,
  createSeriesApi,
} from "../services/folder";
import { queryKeys } from "../services/queryKeys";

export type CreateFolderVars =
  | { kind: "series"; title: string }
  | { kind: "book"; title: string; parentSeriesId?: Id }
  | { kind: "chapter"; title: string; parentBookId: Id };

type CreatedFolder = LibrarySeries | LibraryBook | Chapter;

export function useCreateFolder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const expandSeries = useSidebarStore((s) => s.expandSeries);
  const expandChapter = useSidebarStore((s) => s.expandChapter);

  return useMutation({
    mutationFn: (vars: CreateFolderVars): Promise<CreatedFolder> => {
      switch (vars.kind) {
        case "series":
          return createSeriesApi({ title: vars.title });
        case "book":
          return createBookApi({
            title: vars.title,
            parentSeriesId: vars.parentSeriesId,
          });
        case "chapter":
          return createChapterApi({
            title: vars.title,
            parentBookId: vars.parentBookId,
          });
      }
    },
    onSuccess: (created, vars) => {
      switch (vars.kind) {
        case "series":
          queryClient.invalidateQueries({ queryKey: queryKeys.library });
          expandSeries(created.id);
          break;
        case "book":
          queryClient.invalidateQueries({ queryKey: queryKeys.library });
          if (vars.parentSeriesId) expandSeries(vars.parentSeriesId);
          navigate(`/docu/books/${created.id}`); // 만든 책으로 바로 이동
          break;
        case "chapter":
          queryClient.invalidateQueries({
            queryKey: queryKeys.chapters(vars.parentBookId),
          });
          expandChapter(created.id); // 새 챕터를 펼쳐서 바로 문서를 추가할 수 있게
          break;
      }
    },
  });
}
