import { registerAs } from '@nestjs/config';

export interface MongoServiceConfig {
  port: number;
  logLevel: string;
  mongoDbUri: string;
}

export const mongoServiceConfig = registerAs(
  'mongoService',
  (): MongoServiceConfig => ({
    port: parseInt(process.env.PORT ?? '3006', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mongoDbUri: process.env.MONGODB_URI!,
  }),
);
