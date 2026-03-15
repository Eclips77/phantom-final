import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@app/logger';
import { GenreApiService } from './genre-api.service';
import { HttpException } from '@nestjs/common';
import { mockLoggerService, createMockResponse } from '../test/genre-api.mock';

describe('GenreApiService', () => {
  let service: GenreApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreApiService,
        {
          provide: 'CONFIGURATION(genreApi)',
          useValue: {
            port: 3004,
            logLevel: 'info',
            mongoServiceUrl: 'http://mongo-mock:3000',
          },
        },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<GenreApiService>(GenreApiService);

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
      const mockResponse = createMockResponse(
        false,
        400,
        'Bad Request',
        'Invalid input',
      );
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

    it('should throw an HttpException with statusText if body is empty or parsing throws', async () => {
      const mockResponse = createMockResponse(
        false,
        404,
        'Not Found',
        new Error('no text'),
      );
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

    it('should return parsed json successfully if response is ok', async () => {
      const expectedData = { _id: 'test_id', name: 'Action' };
      const mockResponse = createMockResponse(
        true,
        200,
        'OK',
        expectedData,
        true,
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service['fetchMongo']('/test-path');
      expect(result).toEqual(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://mongo-mock:3000/test-path',
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    });

    it('should include stringified body if passed in options', async () => {
      const expectedData = { _id: 'test_id', name: 'Action' };
      const mockResponse = createMockResponse(
        true,
        201,
        'Created',
        expectedData,
        true,
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const payload = { name: 'Action' };

      const result = await service['fetchMongo']('/test-path', {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: JSON.stringify(payload) as any,
      });

      expect(result).toEqual(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://mongo-mock:3000/test-path',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
    });
  });

  describe('CRUD operations', () => {
    it('findAll should call fetchMongo with GET /genres', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([]);
      await service.findAll();

      expect(service['fetchMongo']).toHaveBeenCalledWith('/genres');
    });

    it('findOne should call fetchMongo with GET /genres/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      await service.findOne('123');

      expect(service['fetchMongo']).toHaveBeenCalledWith('/genres/123');
    });

    it('create should call fetchMongo with POST /genres', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([]);
      const createDto = { name: 'Horror', description: 'Scary movies' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await service.create(createDto as any);

      expect(service['fetchMongo']).toHaveBeenCalledWith('/genres', {
        method: 'POST',
        body: JSON.stringify(createDto),
      });
    });

    it('update should call fetchMongo with PUT /genres/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([]);
      const updateDto = { name: 'Thriller' };
      await service.update('123', updateDto);

      expect(service['fetchMongo']).toHaveBeenCalledWith('/genres/123', {
        method: 'PUT',
        body: JSON.stringify(updateDto),
      });
    });

    it('remove should call fetchMongo with DELETE /genres/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      await service.remove('123');

      expect(service['fetchMongo']).toHaveBeenCalledWith('/genres/123', {
        method: 'DELETE',
      });
    });
  });
});
