import { create } from "zustand";
import type { Id } from "../types/types";

export type UnsavedScope = "book" | "page";

export interface UnsavedEntry {
  scope: UnsavedScope;
  pathname: string; // 등록 당시 경로 (page 범위용)
  bookId: Id | null; // 등록 당시 책 (book 범위용)
}

export const UNSAVED_KEYS = {
  bookMetadata: "book-metadata",
  documentForm: "document-form",
} as const;

interface UnsavedState {
  entries: Record<string, UnsavedEntry>;
  register: (key: string, entry: UnsavedEntry) => void;
  unregister: (key: string) => void;
}

export const useUnsavedStore = create<UnsavedState>()((set) => ({
  entries: {},
  register: (key, entry) =>
    set((s) => ({ entries: { ...s.entries, [key]: entry } })),
  unregister: (key) =>
    set((s) => {
      const { [key]: _removed, ...rest } = s.entries;
      return { entries: rest };
    }),
}));
