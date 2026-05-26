import { Test, TestingModule } from '@nestjs/testing';
import { FrontolService } from './frontol.service';

describe('FrontolService', () => {
  let service: FrontolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontolService],
    }).compile();

    service = module.get<FrontolService>(FrontolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
