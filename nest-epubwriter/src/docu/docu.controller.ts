import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  // Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
// import { Response } from 'express';
import { DocuService } from 'docu/docu.service';
import {
  CreateDocuRequest,
  UpdateDocuRequest,
} from 'docu/dto/docu.request.dto';
import { DocuResponseDto } from 'docu/dto/docu.response.dto';
import { TrashService } from 'trash/trash.service';

// 임시 username
const userId = 'shabet';

@Controller('documents')
export class DocuController {
  constructor(
    private docuService: DocuService,
    private trashService: TrashService,
  ) {}

  // // nest 방식
  // @Get(':id/export/epub')
  // @Header('Content-Type', 'application/epub+zip') // 👈 Express 없이 NestJS 어노테이션으로 헤더 설정
  // async downloadEpub(
  //   @Param('id', ParseIntPipe) id: number,
  // ): Promise<StreamableFile> {
  //   const { filename, buffer } =
  //     await this.docuService.exportDocumentToEpub(id);

  //   const encodedFilename = encodeURIComponent(filename);

  //   // StreamableFile을 사용하면 Header 및 Buffer 처리를 NestJS가 깔끔하게 해줌.
  //   return new StreamableFile(buffer, {
  //     type: 'application/epub+zip',
  //     disposition: `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
  //   });
  // }

  // express 방식
  // @Get(':id/export/epub')
  // async downloadEpubByExpress(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Res() res: Response,
  // ) {
  //   const { filename, buffer } =
  //     await this.docuService.exportDocumentToEpub(id);

  //   // Express 헤더 설정 (한글 파일명 깨짐 방지 encodeURIComponent 적용)
  //   const encodedFilename = encodeURIComponent(filename);

  //   res.setHeader('Content-Type', 'application/epub_zip');
  //   res.setHeader(
  //     'Content-Disposition',
  //     `attachment; filename="${encodedFilename}"; filename=UTF-8''${encodedFilename}`,
  //   );

  //   return res.send(buffer);
  // }

  // 단건 조회
  @Get(':id')
  getDocument(@Param('id', ParseIntPipe) id: number): Promise<DocuResponseDto> {
    return this.docuService.getDocumentById(id, userId);
  }

  // 문서 생성
  @Post()
  createDocument(
    @Body() docuRequest: CreateDocuRequest,
  ): Promise<DocuResponseDto> {
    return this.docuService.createDocument(docuRequest, userId);
  }

  // 문서 수정
  @Patch(':id')
  updateDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() docuRequest: UpdateDocuRequest,
  ): Promise<DocuResponseDto> {
    return this.docuService.updateDocument(id, docuRequest, userId);
  }

  // 문서 삭제
  @Delete(':id')
  @HttpCode(204)
  deleteDocument(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trashService.moveDocumentToTrash(id, userId);
  }
}
