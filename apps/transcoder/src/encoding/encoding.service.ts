import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import type { EncodeVideoEvent } from './interfaces/encode-video.interface';
import { EncodingEvent, EncodingContext } from './constants/log-events';
import * as path from 'path';
import * as fs from 'fs';
import { S3Service } from '../s3/s3.service';
import { ConfigService } from '@nestjs/config';

// Set ffmpeg path using the installer
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class EncodingService {
  constructor(
    private readonly logger: LoggerService,
    private readonly s3Service: S3Service,
    private readonly config: ConfigService,
  ) {}

  public async encodeVideo(event: EncodeVideoEvent): Promise<void> {
    const { videoId, filePath } = event.payload;

    this.logger.log(EncodingEvent.ENCODING_STARTED, EncodingContext.SERVICE, {
      videoId,
      eventId: event.eventId,
      filePath,
    });

    const parsedPath = path.parse(filePath);
    // Create output path in the same directory but with .mp4 extension and _encoded suffix
    const outputPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}_encoded.mp4`,
    );

    try {
      await this.runFfmpeg(filePath, outputPath, videoId);

      this.logger.log(
        EncodingEvent.ENCODING_COMPLETED,
        EncodingContext.SERVICE,
        {
          videoId,
          eventId: event.eventId,
          originalFilePath: filePath,
          outputPath,
        },
      );

      // Upload encoded file to S3
      const bucketName =
        this.config.get<string>('S3_BUCKET_NAME') ?? 'my-bucket';
      const destinationKey = `${videoId}/${path.basename(outputPath)}`;

      await this.s3Service.uploadFile(outputPath, bucketName, destinationKey);

      // Optionally update mongo here using a fetch call or via RabbitMQ event
      // to let video-api know it's ready.

      // Clean up local encoded file after successful upload
      fs.unlinkSync(outputPath);
      // We can also optionally unlink the original file `filePath` if it's stored on a shared volume
    } catch (error) {
      this.logger.error(
        EncodingEvent.ENCODING_FAILED,
        (error as Error).stack,
        EncodingContext.SERVICE,
        {
          videoId,
          eventId: event.eventId,
          error: (error as Error).message,
        },
      );
      throw new InternalServerErrorException('Failed to encode video');
    }
  }

  private runFfmpeg(
    inputPath: string,
    outputPath: string,
    videoId: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Need to handle module resolution when it's a namespace vs default function

      const ffmpegModule: any = ffmpeg;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const ffmpegCmd =
        typeof ffmpeg === 'function'
          ? ffmpeg
          : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ffmpegModule.default || ffmpegModule;
      const cmd = (
        ffmpegCmd as unknown as (input: string) => ffmpeg.FfmpegCommand
      )(inputPath);

      cmd
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .on('progress', (progress: { percent?: number }) => {
          this.logger.log(
            EncodingEvent.ENCODING_PROGRESS,
            EncodingContext.SERVICE,
            {
              videoId,
              percent: progress.percent,
            },
          );
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .run();
    });
  }
}
