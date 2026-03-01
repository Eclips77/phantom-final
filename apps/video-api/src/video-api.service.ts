import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest } from 'express';
import { randomUUID } from 'crypto';
import { CreateVideoDto } from './dto/create-video.dto';
import { RabbitMqPublisher } from '@app/rabbit-mq';
import { LoggerService } from '@app/logger';
import { VideoApiContext, VideoApiEvent } from './constants/log-events';

@Injectable()
export class VideoApiService {
  constructor(
    private readonly rabbitMqPublisher: RabbitMqPublisher,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async processVideoUpload(createVideoDto: CreateVideoDto, file: Express.Multer.File) {
    const mongoServiceUrl = this.config.get<string>('videoApi.mongoServiceUrl')!;

    this.logger.log(VideoApiEvent.FILE_SAVED, VideoApiContext.SERVICE, {
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
    });

    try {
      const mongoResponse = await fetch(`${mongoServiceUrl}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createVideoDto,
          filePath: file.path,
          fileName: file.filename,
          mimeType: file.mimetype,
        }),
      });

      if (!mongoResponse.ok) {
        throw new InternalServerErrorException('Failed to save video metadata to Mongo Service');
      }

      const savedVideoData = await mongoResponse.json();

      this.logger.log(VideoApiEvent.METADATA_SAVED, VideoApiContext.SERVICE, {
        videoId: savedVideoData._id,
        title: createVideoDto.title,
      });

      const eventId = randomUUID();

      this.rabbitMqPublisher.emit('encode_video', {
        eventId,
        timestamp: new Date().toISOString(),
        source: 'video-api',
        payload: {
          videoId: savedVideoData._id,
          filePath: file.path,
          fileName: file.filename,
        },
      });

      this.logger.log(VideoApiEvent.ENCODE_QUEUED, VideoApiContext.SERVICE, {
        eventId,
        videoId: savedVideoData._id,
      });

      return {
        message: 'Video uploaded and metadata forwarded successfully, encoding queued!',
        data: savedVideoData,
      };
    } catch (error) {
      this.logger.error(
        VideoApiEvent.UPLOAD_FAILED,
        (error as Error).stack,
        VideoApiContext.SERVICE,
        { fileName: file.filename, error: (error as Error).message },
      );
      throw new InternalServerErrorException('Could not process video upload completely');
    }
  }

  async proxyToMongoService(req: ExpressRequest, body?: unknown) {
    const mongoServiceUrl = this.config.get<string>('videoApi.mongoServiceUrl')!;
    const url = `${mongoServiceUrl}${req.originalUrl}`;

    this.logger.log(VideoApiEvent.PROXY_REQUEST, VideoApiContext.SERVICE, {
      method: req.method,
      url,
    });

    try {
      const fetchConfig: RequestInit = {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (req.method !== 'GET' && req.method !== 'HEAD' && body) {
        fetchConfig.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchConfig);
      return await response.json();
    } catch (err) {
      this.logger.error(
        VideoApiEvent.PROXY_ERROR,
        (err as Error).stack,
        VideoApiContext.SERVICE,
        { method: req.method, url, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Error forwarding request to Mongo Service');
    }
  }
}
