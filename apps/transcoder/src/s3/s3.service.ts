import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LoggerService } from '@app/logger';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
      endpoint: this.config.get<string>('S3_ENDPOINT') ?? 'http://minio:9000',
      credentials: {
        accessKeyId:
          this.config.get<string>('AWS_ACCESS_KEY_ID') ?? 'minioadmin',
        secretAccessKey:
          this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? 'minioadmin',
      },
      forcePathStyle: true, // Needed for MinIO
    });
  }

  async uploadFile(
    filePath: string,
    bucketName: string,
    destinationKey: string,
  ): Promise<void> {
    try {
      const fileStream = fs.createReadStream(filePath);

      const uploadParams = {
        Bucket: bucketName,
        Key: destinationKey,
        Body: fileStream,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      this.logger.log('S3_UPLOAD_SUCCESS', 'S3Service', {
        bucketName,
        destinationKey,
        filePath,
      });
    } catch (error) {
      this.logger.error(
        'S3_UPLOAD_FAILED',
        (error as Error).stack,
        'S3Service',
        {
          bucketName,
          destinationKey,
          error: (error as Error).message,
        },
      );
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }
}
