import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { ConflictException } from '@nestjs/common';
import { GenreApiService } from './genre-api.service';

describe('GenreApiService', () => {
  let service: GenreApiService;
  let configService: ConfigService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreApiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://mock-mongo-url'),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GenreApiService>(GenreApiService);
    configService = module.get<ConfigService>(ConfigService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assertNameUnique', () => {
    it('should throw ConflictException if genre with the same name already exists', async () => {
      // Mock fetchMongo to return a mock array containing the genre name
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([
        { _id: 'some-id', name: 'Action' }
      ]);

      await expect(
        service['assertNameUnique']('Action')
      ).rejects.toThrow(ConflictException);

      expect(loggerService.warn).toHaveBeenCalled();
    });

    it('should not throw if genre with the same name does not exist', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([]);

      await expect(
        service['assertNameUnique']('Action')
      ).resolves.not.toThrow();
    });

    it('should not throw if genre with the same name exists but has the excluded id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([
        { _id: 'some-id', name: 'Action' }
      ]);

      await expect(
        service['assertNameUnique']('Action', 'some-id')
      ).resolves.not.toThrow();
    });
  });
});
