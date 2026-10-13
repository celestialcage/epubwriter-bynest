import type {
  Chapter,
  CreateBookBody,
  CreateChapterBody,
  CreateSeriesBody,
  FolderMetadata,
  Id,
  LibraryBook,
  LibraryItem,
  LibrarySeries,
  UpdateMetadataBody,
} from "../types/types";
import { api } from "./client";

// export interface Folder {
//   id: number;
//   name: string;
//   kind: "series" | "book" | "chapter";
//   sortOrder: number;
//   parentId?: number | null;
//   createdAt: string;
//   updatedAt: string;
// }

// 첫번째 사이드바 조회
export const getLibraryApi = () => api<LibraryItem[]>("/library");

// 두번째 사이드바 조회
export const getChaptersApi = (bookId: Id) =>
  api<Chapter[]>(`/books/${bookId}/chapters`);

// 시리즈 삭제
export const deleteSeriesApi = (id: Id) =>
  api<void>(`/series/${id}`, { method: "DELETE" });

// 책 삭제
export const deleteBookApi = (id: Id) =>
  api<void>(`/books/${id}`, { method: "DELETE" });

// 챕터 삭제
export const deleteChapterApi = (id: Id) =>
  api<void>(`/chapters/${id}`, { method: "DELETE" });

// 생성
export const createSeriesApi = (body: CreateSeriesBody) =>
  api<LibrarySeries>("/series", { method: "POST", body: JSON.stringify(body) });

export const createBookApi = (body: CreateBookBody) =>
  api<LibraryBook>("/books", { method: "POST", body: JSON.stringify(body) });

export const createChapterApi = (body: CreateChapterBody) =>
  api<Chapter>("/chapters", { method: "POST", body: JSON.stringify(body) });

// 메타 데이터
export const getMetadataApi = (folderId: Id) =>
  api<FolderMetadata>(`/folders/${folderId}/metadata`);

export const updateMetadataApi = ({
  folderId,
  ...body
}: UpdateMetadataBody & { folderId: Id }) =>
  api<FolderMetadata>(`/folders/${folderId}/metadata`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

// 폴더 이름 바꾸기
export const renameFolderApi = ({ id, title }: { id: Id; title: string }) =>
  api<LibraryItem | Chapter>(`/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
