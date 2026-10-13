import { Test, TestingModule } from '@nestjs/testing';
import { DocuCleanupService } from '../docu-cleanup./docu/docu-cleanup.service';

describe('DocuCleanupService', () => {
  let service: DocuCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocuCleanupService],
    }).compile();

    service = module.get<DocuCleanupService>(DocuCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
