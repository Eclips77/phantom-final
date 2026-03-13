import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { GenreApiService } from './genre-api.service';
import { HttpException } from '@nestjs/common';

describe('GenreApiService', () => {
  let service: GenreApiService;
  let mockConfigService: Partial<ConfigService>;
  let mockLoggerService: Partial<LoggerService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'genreApi.mongoServiceUrl') return 'http://mongo-mock:3000';
        return null;
      }),
    };

    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<GenreApiService>(GenreApiService);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchMongo', () => {
    it('should throw an HttpException if response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid input'),
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service['fetchMongo']('/test-path')).rejects.toThrow(
        HttpException,
      );
      await expect(service['fetchMongo']('/test-path')).rejects.toThrow(
        'Invalid input',
      );

      try {
        await service['fetchMongo']('/test-path');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(400);
      }
    });

    it('should throw an HttpException with statusText if body is empty', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockRejectedValue(new Error('no text')),
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service['fetchMongo']('/test-path')).rejects.toThrow(
        HttpException,
      );
      await expect(service['fetchMongo']('/test-path')).rejects.toThrow(
        'Not Found',
      );

      try {
        await service['fetchMongo']('/test-path');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect((err as HttpException).getStatus()).toBe(404);
      }
    });
  });
});
