import { useSelectedBookId } from "../../hooks/useSelectedBookId";
import ChapterTree from "./ChapterTree";

export default function SidebarChildList() {
  const bookId = useSelectedBookId();

  if (bookId === null) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-slate-400 px-2">
        <p>왼쪽에서 책을 선택하면</p>
        <p className="mt-0.5">목차가 표시됩니다.</p>
      </div>
    );
  }

  // key: 책이 바뀌면 트리를 새로 만들어 이전 책의 상태가 남지 않게
  return <ChapterTree key={bookId} bookId={bookId} />;
}
