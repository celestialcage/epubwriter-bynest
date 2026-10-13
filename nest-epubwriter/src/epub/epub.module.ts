import { Module } from '@nestjs/common';
import { EpubService } from './epub.service';
import { EpubController } from './epub.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from 'folder/folder.entity';
import { FolderModule } from 'folder/folder.module';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])],
  providers: [EpubService],
  exports: [EpubService],
  controllers: [EpubController],
})
export class EpubModule {}
