import { useSelectedBookId } from "../../hooks/useSelectedBookId";
import BookContentsSection from "./BookContentsSection";
import BookMetadataSection from "./BookMetadataSection";
import EpubDownloadSection from "./EpubDownloadSections";

export default function SidebarMetadata() {
  const bookId = useSelectedBookId();
  if (bookId === null) return null; // 책을 선택했을 때만 표시

  // key: 책이 바뀌면 입력 중이던 폼, 목차 펼침 상태 등을 초기화
  return (
    <aside
      key={bookId}
      className="w-[280px] h-full bg-slate-50 border-l border-slate-200 flex flex-col justify-between select-none text-xs"
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <BookMetadataSection bookId={bookId} />
        <hr className="border-slate-200/80" />
        <BookContentsSection bookId={bookId} />
      </div>
      <EpubDownloadSection bookId={bookId} />
    </aside>
  );
}
