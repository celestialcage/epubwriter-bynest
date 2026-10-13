import { create } from "zustand";
import type { Id } from "../types/types";

interface SidebarState {
  expandedSeriesIds: Id[];
  toggleSeries: (id: Id) => void;
  expandSeries: (id: Id) => void;

  expandedChapterIds: Id[];
  toggleChapter: (id: Id) => void;
  expandChapter: (id: Id) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  expandedSeriesIds: [],
  toggleSeries: (id) =>
    set((s) => ({
      expandedSeriesIds: s.expandedSeriesIds.includes(id)
        ? s.expandedSeriesIds.filter((x) => x !== id)
        : [...s.expandedSeriesIds, id],
    })),
  expandSeries: (id) =>
    set((s) =>
      s.expandedSeriesIds.includes(id)
        ? s
        : { expandedSeriesIds: [...s.expandedSeriesIds, id] },
    ),

  expandedChapterIds: [],
  toggleChapter: (id) =>
    set((s) => ({
      expandedChapterIds: s.expandedChapterIds.includes(id)
        ? s.expandedChapterIds.filter((x) => x !== id)
        : [...s.expandedChapterIds, id],
    })),
  expandChapter: (id) =>
    set((s) =>
      s.expandedChapterIds.includes(id)
        ? s
        : { expandedChapterIds: [...s.expandedChapterIds, id] },
    ),
}));
