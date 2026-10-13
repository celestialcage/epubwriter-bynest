import { Marked } from "marked";
import DOMPurify from "dompurify";

// 전역 marked.setOptions 대신 인스턴스를 만들어 두면 옵션이 다른 곳에 새지 않음
const md = new Marked({ breaks: true }); // 백엔드와 동일 옵션

/** 본문이 문서 제목과 같은 "# 제목"으로 시작하면 생략 (EPUB 생성 규칙과 동일) */
export function stripTitleHeading(content: string, title: string): string {
  const match = content.match(/^\s*#\s+(.+?)\s*(\r?\n|$)/);
  if (match && match[1].trim() === title.trim()) {
    return content.slice(match[0].length);
  }
  return content;
}

export function renderMarkdown(content: string): string {
  const html = md.parse(content, { async: false }) as string;
  return DOMPurify.sanitize(html);
}
