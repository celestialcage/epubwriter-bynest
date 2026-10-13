import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Docu } from '../docu/docu.entity'; // 실제 경로로 (why?)
import { EpubService } from 'epub/epub.service';
import { UpdateFolderDto } from 'folder/dto/folder.request.dto';
import { Folder, FolderKind } from 'folder/folder.entity';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';

export interface CreateFolderParams {
  title: string;
  kind: FolderKind;
  parent: Folder | null;
  userId: string;
}

export interface CheckDuplicateParams {
  title: string;
  parentId: number | null;
  userId: string;
}

/** SQLite에 저장된 UTC 문자열('YYYY-MM-DD HH:MM:SS.SSS')을 Date로 */
function parseSqliteUtc(value: string): Date {
  return new Date(value.replace(' ', 'T') + 'Z');
}

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    @InjectRepository(Docu)
    private readonly docuRepository: Repository<Docu>,
    private readonly dataSource: DataSource,
  ) {}

  /** 1단 목록의 책들에 대해 bookId → 마지막 작업 시각 */
  async getBookLastEditedMap(topLevel: Folder[]): Promise<Map<number, Date>> {
    const books = topLevel.flatMap((f) =>
      f.kind === FolderKind.BOOK
        ? [f]
        : (f.children ?? []).filter((c) => c.kind === FolderKind.BOOK),
    );

    // 기본값: 책 자체의 updatedAt
    const result = new Map<number, Date>(books.map((b) => [b.id, b.updatedAt]));
    if (books.length === 0) return result; // IN () 은 SQL 에러라 미리 반환

    const rows = await this.docuRepository
      .createQueryBuilder('d')
      .innerJoin(Folder, 'c', 'c.id = d.chapterId AND c.deletedAt IS NULL')
      .select('c.parentId', 'bookId')
      .addSelect('MAX(d.updatedAt)', 'lastEditedAt')
      .where('c.parentId IN (:...bookIds)', {
        bookIds: books.map((b) => b.id),
      })
      .andWhere('d.deletedAt IS NULL')
      .groupBy('c.parentId')
      .getRawMany<{ bookId: number; lastEditedAt: string }>();

    for (const row of rows) {
      const docTime = parseSqliteUtc(row.lastEditedAt);
      const current = result.get(row.bookId);
      if (!current || docTime > current) result.set(row.bookId, docTime);
    }
    return result;
  }

  /**
   * 1. 시리즈, 책 리스트 조회
   */
  async getSeriesAndSingleBookList(userId: string): Promise<Folder[]> {
    const [seriesList, singleBookList] = await Promise.all([
      // Series + 바로 아래 Book
      this.folderRepository.find({
        where: {
          userId,
          kind: FolderKind.SERIES,
          parent: IsNull(), // null이면 TypeORM 오류나네...
        },
        relations: {
          children: true,
        },
        order: { sortOrder: 'ASC', children: { sortOrder: 'ASC' } },
      }),

      // Root에 있는 단독 Book
      this.folderRepository.find({
        where: {
          userId,
          kind: FolderKind.BOOK,
          parent: IsNull(),
        },
        order: { sortOrder: 'ASC' },
      }),
    ]);
    return [...seriesList, ...singleBookList];
  }

  /**
   * 2. 챕터, 문서 리스트 조회
   */
  async getChapterAndDocList(
    bookId: number,
    userId: string,
  ): Promise<Folder[]> {
    const exists = await this.existsFolder({
      folderId: bookId,
      kind: FolderKind.BOOK,
      userId,
    });

    if (!exists) {
      throw new NotFoundException(`책(ID: ${bookId})을 찾을 수 없습니다.`);
    }

    return this.folderRepository.find({
      where: {
        parentId: bookId,
        kind: FolderKind.CHAPTER,
        userId,
      },
      relations: {
        documents: true,
      },
      order: { sortOrder: 'ASC', documents: { sortOrder: 'ASC' } },
    });
  }

  /**
   * 1. 최상위 시리즈 생성
   */
  async createSeries(title: string, userId: string): Promise<Folder> {
    return this.dataSource.transaction(async (manager) => {
      await this.checkDuplicateTitleWithManager(manager, {
        userId,
        parentId: null,
        title,
      });

      return this.createFolderWithManager(manager, {
        title,
        kind: FolderKind.SERIES,
        parent: null,
        userId,
      });
    });
  }

  /**
   * 2. Book 생성
   */
  async createBook(
    title: string,
    parentSeriesId: number | null,
    userId: string,
  ): Promise<Folder> {
    return this.dataSource.transaction(async (manager) => {
      let parent: Folder | null = null;

      if (parentSeriesId != null) {
        parent = await manager.findOne(Folder, {
          where: { id: parentSeriesId, userId },
        });

        if (!parent) {
          throw new NotFoundException('부모 시리즈를 찾을 수 없습니다.');
        }

        if (parent.kind !== FolderKind.SERIES) {
          throw new BadRequestException(
            'Book은 Series 하위에만 생성할 수 있습니다.',
          );
        }
      }

      await this.checkDuplicateTitleWithManager(manager, {
        userId,
        parentId: parentSeriesId,
        title,
      });

      return this.createFolderWithManager(manager, {
        title,
        kind: FolderKind.BOOK,
        parent,
        userId,
      });
    });
  }

  /**
   * 3. Chapter 생성
   */
  async createChapter(
    title: string,
    parentBookId: number,
    userId: string,
  ): Promise<Folder> {
    return this.dataSource.transaction(async (manager) => {
      const parent = await manager.findOne(Folder, {
        where: { id: parentBookId, userId },
      });

      if (!parent) {
        throw new NotFoundException('부모 책을 찾을 수 없습니다.');
      }

      if (parent.kind !== FolderKind.BOOK) {
        throw new BadRequestException(
          'Chapter는 Book 하위에만 생성할 수 있습니다.',
        );
      }

      await this.checkDuplicateTitleWithManager(manager, {
        userId,
        parentId: parentBookId,
        title,
      });

      return this.createFolderWithManager(manager, {
        title,
        kind: FolderKind.CHAPTER,
        parent,
        userId,
      });
    });
  }

  /**
   * --- Private Helpers (EntityManager 사용) ---
   */
  private async createFolderWithManager(
    manager: EntityManager,
    { title, kind, parent, userId }: CreateFolderParams,
  ): Promise<Folder> {
    const parentId = parent ? parent.id : null;

    // 트랜잭션 내에서 다음 sortOrder 계산
    const nextSortOrder = await this.getNextSortOrderWithManager(
      manager,
      userId,
      parentId,
    );

    const folder = manager.create(Folder, {
      title,
      kind,
      userId,
      parentId: parent?.id ?? null, // parent 객체 대신 FK 값
      sortOrder: nextSortOrder,
    });

    return manager.save(folder);
  }

  private async getNextSortOrderWithManager(
    manager: EntityManager,
    userId: string,
    parentId: number | null,
  ): Promise<number> {
    const query = manager
      .createQueryBuilder(Folder, 'folder')
      .select('MAX(folder.sortOrder)', 'max')
      .where('folder.userId = :userId', { userId });

    if (parentId === null) {
      query.andWhere('folder.parentId IS NULL');
    } else {
      query.andWhere('folder.parentId = :parentId', { parentId });
    }

    const result = await query.getRawOne<{ max: number | null }>();

    return (result?.max ?? 0) + 1;
  }

  private async checkDuplicateTitleWithManager(
    manager: EntityManager,
    { userId, parentId, title }: CheckDuplicateParams,
  ): Promise<void> {
    const query = manager
      .createQueryBuilder(Folder, 'folder')
      .where('folder.userId = :userId', { userId })
      .andWhere('folder.title = :title', { title });

    if (parentId === null) {
      query.andWhere('folder.parentId IS NULL');
    } else {
      query.andWhere('folder.parentId = :parentId', { parentId });
    }

    const exists = await query.getExists();

    if (exists) {
      throw new ConflictException(
        `이미 동일한 이름(${title})의 폴더가 존재합니다.`,
      );
    }
  }

  // 폴더 이름 수정
  async updateFolderTitle(
    id: number,
    userId: string,
    title: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOneBy({
      id,
      userId,
    });

    if (!folder) {
      throw new NotFoundException('폴더를 찾을 수 없습니다.');
    }

    folder.title = title;

    return this.folderRepository.save(folder);
  }

  /**
   * 폴더 존재 여부 확인 메서드
   */
  async existsFolder({
    folderId,
    kind,
    userId,
  }: {
    folderId: number;
    kind: FolderKind;
    userId: string;
  }): Promise<boolean> {
    return await this.folderRepository.existsBy({ id: folderId, kind, userId });
  }

  /**
   * TODO: 순서 변경
   */
  async reorder() {}

  // TODO: 폴더 이동 다시 짜기 - user 검증, kind 검증 들어가야
  /**
   * 폴더 이동 (부모 변경)
   */
  async moveParent(
    folderId: number,
    newParentId: number,
    userId: string,
  ): Promise<Folder> {
    const folder = await this.folderRepository.findOneBy({
      id: folderId,
      userId,
    });
    if (!folder) throw new NotFoundException('폴더를 찾을 수 없습니다.');

    if (newParentId) {
      const newParent = await this.folderRepository.findOneBy({
        id: newParentId,
        userId,
      });
      if (!newParent)
        throw new NotFoundException('새 부모 폴더를 찾을 수 없습니다.');
      folder.parent = newParent;
    } else {
      folder.parent = null; // 최상위 루트 폴더로 이동
    }

    return await this.folderRepository.save(folder);
  }
}
