import { Docu } from 'docu/docu.entity';

export class SidebarDocuDto {
  id!: number;
  title!: string;
  chapterId!: number;
  sortOrder!: number;

  static from(entity: Docu): SidebarDocuDto {
    const dto = new SidebarDocuDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.chapterId = entity.chapterId;
    dto.sortOrder = entity.sortOrder;

    return dto;
  }
}

export class DocuResponseDto {
  id!: number;
  title!: string;
  content!: string | null;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;
  // deletedAt?: Date;

  chapterId!: number;

  // Entity -> DTO 변환 정적 메서드
  static from(entity: Docu): DocuResponseDto {
    const response = new DocuResponseDto();
    response.id = entity.id;
    response.title = entity.title;
    response.content = entity.content ?? null;
    response.chapterId = entity.chapterId;
    response.sortOrder = entity.sortOrder;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;

    return response;
  }
}
