import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LoggerService } from '@app/logger';
import * as fs from 'fs';
import { transcoderConfig } from '../config/app.config';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(
    @Inject(transcoderConfig.KEY)
    private readonly config: ConfigType<typeof transcoderConfig>,
    private readonly logger: LoggerService,
  ) {
    this.s3Client = new S3Client({
      region: this.config.s3.region,
      endpoint: this.config.s3.endpoint,
      credentials: {
        accessKeyId: this.config.s3.accessKeyId,
        secretAccessKey: this.config.s3.secretAccessKey,
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
