import { registerAs } from '@nestjs/config';
import { join } from 'path';

export const transcoderConfig = registerAs('transcoder', () => ({
  encodingQueue: process.env.ENCODING_QUEUE ?? 'video_encoding_queue',
  s3UploadQueue: process.env.S3_UPLOAD_QUEUE ?? 's3_upload_queue',
  rabbitMq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
  },
  outputDir: process.env.TRANSCODER_OUTPUT_DIR ?? join(process.cwd(), 'transcoded'),
  ffmpegBinary: process.env.FFMPEG_BINARY_PATH ?? undefined,
}));
