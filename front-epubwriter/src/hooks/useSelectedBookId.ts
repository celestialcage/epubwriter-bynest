import { useParams } from "react-router";
import type { Id } from "../types/types";

export function useSelectedBookId(): Id | null {
  const { bookId } = useParams();
  return bookId ? Number(bookId) : null;
}
