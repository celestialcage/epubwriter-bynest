import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database:
    process.env.NODE_ENV === 'test' ? ':memory:' : 'db/epubwriter.sqlite',
  enableWAL: process.env.NODE_ENV !== 'test',
  dropSchema: process.env.NODE_ENV === 'test',
  entities: [],
  synchronize: true,
  autoLoadEntities: true,
};
