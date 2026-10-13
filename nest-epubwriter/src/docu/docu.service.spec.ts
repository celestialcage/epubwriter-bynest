import { Test, TestingModule } from '@nestjs/testing';
import { DocuService } from './docu.service';
import { Repository } from 'typeorm';
import { Docu } from 'docu/docu.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FolderService } from 'folder/folder.service';
import { NotFoundException } from '@nestjs/common';
import { CreateDocuRequest } from 'docu/dto/docu.request.dto';

// 1. Repository Mock 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

// 2. FolderService Mock 객체 정의
const createMockFolderService = () => ({
  existsFolder: jest.fn(),
});

describe('DocuService', () => {
  let service: DocuService;
  let docuRepository: MockRepository<Docu>;
  let folderService: ReturnType<typeof createMockFolderService>;

  // NestJS DI 컨테이너 구성
  beforeEach(async () => {
    // 테스트 모듈 구성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocuService,
        // ⬇️ 가짜 객체 (Mock)
        {
          provide: getRepositoryToken(Docu),
          useValue: createMockRepository(),
        },
        {
          provide: FolderService,
          useValue: createMockFolderService(),
        },
      ],
    }).compile();

    service = module.get<DocuService>(DocuService); // 테스트 대상(진짜 객체)
    docuRepository = module.get(getRepositoryToken(Docu));
    folderService = module.get(FolderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /* =========================================================================
   * 1. getDocumentById (단건 조회)
   * ========================================================================= */
  describe('getDocumentById', () => {
    // 성공 케이스
    it('문서가 존재하면 DocuResponse를 반환한다', async () => {
      // [Given] DB에서 조회될 가짜 엔티티 데이터 준비
      const mockDocu = {
        id: 1,
        title: '테스트 문서',
        content: '내용',
        folderId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        folder: null,
      } as Docu;

      // 가짜 메서드 리턴 설정
      // Spring의 given(repo.findOne(...)).willReturn(mockDocu) 와 동일!
      // async 함수이므로 mockResolvedValue(Promise 리턴)를 씁니다.
      docuRepository.findOne.mockResolvedValue(mockDocu);

      // [When] 테스트 대상 메서드 실행
      const result = await service.getDocumentById(1);

      // [Then] 검증 단계
      // 1. DocuService 내부에서 findOne이 올바른 인자({ where: { id: 1 }, ... })로 호출되었는가?
      expect(docuRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { folder: true },
      });
      // 2. 최종 리턴된 DTO 값이 예상한 값인가?
      expect(result.id).toBe(1);
      expect(result.title).toBe('테스트 문서');
    });

    // 예외 케이스
    it('문서가 존재하지 않으면 NotFoundException을 던진다', async () => {
      // [Given] DB 조회가 null을 반환하도록 설정
      docuRepository.findOne.mockResolvedValue(null);

      // [When & Then] 예외가 발생하는지 검증
      // Spring의 assertThatThrownBy(() -> service.getDocumentById(999)).isInstanceOf(...) 와 동일!
      await expect(service.getDocumentById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* =========================================================================
   * 2. createDocument (생성)
   * ========================================================================= */
  describe('createDocument', () => {
    it('folderId가 유효하고 문서 생성에 성공한다', async () => {
      // given
      const dto: CreateDocuRequest = {
        title: '새 문서',
        content: '본문',
        folderId: 10,
      };
    });
  });
});
