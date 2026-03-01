import { registerAs } from '@nestjs/config';

export const mongoServiceConfig = registerAs('mongoService', () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/phantom',
}));
