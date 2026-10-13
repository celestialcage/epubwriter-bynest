import type { Id } from "../types/types";

export const queryKeys = {
  library: ["library"] as const,
  chapters: (bookId: Id) => ["books", bookId, "chapters"] as const,
  document: (id: Id) => ["documents", id] as const,
  trash: ["trash"] as const,
  folders: ["folders"] as const, // 모든 메타데이터 쿼리의 공통 접두어
  metadata: (folderId: Id) => ["folders", folderId, "metadata"] as const,
  allChapters: ["books"] as const, // 모든 책의 챕터 목록 쿼리 접두어
};
