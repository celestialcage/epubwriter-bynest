import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Id } from "../../types/types";
import { renameFolderApi, updateMetadataApi } from "../../services/folder";
import type { MetadataChanges } from "./useMetadataForm";
import { queryKeys } from "../../services/queryKeys";

export function useSaveMetadata(folderId: Id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, meta }: MetadataChanges) => {
      if (title !== undefined) await renameFolderApi({ id: folderId, title });
      if (Object.keys(meta).length > 0)
        await updateMetadataApi({ folderId, ...meta });
    },
    // 제목만 성공하고 메타데이터가 실패해도 화면은 실제 상태로 맞춰지게 onSettled
    onSettled: (_data, _error /*, { title }*/) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders }); // 이 폴더 + 상속받는 하위 책들
      // if (title !== undefined) // 조건 변화로 안 씀(최근 변경된 문서)
      queryClient.invalidateQueries({ queryKey: queryKeys.library }); // 1단 사이드바 제목
    },
  });
}
