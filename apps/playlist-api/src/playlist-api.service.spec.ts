import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@app/logger';
import { PlaylistApiService } from './playlist-api.service';
import { HttpException } from '@nestjs/common';
import {
  mockLoggerService,
  createMockResponse,
} from '../test/playlist-api.mock';

describe('PlaylistApiService', () => {
  let service: PlaylistApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistApiService,
        {
          provide: 'CONFIGURATION(playlistApi)',
          useValue: {
            port: 3005,
            logLevel: 'info',
            mongoServiceUrl: 'http://mongo-mock:3000',
            videoServiceUrl: 'http://video-mock:3002',
          },
        },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<PlaylistApiService>(PlaylistApiService);

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

    it('should throw an HttpException with statusText if body is empty', async () => {
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
      const expectedData = { _id: 'test_id', title: 'Favorites' };
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
      const expectedData = { _id: 'test_id', title: 'Favorites' };
      const mockResponse = createMockResponse(
        true,
        201,
        'Created',
        expectedData,
        true,
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const payload = { title: 'Favorites' };

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
    it('findAll should call fetchMongo with GET /playlists', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue([]);
      await service.findAll();

      expect(service['fetchMongo']).toHaveBeenCalledWith('/playlists');
    });

    it('findOne should call fetchMongo with GET /playlists/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      await service.findOne('123');

      expect(service['fetchMongo']).toHaveBeenCalledWith('/playlists/123');
    });

    it('create should call fetchMongo with POST /playlists', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      const createDto = { name: 'My List', author: 'user1' }; // Schema uses `name` not `title`
      jest
        .spyOn(service as any, 'assertVideosExist')
        .mockResolvedValue(undefined);
      await service.create(createDto as any);

      expect(service['fetchMongo']).toHaveBeenCalledWith('/playlists', {
        method: 'POST',
        body: JSON.stringify(createDto),
      });
    });

    it('update should call fetchMongo with PUT /playlists/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      jest
        .spyOn(service as any, 'assertVideosExist')
        .mockResolvedValue(undefined);
      const updateDto = { name: 'Updated List' }; // Schema uses `name`
      await service.update('123', updateDto);

      expect(service['fetchMongo']).toHaveBeenCalledWith('/playlists/123', {
        method: 'PUT',
        body: JSON.stringify(updateDto),
      });
    });

    it('remove should call fetchMongo with DELETE /playlists/:id', async () => {
      jest.spyOn(service as any, 'fetchMongo').mockResolvedValue({});
      await service.remove('123');

      expect(service['fetchMongo']).toHaveBeenCalledWith('/playlists/123', {
        method: 'DELETE',
      });
    });
  });
});
