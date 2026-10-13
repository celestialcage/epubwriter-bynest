import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docu } from 'docu/docu.entity';
import { EpubModule } from 'epub/epub.module';
import { Folder } from 'folder/folder.entity';
import { FolderService } from 'folder/folder.service';
import { TrashModule } from 'trash/trash.module';
import { FolderController } from './folder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, Docu]), TrashModule],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService, TypeOrmModule], // 다른 모듈에서 쓸 수 있게 export
})
export class FolderModule {}
