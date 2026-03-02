import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GenreApiService } from './genre-api.service';
import { LoggerService } from '@app/logger';
import { InternalServerErrorException } from '@nestjs/common';
import { GenreApiEvent, GenreApiContext } from './constants/log-events';

describe('GenreApiService', () => {
  let service: GenreApiService;
  let loggerService: LoggerService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'genreApi.mongoServiceUrl') {
        return 'http://mock-mongo-url';
      }
      return null;
    }),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreApiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<GenreApiService>(GenreApiService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchMongo', () => {
    it('should log an error and throw InternalServerErrorException when fetch throws an error', async () => {
      const mockError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(mockError);

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      await expect(service.findAll()).rejects.toThrow('Mongo service is unreachable');

      expect(loggerService.error).toHaveBeenCalledWith(
        GenreApiEvent.MONGO_ERROR,
        mockError.stack,
        GenreApiContext.SERVICE,
        { url: 'http://mock-mongo-url/genres', error: mockError.message },
      );
    });
  });
});
