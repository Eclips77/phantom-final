import { registerAs } from '@nestjs/config';

export const genreApiConfig = registerAs('genreApi', () => ({
  port: parseInt(process.env.PORT ?? '3002', 10),
  mongoServiceUrl: process.env.MONGO_SERVICE_URL ?? 'http://localhost:3001',
}));
