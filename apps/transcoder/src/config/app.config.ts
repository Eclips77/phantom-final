import { registerAs } from '@nestjs/config';

export interface TranscoderConfig {
  port: number;
  logLevel: string;
  rabbitMq: {
    url: string;
    encodingQueue: string;
  };
  s3: {
    bucketName: string;
    region: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export const transcoderConfig = registerAs(
  'transcoder',
  (): TranscoderConfig => ({
    port: parseInt(process.env.PORT ?? '3002', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    rabbitMq: {
      url: process.env.RABBITMQ_URL!,
      encodingQueue: process.env.ENCODING_QUEUE!,
    },
    s3: {
      bucketName: process.env.S3_BUCKET_NAME!,
      region: process.env.AWS_REGION!,
      endpoint: process.env.S3_ENDPOINT!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
);
