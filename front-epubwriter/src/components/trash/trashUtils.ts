import { Book, FileText, Folder, type LucideIcon } from "lucide-react";
import type { TrashItem } from "../../types/types";

export const KIND_STYLE: Record<
  TrashItem["kind"],
  { label: string; icon: LucideIcon; box: string }
> = {
  series: { label: "시리즈", icon: Folder, box: "bg-amber-50 text-amber-600" },
  book: { label: "책", icon: Book, box: "bg-blue-50 text-blue-600" },
  chapter: { label: "챕터", icon: Folder, box: "bg-slate-100 text-slate-500" },
  docu: { label: "문서", icon: FileText, box: "bg-slate-100 text-blue-500" },
};

/** 원래 있던 위치 한 줄 설명 */
export function contextOf(item: TrashItem): string {
  switch (item.kind) {
    case "series":
      return "시리즈";
    case "book":
      return item.seriesTitle ? `${item.seriesTitle} 시리즈` : "단일 책";
    case "chapter":
      return item.bookTitle;
    case "docu":
      return `${item.bookTitle} › ${item.chapterTitle}`;
  }
}

/** 휴지통 목록에서 이 항목의 '바로 위' 그룹 루트 찾기 (없으면 undefined) */
export function findParentRoot(
  item: TrashItem,
  all: TrashItem[],
): TrashItem | undefined {
  switch (item.kind) {
    case "book":
      return item.seriesId === null
        ? undefined
        : all.find((t) => t.kind === "series" && t.id === item.seriesId);
    case "chapter":
      return all.find((t) => t.kind === "book" && t.id === item.bookId);
    case "docu":
      return all.find((t) => t.kind === "chapter" && t.id === item.chapterId);
    case "series":
      return undefined;
  }
}

/** 영구 삭제 시 함께 사라지는, 휴지통에 따로 있는 바로 아래 항목들 */
export function findChildRoots(item: TrashItem, all: TrashItem[]): TrashItem[] {
  return all.filter((t) => t !== item && findParentRoot(t, [item]) === item);
}
