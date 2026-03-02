import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { RabbitMqPublisher } from '@app/rabbit-mq';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';

describe('VideoApiController', () => {
  let videoApiController: VideoApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoApiController],
      providers: [
        VideoApiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: RabbitMqPublisher,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    videoApiController = app.get<VideoApiController>(VideoApiController);
  });

  it('should be defined', () => {
    expect(videoApiController).toBeDefined();
  });
});
