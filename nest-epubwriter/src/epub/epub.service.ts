import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import epub, { Chapter, Options } from 'epub-gen-memory';
import {
  EpubMetaDto,
  ResolvedEpubMetaDto,
  UpdateEpubMetaDto,
} from 'epub/dto/epub-metadata.dto';
import { Folder, FolderKind } from 'folder/folder.entity';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { Repository } from 'typeorm';

@Injectable()
export class EpubService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  private readonly logger = new Logger(EpubService.name);

  // epub metadata 조회
  async getEpubMetadata(
    folderId: number,
    userId: string,
  ): Promise<EpubMetaDto> {
    const folder = await this.folderRepository.findOneBy({
      id: folderId,
      userId,
    });

    if (!folder) {
      throw new NotFoundException('폴더를 찾을 수 없습니다.');
    }

    if (folder.kind !== FolderKind.SERIES && folder.kind !== FolderKind.BOOK) {
      throw new BadRequestException(
        'SERIES 혹은 BOOK 폴더에서만 EPUB 메타데이터를 조회할 수 있습니다.',
      );
    }

    const resolved = await this.resolveEpubMetadata(folder, userId);

    return {
      title: folder.title,
      author: folder.author,
      publisher: folder.publisher,
      description: folder.description,
      language: folder.language,
      resolved,
    };
  }

  async updateEpubMetadata(
    id: number,
    dto: UpdateEpubMetaDto,
    userId: string,
  ): Promise<EpubMetaDto> {
    const folder = await this.folderRepository.findOneBy({
      id,
      userId,
    });

    if (!folder) {
      throw new NotFoundException('폴더를 찾을 수 없습니다.');
    }

    if (folder.kind !== FolderKind.BOOK && folder.kind !== FolderKind.SERIES) {
      throw new BadRequestException(
        'SERIES 혹은 BOOK 폴더에서만 EPUB 메타데이터를 수정할 수 있습니다.',
      );
    }

    if (dto.author !== undefined) {
      folder.author = dto.author;
    }

    if (dto.publisher !== undefined) {
      folder.publisher = dto.publisher;
    }

    if (dto.description !== undefined) {
      folder.description = dto.description;
    }

    if (dto.language !== undefined) {
      folder.language = dto.language;
    }

    await this.folderRepository.save(folder);

    return this.getEpubMetadata(folder.id, userId);
  }

  private async resolveEpubMetadata(
    folder: Folder,
    userId: string,
  ): Promise<ResolvedEpubMetaDto> {
    if (folder.kind === FolderKind.SERIES) {
      return {
        title: folder.title,
        author: folder.author ?? 'unknown author',
        publisher: folder.publisher ?? '',
        description: folder.description ?? '',
        language: folder.language ?? 'ko',
      };
    }

    if (folder.kind === FolderKind.BOOK) {
      const series = folder.parentId
        ? await this.folderRepository.findOneBy({
            id: folder.parentId,
            userId,
            kind: FolderKind.SERIES,
          })
        : null;

      return {
        title: folder.title,
        author: folder.author ?? series?.author ?? 'unknown author',
        publisher: folder.publisher ?? series?.publisher ?? '',
        description: folder.description ?? series?.description ?? '',
        language: folder.language ?? series?.language ?? 'ko',
      };
    }

    throw new BadRequestException(
      'SERIES 혹은 BOOK 폴더에서만 EPUB 메타데이터를 사용할 수 있습니다.',
    );
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 본문 첫 헤딩이 "# 문서제목"과 같으면 제거 (## 이하는 건드리지 않음)
  private stripLeadingTitleHeading(markdown: string, title: string): string {
    const match = markdown.match(/^\s*#\s+(.+?)\s*#*\s*(?:\r?\n|$)/);
    if (match && match[1].trim() === title.trim()) {
      return markdown.slice(match[0].length);
    }
    return markdown;
  }

  private markdownToEpubHtml(markdown: string): string {
    const html = marked.parse(markdown, {
      async: false,
      breaks: true,
    }) as string;

    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
    });
  }

  async generateEpub(
    bookId: number,
    userId: string,
  ): Promise<{ buffer: Buffer; title: string }> {
    const book = await this.folderRepository.findOne({
      where: {
        id: bookId,
        userId,
        kind: FolderKind.BOOK,
      },
      relations: { children: { documents: true } },
      order: {
        children: { sortOrder: 'ASC', documents: { sortOrder: 'ASC' } },
      },
    });

    if (!book) {
      throw new NotFoundException('책을 찾을 수 없습니다.');
    }

    const chapters = book.children ?? [];
    if (chapters.length === 0) {
      throw new BadRequestException(
        '챕터가 없는 책은 EPUB으로 만들 수 없습니다.',
      );
    }

    const metadata = await this.resolveEpubMetadata(book, userId);

    // 챕터 표지 섹션 → 그 챕터의 문서 섹션들 순서로 평평하게 나열
    const sections: Chapter[] = [];
    for (const chapter of chapters) {
      sections.push({
        title: chapter.title,
        content: `<div class="chapter-cover"><h1 class="chapter-title">${this.escapeHtml(chapter.title)}</h1></div>`,
      });

      for (const doc of chapter.documents ?? []) {
        const body = this.stripLeadingTitleHeading(
          doc.content ?? '',
          doc.title,
        );
        sections.push({
          title: doc.title,
          content:
            `<h1 class="doc-title">${this.escapeHtml(doc.title)}</h1>` +
            this.markdownToEpubHtml(body),
        });
      }
    }

    // 2. epub-gen-memory 옵션 설정
    const options: Options = {
      title: book.title,
      author: metadata.author,
      publisher: metadata.publisher,
      description: metadata.description,
      lang: metadata.language,
      version: 3, // EPUB 3.0 Standard
      ignoreFailedDownloads: true, // 이미지 다운로드 실패 시 전체 에러 대신 빈 이미지로 대체
      prependChapterTitles: false, // 제목은 위에서 직접 넣음
      numberChaptersInTOC: false, // 표지와 문서가 섞여 번호가 어색해지므로 끔
      css: `
      body { font-family: sans-serif; line-height: 1.7; }
      .chapter-cover { margin-top: 30%; text-align: center; }
      .chapter-title { font-size: 2em; }
      .doc-title { font-size: 1.5em; margin-bottom: 1em; }
    `,
    };

    try {
      // epub 함수 호출 (Promise<Buffer> 반환)
      const buffer = await epub(options, sections);
      return { buffer, title: book.title };
    } catch (error) {
      this.logger.error('EPUB 생성 실패', error);
      throw new InternalServerErrorException(
        'EPUB 파일 생성 중 오류가 발생했습니다.',
      );
    }
  }
}
