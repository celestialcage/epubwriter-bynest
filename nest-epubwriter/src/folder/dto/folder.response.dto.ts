import { SidebarDocuDto } from 'docu/dto/docu.response.dto';
import { Folder, FolderKind } from 'folder/folder.entity';

function maxDate(dates: Date[]): Date {
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

// 1단 책 DTO
export class SidebarBookDto {
  id!: number;
  title!: string;
  kind!: FolderKind.BOOK;
  sortOrder!: number;
  parentId!: number | null;
  lastEditedAt!: Date;

  // 팩토리 메서드: Entity -> ResponseDto 변환
  static from(
    entity: Folder,
    lastEditedAt: Date = entity.updatedAt,
  ): SidebarBookDto {
    if (entity.kind !== FolderKind.BOOK) {
      throw new Error(
        `SidebarBookDto로 변환할 수 없는 Folder입니다. kind=${entity.kind}`,
      );
    }

    const dto = new SidebarBookDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.sortOrder = entity.sortOrder;
    dto.parentId = entity.parentId;
    dto.lastEditedAt = lastEditedAt;

    return dto;
  }
}

// 1단 시리즈 Dto
export class SidebarSeriesDto {
  id!: number;
  title!: string;
  kind!: FolderKind.SERIES;
  sortOrder!: number;

  books!: SidebarBookDto[];

  lastEditedAt!: Date;

  static from(
    entity: Folder,
    lastEditedMap = new Map<number, Date>(),
  ): SidebarSeriesDto {
    if (entity.kind !== FolderKind.SERIES) {
      throw new Error(
        `SidebarSeriesDto로 변환할 수 없는 Folder입니다. kind=${entity.kind}`,
      );
    }

    const dto = new SidebarSeriesDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.sortOrder = entity.sortOrder;

    dto.books =
      entity.children
        ?.filter((child) => child.kind === FolderKind.BOOK) // sortOrder 조건이 안 걸려 있거나 예상치 못한 자식 들어왔을 경우를 위한... 거름이래
        .map((child) =>
          SidebarBookDto.from(child, lastEditedMap.get(child.id)),
        ) ?? [];

    dto.lastEditedAt = maxDate([
      entity.updatedAt,
      ...dto.books.map((b) => b.lastEditedAt),
    ]);

    return dto;
  }
}

export type FirstSidebarItemDto = SidebarSeriesDto | SidebarBookDto;

// 첫번째 사이드바 from 분기 안하려고 만든 메서드
export function toFirstSidebarItemDto(
  entity: Folder,
  lastEditedMap = new Map<number, Date>(),
): FirstSidebarItemDto {
  switch (entity.kind) {
    case FolderKind.SERIES:
      return SidebarSeriesDto.from(entity, lastEditedMap);

    case FolderKind.BOOK:
      return SidebarBookDto.from(entity, lastEditedMap.get(entity.id));

    default:
      throw new Error(
        `1단 사이드바에서 지원하지 않는 Folder kind입니다: ${entity.kind}`,
      );
  }
}

// 2단 챕터 dto
export class SidebarChapterDto {
  id!: number;
  title!: string;
  kind!: FolderKind.CHAPTER;
  sortOrder!: number;
  parentId!: number;

  docs!: SidebarDocuDto[];

  // 팩토리 메서드: Entity -> ResponseDto 변환
  static from(entity: Folder): SidebarChapterDto {
    if (entity.kind !== FolderKind.CHAPTER) {
      throw new Error(
        `SidebarChapterDto로 변환할 수 없는 Folder입니다. kind=${entity.kind}`,
      );
    }

    if (entity.parentId === null) {
      throw new Error(
        `SidebarChapterDto로 변환할 수 없습니다. Chapter의 parentId가 null입니다.`,
      );
    }

    const dto = new SidebarChapterDto();

    dto.id = entity.id;
    dto.title = entity.title;
    dto.kind = entity.kind;
    dto.sortOrder = entity.sortOrder;
    dto.parentId = entity.parentId;

    dto.docs =
      entity.documents?.map((child) => SidebarDocuDto.from(child)) ?? [];

    return dto;
  }
}

// epub 메타데이터
export class EpubMetaResponseDto {
  author!: string | null;
  publisher!: string | null;
  description!: string | null;
  language!: string;
}
