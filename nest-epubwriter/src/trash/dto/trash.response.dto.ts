import { Docu } from 'docu/docu.entity';
import { Folder, FolderKind } from 'folder/folder.entity';

export class TrashDocuDto {
  id!: number;
  title!: string;

  // FolderKind에는 DOCUMENT가 없으니까 literal 사용
  kind!: 'docu';

  deletedAt!: Date;
  deletedGroupId!: string;

  chapterId!: number;
  chapterTitle!: string;
  bookTitle!: string;

  static from(entity: Docu): TrashDocuDto {
    if (entity.deletedAt === null) {
      throw new Error(`휴지통에 없는 문서입니다.`);
    }

    if (!entity.chapter) {
      throw new Error(
        `휴지통 문서(ID: ${entity.id})의 Chapter relation이 없습니다.`,
      );
    }

    if (!entity.chapter.parent) {
      throw new Error(
        `Chapter(ID: ${entity.chapter.id})가 Book에 소속되어 있지 않습니다.`,
      );
    }

    if (!entity.deletedGroupId) {
      throw new Error(
        `휴지통 문서(ID: ${entity.id})의 deletedGroupId가 없습니다.`,
      );
    }

    const dto = new TrashDocuDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = 'docu';

    dto.chapterId = entity.chapterId;
    dto.chapterTitle = entity.chapter.title;
    dto.bookTitle = entity.chapter.parent.title;

    dto.deletedAt = entity.deletedAt;
    dto.deletedGroupId = entity.deletedGroupId;

    return dto;
  }
}

export class TrashChapterDto {
  id!: number;
  title!: string;
  kind!: FolderKind.CHAPTER;
  deletedAt!: Date;
  deletedGroupId!: string;

  bookId!: number;
  bookTitle!: string;

  static from(entity: Folder): TrashChapterDto {
    if (entity.kind !== FolderKind.CHAPTER) {
      throw new Error(
        `TrashChapterDto로 변환할 수 없습니다. kind=${entity.kind}`,
      );
    }

    if (entity.deletedAt === null) {
      throw new Error('휴지통에 없는 챕터입니다.');
    }

    if (!entity.deletedGroupId) {
      throw new Error(
        `휴지통 챕터(ID: ${entity.id})의 deletedGroupId가 없습니다.`,
      );
    }

    if (!entity.parent) {
      throw new Error(
        `Chapter(ID: ${entity.id})의 부모 Book relation이 없습니다.`,
      );
    }

    const dto = new TrashChapterDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.deletedAt = entity.deletedAt;
    dto.deletedGroupId = entity.deletedGroupId;

    dto.bookId = entity.parent.id;
    dto.bookTitle = entity.parent.title;

    return dto;
  }
}

export class TrashBookDto {
  id!: number;
  title!: string;
  kind!: FolderKind.BOOK;
  deletedAt!: Date;
  deletedGroupId!: string;

  // 단독 Book이면 null
  seriesId!: number | null;
  seriesTitle!: string | null;

  static from(entity: Folder): TrashBookDto {
    if (entity.kind !== FolderKind.BOOK) {
      throw new Error(`TrashBookDto로 변환할 수 없습니다. kind=${entity.kind}`);
    }

    if (entity.deletedAt === null) {
      throw new Error('휴지통에 없는 책입니다.');
    }

    if (!entity.deletedGroupId) {
      throw new Error(
        `휴지통 책(ID: ${entity.id})의 deletedGroupId가 없습니다.`,
      );
    }

    const dto = new TrashBookDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.deletedAt = entity.deletedAt;
    dto.deletedGroupId = entity.deletedGroupId;

    dto.seriesId = entity.parent?.id ?? null;
    dto.seriesTitle = entity.parent?.title ?? null;

    return dto;
  }
}

export class TrashSeriesDto {
  id!: number;
  title!: string;
  kind!: FolderKind.SERIES;
  deletedAt!: Date;
  deletedGroupId!: string;

  static from(entity: Folder): TrashSeriesDto {
    if (entity.kind !== FolderKind.SERIES) {
      throw new Error(
        `TrashSeriesDto로 변환할 수 없습니다. kind=${entity.kind}`,
      );
    }

    if (entity.deletedAt === null) {
      throw new Error('휴지통에 없는 시리즈입니다.');
    }

    if (!entity.deletedGroupId) {
      throw new Error(
        `휴지통 시리즈(ID: ${entity.id})의 deletedGroupId가 없습니다.`,
      );
    }

    const dto = new TrashSeriesDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.deletedAt = entity.deletedAt;
    dto.deletedGroupId = entity.deletedGroupId;

    return dto;
  }
}

export type TrashItemDto =
  TrashSeriesDto | TrashBookDto | TrashChapterDto | TrashDocuDto;
