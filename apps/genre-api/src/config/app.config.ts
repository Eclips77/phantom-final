import { registerAs } from '@nestjs/config';

export interface GenreApiConfig {
  port: number;
  logLevel: string;
  mongoServiceUrl: string;
}

export const genreApiConfig = registerAs(
  'genreApi',
  (): GenreApiConfig => ({
    port: parseInt(process.env.PORT ?? '3004', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mongoServiceUrl: process.env.MONGO_SERVICE_URL!,
  }),
);
