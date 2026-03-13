import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { RabbitMqPublisher } from '@app/rabbit-mq';
import { VideoApiService } from './video-api.service';
import { InternalServerErrorException } from '@nestjs/common';
import {
  mockConfigService,
  mockLoggerService,
  mockRabbitMqPublisher,
  createMockResponse,
  mockExpressFile,
} from '../test/video-api.mock';
import { CreateVideoDto } from './dto/create-video.dto';
import type { Request as ExpressRequest } from 'express';

describe('VideoApiService', () => {
  let service: VideoApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: RabbitMqPublisher, useValue: mockRabbitMqPublisher },
      ],
    }).compile();

    service = module.get<VideoApiService>(VideoApiService);

    // Mock config get so it works regardless of which method is called
    jest.spyOn(service['config'], 'get').mockImplementation((key: string) => {
      if (key === 'videoApi.mongoServiceUrl') return 'http://mongo-mock:3000';
      return null;
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processVideoUpload', () => {
    const dto: CreateVideoDto = {
      title: 'My Video',
      description: 'Cool video',
    };

    it('should successfully process video and emit rabbitmq event', async () => {
      const mockSavedData = { _id: 'vid-123', title: 'My Video' };
      const mockResponse = createMockResponse(
        true,
        201,
        'Created',
        mockSavedData,
        true,
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.processVideoUpload(dto, mockExpressFile);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mongo-mock:3000/videos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dto,
            filePath: mockExpressFile.path,
            fileName: mockExpressFile.filename,
            mimeType: mockExpressFile.mimetype,
          }),
        },
      );

      expect(mockRabbitMqPublisher.emit).toHaveBeenCalledWith(
        'encode_video',
        expect.objectContaining({
          source: 'video-api',
          payload: {
            videoId: 'vid-123',
            filePath: mockExpressFile.path,
            fileName: mockExpressFile.filename,
          },
        }),
      );

      expect(result).toEqual({
        message:
          'Video uploaded and metadata forwarded successfully, encoding queued!',
        data: mockSavedData,
      });
    });

    it('should throw InternalServerErrorException if Mongo fetch fails', async () => {
      const mockResponse = createMockResponse(
        false,
        500,
        'Server Error',
        'Fail',
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        service.processVideoUpload(dto, mockExpressFile),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network drop'));

      await expect(
        service.processVideoUpload(dto, mockExpressFile),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('proxyToMongoService', () => {
    it('should proxy GET request without body', async () => {
      const mockData = { items: [] };
      const mockResponse = createMockResponse(true, 200, 'OK', mockData, true);
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const req = { method: 'GET', originalUrl: '/videos' } as ExpressRequest;

      const result = await service.proxyToMongoService(req);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mongo-mock:3000/videos',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      expect(result).toEqual(mockData);
    });

    it('should proxy POST request with body', async () => {
      const mockData = { id: 1 };
      const mockResponse = createMockResponse(
        true,
        201,
        'Created',
        mockData,
        true,
      );
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const req = { method: 'POST', originalUrl: '/videos' } as ExpressRequest;
      const body = { title: 'Test' };

      const result = await service.proxyToMongoService(req, body);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mongo-mock:3000/videos',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      expect(result).toEqual(mockData);
    });

    it('should throw InternalServerErrorException on proxy failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Failed to reach'),
      );

      const req = { method: 'GET', originalUrl: '/videos' } as ExpressRequest;

      await expect(service.proxyToMongoService(req)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
