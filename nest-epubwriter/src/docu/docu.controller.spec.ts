import { Test, TestingModule } from '@nestjs/testing';
import { DocuController } from './docu.controller';

describe('DocuController', () => {
  let controller: DocuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocuController],
    }).compile();

    controller = module.get<DocuController>(DocuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
