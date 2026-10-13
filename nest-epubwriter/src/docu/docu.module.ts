import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocuCleanupService } from 'docu/docu-cleanup.service';
import { Docu } from 'docu/docu.entity';
import { FolderModule } from 'folder/folder.module';
import { TrashModule } from 'trash/trash.module';
import { DocuController } from './docu.controller';
import { DocuService } from './docu.service';

@Module({
  imports: [TypeOrmModule.forFeature([Docu]), FolderModule, TrashModule],
  controllers: [DocuController],
  providers: [DocuService, DocuCleanupService],
})
export class DocuModule {}
