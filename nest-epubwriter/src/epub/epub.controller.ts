import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  StreamableFile,
} from '@nestjs/common';
import { EpubMetaDto, UpdateEpubMetaDto } from 'epub/dto/epub-metadata.dto';
import { EpubService } from 'epub/epub.service';
import { attachmentDisposition } from 'epub/utils/content-disposition';

// 임시 username
const userId = 'shabet';

@Controller()
export class EpubController {
  constructor(private readonly epubService: EpubService) {}
  // 메타데이터 조회
  @Get('folders/:id/metadata')
  async getEpubMetadata(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EpubMetaDto> {
    return this.epubService.getEpubMetadata(id, userId);
  }

  // 메타데이터 수정
  @Patch('folders/:id/metadata')
  async updateEpubMetadata(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEpubMetaDto,
  ): Promise<EpubMetaDto> {
    return this.epubService.updateEpubMetadata(id, dto, userId);
  }

  @Get('books/:id/epub')
  async downloadEpub(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { buffer, title } = await this.epubService.generateEpub(id, userId);

    return new StreamableFile(buffer, {
      type: 'application/epub+zip',
      disposition: attachmentDisposition(`${title}.epub`),
    });
  }
}
