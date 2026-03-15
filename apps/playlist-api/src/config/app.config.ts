import { registerAs } from '@nestjs/config';

export interface PlaylistApiConfig {
  port: number;
  logLevel: string;
  mongoServiceUrl: string;
  videoServiceUrl: string;
}

export const playlistApiConfig = registerAs(
  'playlistApi',
  (): PlaylistApiConfig => ({
    port: parseInt(process.env.PORT ?? '3005', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mongoServiceUrl: process.env.MONGO_SERVICE_URL!,
    videoServiceUrl: process.env.VIDEO_SERVICE_URL!,
  }),
);
