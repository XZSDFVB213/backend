import { Test, TestingModule } from '@nestjs/testing';
import { FrontolController } from './frontol.controller';
import { FrontolService } from './frontol.service';

describe('FrontolController', () => {
  let controller: FrontolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrontolController],
      providers: [FrontolService],
    }).compile();

    controller = module.get<FrontolController>(FrontolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
