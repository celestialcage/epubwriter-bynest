import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMTestConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: ':memory:', // 👈 메모리 DB
  dropSchema: true, // 매번 스키마 초기화
  entities: [],
  synchronize: true,
  autoLoadEntities: true,
};
