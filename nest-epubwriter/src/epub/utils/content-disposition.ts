export function attachmentDisposition(filename: string): string {
  // 파일 시스템에서 쓸 수 없는 문자와 제어 문자 제거
  const safe = filename.replace(/[\\/:*?"<>|\x00-\x1f]/g, '_');

  // filename: ASCII만 남기고, 다 사라지면 기본 이름
  const asciiBase = safe
    .replace(/\.epub$/, '')
    .replace(/[^\x20-\x7e]/g, '')
    .trim();
  const fallback = `${asciiBase || 'book'}.epub`;

  // filename*: encodeURIComponent가 남겨두는 ' ( ) * 까지 인코딩 (RFC 5987 규칙)
  const encoded = encodeURIComponent(safe).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}
