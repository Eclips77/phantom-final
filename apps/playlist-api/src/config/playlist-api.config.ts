import { registerAs } from '@nestjs/config';

export const playlistApiConfig = registerAs('playlistApi', () => ({
  port: parseInt(process.env.PORT ?? '3003', 10),
  mongoServiceUrl: process.env.MONGO_SERVICE_URL ?? 'http://localhost:3001',
  videoServiceUrl: process.env.VIDEO_SERVICE_URL ?? 'http://localhost:3001',
}));
