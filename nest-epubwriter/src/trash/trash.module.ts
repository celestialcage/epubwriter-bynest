import { Module } from '@nestjs/common';
import { TrashController } from './trash.controller';
import { TrashService } from './trash.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Docu } from 'docu/docu.entity';
import { Folder } from 'folder/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Docu, Folder])],
  controllers: [TrashController],
  providers: [TrashService],
  exports: [TrashService],
})
export class TrashModule {}
