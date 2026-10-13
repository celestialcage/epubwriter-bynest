import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateBookDto,
  CreateChapterDto,
  CreateSeriesDto,
  UpdateFolderDto,
} from 'folder/dto/folder.request.dto';
import {
  FirstSidebarItemDto,
  SidebarBookDto,
  SidebarChapterDto,
  SidebarSeriesDto,
  toFirstSidebarItemDto,
} from 'folder/dto/folder.response.dto';
import { FolderKind } from 'folder/folder.entity';
import { FolderService } from 'folder/folder.service';
import { TrashService } from 'trash/trash.service';

// 임시 username
const userId = 'shabet';

@Controller()
export class FolderController {
  constructor(
    private folderService: FolderService,
    private trashService: TrashService,
  ) {}

  // 1단 사이드바 조회 - 시리즈/단일 책 계층 리스트
  @Get('library')
  async getFirstSidebar(): Promise<FirstSidebarItemDto[]> {
    const folders = await this.folderService.getSeriesAndSingleBookList(userId);
    const lastEditedMap =
      await this.folderService.getBookLastEditedMap(folders);
    return folders.map((f) => toFirstSidebarItemDto(f, lastEditedMap));
  }

  // 2단 사이드바 조회 - 챕터/문서 계층 리스트
  @Get('books/:bookId/chapters')
  async getSecondSidebar(
    @Param('bookId', ParseIntPipe) bookId: number,
  ): Promise<SidebarChapterDto[]> {
    const folders = await this.folderService.getChapterAndDocList(
      bookId,
      userId,
    );
    return folders.map(SidebarChapterDto.from);
  }

  // 시리즈 생성 api
  @Post('series')
  // @UsePipes(ValidationPipe) // main.ts global pipe로 대체
  async createSeries(
    @Body() createSeriesDto: CreateSeriesDto,
  ): Promise<SidebarSeriesDto> {
    const series = await this.folderService.createSeries(
      createSeriesDto.title,
      userId,
    );
    return SidebarSeriesDto.from(series);
  }

  @Post('books')
  async createBook(
    @Body() createBookDto: CreateBookDto,
  ): Promise<SidebarBookDto> {
    const book = await this.folderService.createBook(
      createBookDto.title,
      createBookDto.parentSeriesId ?? null,
      userId,
    );

    return SidebarBookDto.from(book);
  }

  @Post('chapters')
  async createChapter(
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<SidebarChapterDto> {
    const chapter = await this.folderService.createChapter(
      createChapterDto.title,
      createChapterDto.parentBookId,
      userId,
    );

    return SidebarChapterDto.from(chapter);
  }

  // 이름 변경
  @Patch('folders/:id')
  async updateFolderTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFolderDto,
  ): Promise<SidebarSeriesDto | SidebarBookDto | SidebarChapterDto> {
    const folder = await this.folderService.updateFolderTitle(
      id,
      userId,
      dto.title,
    );

    switch (folder.kind) {
      case FolderKind.SERIES:
        return SidebarSeriesDto.from(folder);

      case FolderKind.BOOK:
        return SidebarBookDto.from(folder);

      case FolderKind.CHAPTER:
        return SidebarChapterDto.from(folder);

      default:
        throw new InternalServerErrorException(
          `지원하지 않는 폴더 종류입니다: ${folder.kind}`,
        );
    }
  }

  // 삭제 메서드들
  @Delete('series/:id')
  @HttpCode(204)
  async deleteSeries(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.trashService.moveSeriesToTrash(id, userId);
  }

  @Delete('books/:id')
  @HttpCode(204)
  async deleteBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.trashService.moveBookToTrash(id, userId);
  }

  @Delete('chapters/:id')
  @HttpCode(204)
  async deleteChapter(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.trashService.moveChapterToTrash(id, userId);
  }
  ㄴ;
}
