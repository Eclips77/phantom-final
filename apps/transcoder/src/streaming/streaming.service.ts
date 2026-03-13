import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';

@Injectable()
export class StreamingService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  public async getStreamingUrl(videoId: string): Promise<{ url: string }> {
    const mongoServiceUrl =
      this.config.get<string>('MONGO_SERVICE_URL') ?? 'http://localhost:3001';

    this.logger.log('STREAMING_URL_REQUEST', 'StreamingService', { videoId });

    try {
      // Fetch metadata from Mongo
      const response = await fetch(`${mongoServiceUrl}/videos/${videoId}`);

      if (response.status === 404) {
        throw new NotFoundException(`Video with id ${videoId} not found`);
      }

      if (!response.ok) {
        throw new InternalServerErrorException('Error fetching video metadata');
      }

      const videoData = (await response.json()) as {
        filePath?: string;
        fileName?: string;
      };

      if (!videoData.filePath || !videoData.fileName) {
        throw new InternalServerErrorException(
          'Incomplete video metadata for streaming',
        );
      }

      // Generate Wowza streaming URL
      // Assuming Wowza is configured to pull from our S3 compatible storage
      // A common Wowza pattern for VOD (Video On Demand) over S3 is using an application like 'vods3'
      const wowzaUrl =
        this.config.get<string>('WOWZA_URL') ??
        'http://wowza-server:1935/vods3/_definst_';

      // S3 path based on file path (e.g., s3://bucket-name/uploads/video.mp4)
      const s3Bucket = this.config.get<string>('S3_BUCKET_NAME') ?? 'my-bucket';

      // Example Wowza VOD S3 format: http://wowza-server:1935/vods3/_definst_/mp4:amazonS3/bucket-name/uploads/video.mp4/playlist.m3u8
      const streamUrl = `${wowzaUrl}/mp4:amazonS3/${s3Bucket}/${videoData.fileName}/playlist.m3u8`;

      this.logger.log('STREAMING_URL_GENERATED', 'StreamingService', {
        videoId,
        streamUrl,
      });

      return { url: streamUrl };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error(
        'STREAMING_URL_ERROR',
        (error as Error).stack,
        'StreamingService',
        { videoId, error: (error as Error).message },
      );
      throw new InternalServerErrorException(
        'Failed to retrieve streaming url',
      );
    }
  }
}
