import { registerAs } from '@nestjs/config';
import { join } from 'path';

export const videoApiConfig = registerAs('videoApi', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongoServiceUrl: process.env.MONGO_SERVICE_URL ?? 'http://localhost:3001',
  uploadDir: process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads'),
  rabbitMq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
    encodingQueue: process.env.ENCODING_QUEUE ?? 'video_encoding_queue',
  },
}));
