import { useQuery } from "@tanstack/react-query";
import { getDocumentApi } from "../../services/document";
import type { Id } from "../../types/types";
import { queryKeys } from "../../services/queryKeys";

export const useDocument = (id: Id) => {
  return useQuery({
    queryKey: queryKeys.document(id), // 캐시 키 (Redis의 Key 역할)
    queryFn: () => getDocumentApi(id), // actual fetch API
    // enabled: id > 0,
  });
};
