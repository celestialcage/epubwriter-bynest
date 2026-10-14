import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database:
    process.env.NODE_ENV === 'test'
      ? ':memory:'
      : (process.env.DB_PATH ??
        join(__dirname, '..', '..', 'db', 'epubwriter.sqlite')), // 실제 파일명으로
  enableWAL: process.env.NODE_ENV !== 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  entities: [],
  synchronize: true,
  autoLoadEntities: true,
};
