import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Docu } from 'docu/docu.entity';
import {
  CreateDocuRequest,
  UpdateDocuRequest,
} from 'docu/dto/docu.request.dto';
import { DocuResponseDto } from 'docu/dto/docu.response.dto';
import { FolderKind } from 'folder/folder.entity';
import { FolderService } from 'folder/folder.service';
import { Repository } from 'typeorm';

@Injectable()
export class DocuService {
  constructor(
    @InjectRepository(Docu)
    private readonly docuRepository: Repository<Docu>,
    private readonly folderService: FolderService,
  ) {}

  /**
   * 내부 헬퍼 ===========================================================
   */

  // 내 문서가 아니거나 휴지통에 있으면 404 (남의 문서 존재 여부도 노출하지 않음)
  // where에서 chapter 조건만 쓰고 relations는 로딩하지 않음 → chapterId 변경이 안전
  private async findOwnedOrThrow(id: number, userId: string): Promise<Docu> {
    const docu = await this.docuRepository.findOne({
      where: { id, chapter: { userId } },
    });
    if (!docu) {
      throw new NotFoundException(`ID가 ${id}인 문서를 찾을 수 없습니다.`);
    }
    return docu;
  }

  private async assertOwnedChapter(chapterId: number, userId: string) {
    const exists = await this.folderService.existsFolder({
      folderId: chapterId,
      kind: FolderKind.CHAPTER,
      userId,
    });

    if (!exists) {
      throw new NotFoundException(
        `챕터(ID: ${chapterId})가 존재하지 않습니다.`,
      );
    }
  }

  // 챕터의 맨 뒤 순서
  private async nextSortOrder(chapterId: number): Promise<number> {
    const max = await this.docuRepository.maximum('sortOrder', { chapterId });
    return (max ?? 0) + 1;
  }

  /**
   * 조회 / 생성 / 수정 ===========================================================
   */

  // 문서 단건 조회
  async getDocumentById(id: number, userId: string): Promise<DocuResponseDto> {
    return DocuResponseDto.from(await this.findOwnedOrThrow(id, userId));
  }

  // 문서 생성
  async createDocument(
    req: CreateDocuRequest,
    userId: string,
  ): Promise<DocuResponseDto> {
    // 1. chapterId가 넘어온 경우 실제 폴더 존재 여부 확인
    await this.assertOwnedChapter(req.chapterId, userId);

    // 요청 DTO를 통째로 create()에 넘기지 않고 필드를 명시
    // → 요청에 섞여 들어온 값(sortOrder, deletedAt 등)이 저장되는 걸 방지
    const docu = this.docuRepository.create({
      title: req.title,
      content: req.content ?? null,
      chapterId: req.chapterId,
      sortOrder: await this.nextSortOrder(req.chapterId),
    });

    return DocuResponseDto.from(await this.docuRepository.save(docu));
  }

  // 문서 수정
  async updateDocument(
    id: number,
    req: UpdateDocuRequest,
    userId: string,
  ): Promise<DocuResponseDto> {
    const docu = await this.findOwnedOrThrow(id, userId);

    // 다른 챕터로 이동: 대상 챕터 검증 후 그 챕터의 맨 뒤로
    if (req.chapterId !== undefined && req.chapterId !== docu.chapterId) {
      await this.assertOwnedChapter(req.chapterId, userId);
      docu.chapterId = req.chapterId;
      docu.sortOrder = await this.nextSortOrder(req.chapterId);
    }

    if (req.title !== undefined) docu.title = req.title;
    if (req.content !== undefined) docu.content = req.content;

    return DocuResponseDto.from(await this.docuRepository.save(docu));
  }
}
