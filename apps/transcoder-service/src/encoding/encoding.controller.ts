import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { LoggerService } from '@app/logger';
import { RabbitMqPublisher } from '@app/rabbit-mq';
import type { BaseMessage } from '@app/rabbit-mq';
import { EncodingService } from './encoding.service';
import type { EncodeVideoPayload } from './dto/encode-video.payload';
import type { UploadToS3Payload } from './dto/upload-to-s3.payload';
import { TranscoderContext, TranscoderEvent } from '../constants/log-events';

@Controller()
export class EncodingController {
  constructor(
    private readonly encodingService: EncodingService,
    private readonly rabbitMqPublisher: RabbitMqPublisher,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern('encode_video')
  async handleEncodeVideo(
    @Payload() message: BaseMessage<EncodeVideoPayload>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.log(TranscoderEvent.ENCODE_JOB_RECEIVED, TranscoderContext.CONTROLLER, {
      eventId: message.eventId,
      videoId: message.payload.videoId,
      source: message.source,
    });

    try {
      const { encodedPath, encodedFileName } = await this.encodingService.encode(message.payload);

      const uploadMessage: BaseMessage<UploadToS3Payload> = {
        eventId: randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'transcoder-service',
        payload: {
          videoId: message.payload.videoId,
          originalPath: message.payload.filePath,
          encodedPath,
          encodedFileName,
        },
      };

      this.rabbitMqPublisher.emit<UploadToS3Payload>('upload_to_s3', uploadMessage);

      this.logger.log(TranscoderEvent.UPLOAD_JOB_QUEUED, TranscoderContext.CONTROLLER, {
        eventId: uploadMessage.eventId,
        videoId: message.payload.videoId,
        encodedPath,
      });

      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(
        TranscoderEvent.ENCODE_FAILED,
        (error as Error).stack,
        TranscoderContext.CONTROLLER,
        {
          eventId: message.eventId,
          videoId: message.payload.videoId,
          error: (error as Error).message,
        },
      );
      channel.nack(originalMessage, false, false);
    }
  }
}
