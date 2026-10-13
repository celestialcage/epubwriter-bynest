import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'configs/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocuModule } from './docu/docu.module';
import { FolderService } from './folder/folder.service';
import { FolderModule } from './folder/folder.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DocuCleanupService } from './docu/docu-cleanup.service';
import { EpubModule } from './epub/epub.module';
import { TrashModule } from './trash/trash.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    // 배포 환경에서만 등록: 개발 중엔 Vite가 프론트를 담당
    ...(isProduction
      ? [
          ServeStaticModule.forRoot({
            rootPath:
              process.env.CLIENT_DIST ??
              join(__dirname, '..', '..', 'front-epubwriter', 'dist'),
            exclude: ['/api/(.*)', '/api-docs(.*)'],
          }),
        ]
      : []),
    ScheduleModule.forRoot(), // 스케줄러 모듈 등록
    TypeOrmModule.forRoot(typeORMConfig),
    DocuModule,
    FolderModule,
    EpubModule,
    TrashModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
