export type Id = number;

// ---------- 사이드바 ----------
export interface LibraryBook {
  id: Id;
  title: string;
  kind: "book";
  sortOrder: number;
  parentId: Id | null; // 단독 책이면 null
  lastEditedAt: string;
}

export interface LibrarySeries {
  id: Id;
  title: string;
  kind: "series";
  sortOrder: number;
  books: LibraryBook[];
  lastEditedAt: string;
}

export type LibraryItem = LibrarySeries | LibraryBook;

export interface DocSummary {
  id: Id;
  title: string;
  chapterId: Id;
}

export interface Chapter {
  id: Id;
  title: string;
  kind: "chapter";
  sortOrder: number;
  parentId: Id;
  docs: DocSummary[];
}

// ---------- 문서 ----------
export interface Docu {
  id: Id;
  title: string;
  content: string;
  chapterId: Id;
  createdAt: string; // ISO 문자열
  updatedAt: string;
}

// ---------- 메타데이터 ----------
export interface MetadataFields {
  author: string | null;
  publisher: string | null;
  description: string | null;
  language: string | null;
}

export interface FolderMetadata extends MetadataFields {
  title: string;
  resolved: { title: string } & { [K in keyof MetadataFields]: string };
  // resolved: { title: string } & Record<keyof MetadataFields, string>; // 위와 같은 의미
}

/** undefined = 변경 안 함, null = 값 지우기(상속으로 되돌리기) */
export type UpdateMetadataBody = Partial<MetadataFields>;

// ---------- 휴지통 ----------
interface TrashBase {
  id: Id;
  title: string;
  deletedAt: string;
  deletedGroupId: string;
}
export type TrashItem =
  | (TrashBase & { kind: "series" })
  | (TrashBase & {
      kind: "book";
      seriesId: Id | null;
      seriesTitle: string | null;
    })
  | (TrashBase & { kind: "chapter"; bookId: Id; bookTitle: string })
  | (TrashBase & {
      kind: "docu";
      chapterId: Id;
      chapterTitle: string;
      bookTitle: string;
    });

// dto?
export interface CreateDocumentBody {
  title: string;
  content?: string;
  chapterId: Id;
}

export interface UpdateDocumentBody {
  title?: string;
  content?: string;
  chapterId?: Id;
}

export interface CreateSeriesBody {
  title: string;
}
export interface CreateBookBody {
  title: string;
  parentSeriesId?: Id;
}
export interface CreateChapterBody {
  title: string;
  parentBookId: Id;
}
