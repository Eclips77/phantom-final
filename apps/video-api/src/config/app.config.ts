import { registerAs } from '@nestjs/config';

export interface VideoApiConfig {
  port: number;
  logLevel: string;
  mongoServiceUrl: string;
  uploadDir: string;
  rabbitMq: {
    url: string;
    encodingQueue: string;
  };
}

export const videoApiConfig = registerAs(
  'videoApi',
  (): VideoApiConfig => ({
    port: parseInt(process.env.PORT ?? '3001', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mongoServiceUrl: process.env.MONGO_SERVICE_URL!,
    uploadDir: process.env.UPLOAD_DIR!,
    rabbitMq: {
      url: process.env.RABBITMQ_URL!,
      encodingQueue: process.env.ENCODING_QUEUE!,
    },
  }),
);
