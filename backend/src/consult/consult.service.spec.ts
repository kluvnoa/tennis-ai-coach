import { Test, TestingModule } from '@nestjs/testing';
import { ConsultService } from './consult.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConsultService', () => {
  let service: ConsultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultService,
        {
          provide: PrismaService,
          useValue: {
            consultHistory: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConsultService>(ConsultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
