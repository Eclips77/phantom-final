import { registerAs } from '@nestjs/config';

export interface WowzaStreamerConfig {
  port: number;
  logLevel: string;
  mongoServiceUrl: string;
  wowzaUrl: string;
  s3BucketName: string;
}

export const wowzaStreamerConfig = registerAs(
  'wowzaStreamer',
  (): WowzaStreamerConfig => ({
    port: parseInt(process.env.PORT ?? '3003', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mongoServiceUrl: process.env.MONGO_SERVICE_URL!,
    wowzaUrl: process.env.WOWZA_URL!,
    s3BucketName: process.env.S3_BUCKET_NAME!,
  }),
);
