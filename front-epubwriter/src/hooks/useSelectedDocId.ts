import { useParams } from "react-router";
import type { Id } from "../types/types";

export function useSelectedDocId(): Id | null {
  const { docId } = useParams();
  return docId ? Number(docId) : null;
}
