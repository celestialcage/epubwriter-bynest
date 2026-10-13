import type {
  CreateDocumentBody,
  Docu,
  Id,
  UpdateDocumentBody,
} from "../types/types";
import { api } from "./client";

// // 공통 에러 핸들러 함수
// const handleResponse = async (res: Response) => {
//   if (!res.ok) {
//     const errorData = await res.json().catch(() => ({}));
//     throw new Error(errorData.message || "요청 처리 중 오류가 발생했습니다.");
//   }
//   return res.json();
// };

// 단건 조회
export const getDocumentApi = (id: Id) => api<Docu>(`/documents/${id}`);

// 문서 생성
export const createDocumentApi = async (body: CreateDocumentBody) =>
  api<Docu>("/documents", { method: "POST", body: JSON.stringify(body) });

// 문서 수정
export const updateDocumentApi = async ({
  id,
  ...body
}: UpdateDocumentBody & { id: Id }) =>
  api<Docu>(`/documents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

// 문서 삭제
export const deleteDocumentApi = async (id: Id) =>
  api<void>(`/documents/${id}`, { method: "DELETE" });
