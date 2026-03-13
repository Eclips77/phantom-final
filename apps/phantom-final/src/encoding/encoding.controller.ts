import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EncodingService } from './encoding.service';
import { LoggerService } from '@app/logger';
import { EncodeVideoEvent } from './interfaces/encode-video.interface';

@Controller()
export class EncodingController {
  constructor(
    private readonly encodingService: EncodingService,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern('encode_video')
  async handleEncodeVideo(@Payload() data: EncodeVideoEvent) {
    this.logger.log('ENCODE_VIDEO_RECEIVED', 'EncodingController', {
      eventId: data.eventId,
      videoId: data.payload.videoId,
    });

    try {
      await this.encodingService.encodeVideo(data);
    } catch (error) {
      this.logger.error(
        'ENCODE_VIDEO_FAILED',
        (error as Error).stack,
        'EncodingController',
        { eventId: data.eventId, error: (error as Error).message },
      );
    }
  }
}
