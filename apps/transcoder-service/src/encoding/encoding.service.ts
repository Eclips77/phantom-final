import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import type { EncodeVideoPayload } from './dto/encode-video.payload';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { join, parse } from 'path';
import { mkdirSync } from 'fs';
import { TranscoderContext, TranscoderEvent } from '../constants/log-events';

export interface EncodingResult {
  encodedPath: string;
  encodedFileName: string;
}

@Injectable()
export class EncodingService implements OnModuleInit {
  private readonly outputDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.outputDir = this.config.get<string>('transcoder.outputDir')!;
  }

  onModuleInit(): void {
    const binaryPath = this.config.get<string | undefined>('transcoder.ffmpegBinary');
    ffmpeg.setFfmpegPath(binaryPath ?? (ffmpegStatic as string));
    mkdirSync(this.outputDir, { recursive: true });
  }

  async encode(payload: EncodeVideoPayload): Promise<EncodingResult> {
    const { videoId, filePath, fileName } = payload;
    const { name } = parse(fileName);
    const encodedFileName = `${name}-${videoId}-encoded.mp4`;
    const encodedPath = join(this.outputDir, encodedFileName);

    this.logger.log(TranscoderEvent.ENCODE_STARTED, TranscoderContext.SERVICE, {
      videoId,
      inputPath: filePath,
      outputPath: encodedPath,
    });

    await this.runFfmpeg(filePath, encodedPath, videoId);

    this.logger.log(TranscoderEvent.ENCODE_COMPLETED, TranscoderContext.SERVICE, {
      videoId,
      encodedPath,
      encodedFileName,
    });

    return { encodedPath, encodedFileName };
  }

  private runFfmpeg(inputPath: string, outputPath: string, videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilter([
          'scale=1080:1080:force_original_aspect_ratio=decrease',
          'pad=1080:1080:(ow-iw)/2:(oh-ih)/2',
          'setsar=1',
        ])
        .videoCodec('libx264')
        .addOption('-crf', '22')
        .addOption('-preset', 'slow')
        .audioCodec('aac')
        .audioBitrate('128k')
        .addOption('-movflags', '+faststart')
        .format('mp4')
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => {
          this.logger.error(TranscoderEvent.ENCODE_FAILED, err.stack, TranscoderContext.SERVICE, {
            videoId,
            inputPath,
            error: err.message,
          });
          reject(new InternalServerErrorException(`Encoding failed for videoId ${videoId}`));
        })
        .run();
    });
  }
}
