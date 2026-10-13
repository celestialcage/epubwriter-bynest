import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Docu } from 'docu/docu.entity';
import { Folder, FolderKind } from 'folder/folder.entity';
import { randomUUID } from 'node:crypto';
import {
  TrashBookDto,
  TrashChapterDto,
  TrashDocuDto,
  TrashItemDto,
  TrashSeriesDto,
} from 'trash/dto/trash.response.dto';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';

@Injectable()
export class TrashService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    @InjectRepository(Docu)
    private readonly docuRepository: Repository<Docu>,
  ) {}

  /**
   * 문서 단독 삭제
   */
  async moveDocumentToTrash(id: number, userId: string): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const docu = await em.findOne(Docu, {
        where: {
          id,
          deletedAt: IsNull(),
          chapter: {
            userId,
          },
        },
      });

      if (!docu) {
        throw new NotFoundException(`ID가 ${id}인 문서를 찾을 수 없습니다.`);
      }

      const result = await em.update(
        Docu,
        {
          id: docu.id,
          deletedAt: IsNull(),
        },
        {
          deletedAt: new Date(),
          deletedGroupId: randomUUID(),
        },
      );

      if (result.affected !== 1) {
        throw new NotFoundException(`ID가 ${id}인 문서를 찾을 수 없습니다.`);
      }
    });
  }

  /**
   * Chapter + 현재 활성 문서 삭제
   */
  async moveChapterToTrash(id: number, userId: string): Promise<void> {
    await this.moveFolderToTrash(id, FolderKind.CHAPTER, userId);
  }

  /**
   * Book + 현재 활성 Chapter/Docu 삭제
   */
  async moveBookToTrash(id: number, userId: string): Promise<void> {
    await this.moveFolderToTrash(id, FolderKind.BOOK, userId);
  }

  /**
   * Series + 현재 활성 Book/Chapter/Docu 삭제
   */
  async moveSeriesToTrash(id: number, userId: string): Promise<void> {
    await this.moveFolderToTrash(id, FolderKind.SERIES, userId);
  }

  /**
   * Series / Book / Chapter 공통 삭제 처리
   */
  private async moveFolderToTrash(
    id: number,
    kind: FolderKind,
    userId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const root = await this.findOwnedActiveFolderOrThrow(
        em,
        id,
        kind,
        userId,
      );

      const groupId = randomUUID();
      const deletedAt = new Date();

      const folders: Folder[] = [root];
      let chapters: Folder[] = [];

      switch (kind) {
        case FolderKind.CHAPTER: {
          chapters = [root];
          break;
        }

        case FolderKind.BOOK: {
          chapters = await this.findActiveChildren(
            em,
            [root.id],
            FolderKind.CHAPTER,
            userId,
          );

          folders.push(...chapters);
          break;
        }

        case FolderKind.SERIES: {
          const books = await this.findActiveChildren(
            em,
            [root.id],
            FolderKind.BOOK,
            userId,
          );

          const chapterList = await this.findActiveChildren(
            em,
            books.map((book) => book.id),
            FolderKind.CHAPTER,
            userId,
          );

          folders.push(...books, ...chapterList);
          chapters = chapterList;

          break;
        }
      }

      const docs = await this.findActiveDocs(
        em,
        chapters.map((chapter) => chapter.id),
      );

      // 문서부터 표시
      if (docs.length > 0) {
        await em.update(
          Docu,
          {
            id: In(docs.map((doc) => doc.id)),
            deletedAt: IsNull(),
          },
          {
            deletedAt,
            deletedGroupId: groupId,
          },
        );
      }

      // Folder 전체에 같은 삭제 group 지정
      await em.update(
        Folder,
        {
          id: In(folders.map((folder) => folder.id)),
          deletedAt: IsNull(),
        },
        {
          deletedAt,
          deletedGroupId: groupId,
        },
      );
    });
  }

  private async findOwnedActiveFolderOrThrow(
    em: EntityManager,
    id: number,
    kind: FolderKind,
    userId: string,
  ): Promise<Folder> {
    const folder = await em.findOne(Folder, {
      where: {
        id,
        kind,
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!folder) {
      throw new NotFoundException(`${kind}(ID: ${id})를 찾을 수 없습니다.`);
    }

    return folder;
  }

  private async findActiveChildren(
    em: EntityManager,
    parentIds: number[],
    kind: FolderKind,
    userId: string,
  ): Promise<Folder[]> {
    if (parentIds.length === 0) {
      return [];
    }

    return em.find(Folder, {
      where: {
        parentId: In(parentIds),
        kind,
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  private async findActiveDocs(
    em: EntityManager,
    chapterIds: number[],
  ): Promise<Docu[]> {
    if (chapterIds.length === 0) {
      return [];
    }

    return em.find(Docu, {
      where: {
        chapterId: In(chapterIds),
        deletedAt: IsNull(),
      },
    });
  }

  async getTrashItems(userId: string): Promise<TrashItemDto[]> {
    const [folders, docs] = await Promise.all([
      this.folderRepository.find({
        where: {
          userId,
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
        relations: {
          parent: true,
        },
      }),

      this.docuRepository.find({
        where: {
          deletedAt: Not(IsNull()),
          chapter: {
            userId,
          },
        },
        withDeleted: true,
        relations: {
          chapter: {
            parent: true,
          },
        },
      }),
    ]);

    // Folder 중 삭제 그룹의 root만
    const rootFolders = folders.filter(
      (folder) =>
        folder.parent == null ||
        folder.parent.deletedGroupId !== folder.deletedGroupId,
    );

    // Docu가 독립적으로 삭제된 경우만
    // Chapter와 같은 group이면 Chapter에 딸려 삭제된 문서이므로 숨김
    const rootDocs = docs.filter(
      (doc) => doc.chapter?.deletedGroupId !== doc.deletedGroupId,
    );

    const folderDtos: TrashItemDto[] = rootFolders.map((folder) => {
      switch (folder.kind) {
        case FolderKind.SERIES:
          return TrashSeriesDto.from(folder);

        case FolderKind.BOOK:
          return TrashBookDto.from(folder);

        case FolderKind.CHAPTER:
          return TrashChapterDto.from(folder);

        default:
          throw new Error(
            `지원하지 않는 휴지통 Folder kind입니다: ${folder.kind}`,
          );
      }
    });

    const docDtos: TrashItemDto[] = rootDocs.map((doc) =>
      TrashDocuDto.from(doc),
    );

    return [...folderDtos, ...docDtos].sort(
      (a, b) => b.deletedAt.getTime() - a.deletedAt.getTime(),
    );
  }

  // 그룹의 폴더와 문서를 불러오고, 내 것이 아니면 404
  private async loadGroup(em: EntityManager, groupId: string, userId: string) {
    const folders = await em.find(Folder, {
      where: { deletedGroupId: groupId, userId },
      withDeleted: true,
      relations: { parent: true },
    });

    const docs = await em.find(Docu, {
      where: { deletedGroupId: groupId, chapter: { userId } },
      withDeleted: true,
      relations: { chapter: true },
    });

    if (folders.length === 0 && docs.length === 0) {
      throw new NotFoundException(`휴지통에서 항목을 찾을 수 없습니다.`);
    }

    return { folders, docs };
  }

  async restoreGroup(groupId: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const { folders, docs } = await this.loadGroup(em, groupId, userId);

      // 루트 = 부모가 같은 그룹이 아닌 항목. 루트의 부모가 살아 있어야 복원 가능
      const rootFolder = folders.find(
        (f) => f.parent?.deletedGroupId !== groupId,
      );
      const parentAlive = rootFolder
        ? rootFolder.parent == null || rootFolder.parent.deletedAt === null
        : docs[0].chapter?.deletedAt === null; // 문서 단독 그룹

      if (!parentAlive) {
        throw new ConflictException(
          '상위 항목이 휴지통에 있습니다. 상위 항목을 먼저 복원하세요.',
        );
      }

      const restored = { deletedAt: null, deletedGroupId: null };
      if (folders.length > 0) {
        await em.update(Folder, { id: In(folders.map((f) => f.id)) }, restored);
      }
      if (docs.length > 0) {
        await em.update(Docu, { id: In(docs.map((d) => d.id)) }, restored);
      }
    });
  }

  async hardDeleteGroup(groupId: string, userId: string): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      const { folders, docs } = await this.loadGroup(em, groupId, userId); // 소유 검증

      // 같은 삭제 그룹 내에서 부모가 같은 group이 아닌 Folder가 root
      const rootFolders = folders.filter(
        (folder) =>
          folder.parent == null || folder.parent?.deletedGroupId !== groupId,
      );

      if (rootFolders.length > 1) {
        throw new ConflictException(
          `삭제 그룹(${groupId})에 루트 폴더가 여러 개 존재합니다.`,
        );
      }

      if (rootFolders.length === 1) {
        const rootFolder = rootFolders[0];

        // DB의 ON DELETE CASCADE가
        // 모든 하위 Folder + Docu를 실제 DELETE
        await em.delete(Folder, {
          id: rootFolder.id,
          userId,
        });

        return;
      }

      // Folder root가 없다면 독립적으로 삭제된 Docu 그룹
      const rootDocs = docs.filter(
        (doc) => doc.chapter?.deletedGroupId !== groupId,
      );

      if (rootDocs.length !== 1) {
        throw new ConflictException(
          `삭제 그룹(${groupId})의 루트 문서를 결정할 수 없습니다.`,
        );
      }

      await em.delete(Docu, {
        id: rootDocs[0].id,
      });
    });
  }
}
