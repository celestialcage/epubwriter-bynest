import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { Docu } from 'docu/docu.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { typeORMTestConfig } from 'configs/typeorm.test.config';

describe('DocuController (e2e)', () => {
  let app: INestApplication;
  let docuRepository: Repository<Docu>;
  let existingDocuId: number;

  beforeAll(async () => {
    // 💡 테스트 성능을 위해 beforeAll 사용
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(TypeOrmModule) // 테스트용 memory db로 오버라이드 하려고
      .useModule(TypeOrmModule.forRoot(typeORMTestConfig))
      .compile();

    app = moduleFixture.createNestApplication();

    // 💡 실제 main.ts와 동일한 전역 파이프/설정이 있다면 반영해줍니다.
    // app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    // 👇 Repository를 직접 꺼내서 테스트 데이터 생성
    docuRepository = moduleFixture.get<Repository<Docu>>(
      getRepositoryToken(Docu),
    );

    const seeded = await docuRepository.save(
      docuRepository.create({
        title: '테스트 문서',
        content: '테스트 본문 내용입니다.',
        // folderId 등 필수 필드가 더 있다면 여기에 추가
      }),
    );
    existingDocuId = seeded.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /docu/:id/export/epub', () => {
    function binaryParser(res, callback) {
      res.setEncoding('binary');
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        callback(null, Buffer.from(data, 'binary'));
      });
    }

    it('지정한 문서 ID의 EPUB 파일 다운로드 요청 시 파일 스트림과 올바른 헤더를 반환해야 한다', async () => {
      const response = await request(app.getHttpServer())
        .get(`/docu/${existingDocuId}/export/epub`)
        .buffer() // buffer, parse 해야하는 이유 supertest가 epub 같이 모르는 content-type
        .parse(binaryParser) // 그냥 body 파싱 안하고 빈 객체로 남겨버려서
        .expect(200);

      // 1. MIME Type 헤더 검증
      expect(response.headers['content-type']).toContain(
        'application/epub+zip',
      );

      // 2. Content-Disposition 파일명 헤더 검증
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain(
        'filename*=UTF-8',
      );

      // 3. 반환된 데이터(Buffer)가 존재하고 비어있지 않은지 검증
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 문서 ID로 요청 시 404 에러를 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .get('/docu/999999/export/epub')
        .expect(404);
    });
  });
});
