import type { Id } from "../types/types";
import { API_URL, toApiError } from "./client";

/** filename*=UTF-8''(한글 이름) 우선, 없으면 filename="(ASCII 이름)" */
function parseFilename(header: string | null): string | null {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8) return decodeURIComponent(utf8[1]);
  const ascii = header.match(/filename="?([^";]+)"?/i);
  return ascii?.[1] ?? null;
}

export async function downloadEpubApi(bookId: Id): Promise<void> {
  const res = await fetch(`${API_URL}/books/${bookId}/epub`);
  if (!res.ok) throw await toApiError(res);

  const blob = await res.blob();
  const filename =
    parseFilename(res.headers.get("Content-Disposition")) ?? "book.epub";

  // 임시 링크를 만들어 클릭해서 저장
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0); // 다운로드 시작 후 메모리 해제
}
