import { Test, TestingModule } from '@nestjs/testing';
import { ConsultController } from './consult.controller';

describe('ConsultController', () => {
  let controller: ConsultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultController],
    }).compile();

    controller = module.get<ConsultController>(ConsultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
