import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateVideoDto } from './dto/create-video.dto';
import { RabbitMqPublisher } from '@app/rabbit-mq';

@Injectable()
export class VideoApiService {
  private readonly mongoServiceUrl = process.env.MONGO_SERVICE_URL || 'http://localhost:3001';

  constructor(private readonly rabbitMqPublisher: RabbitMqPublisher) {}

  async processVideoUpload(createVideoDto: CreateVideoDto, file: Express.Multer.File) {
    console.log('Validating metadata successfully, file saved to:', file.path);

    try {
      const mongoResponse = await fetch(`${this.mongoServiceUrl}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createVideoDto,
          filePath: file.path,
          fileName: file.filename,
          mimeType: file.mimetype,
        }),
      });

      if (!mongoResponse.ok) {
        throw new InternalServerErrorException('Failed to save to Mongo Service at processVideoUpload');
      }

      const savedVideoData = await mongoResponse.json();

      this.rabbitMqPublisher.emit('encode_video', {
        eventId: randomUUID(),
        timestamp: new Date().toISOString(),
        source: 'video-api',
        payload: {
          videoId: savedVideoData._id,
          filePath: file.path,
          fileName: file.filename,
        },
      });

      return {
        message: 'Video uploaded and metadata forwarded successfully, encoding queued!',
        data: savedVideoData,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Could not process video upload completely');
    }
  }

  /**
   * פונקציה כללית לטיפול בכל בקשה לא-POST ולהפנייתה ל-Mongo
   */
  async proxyToMongoService(req: Request, body?: any) {
    try {
      // לדוגמה, נוכל לעבד את בקשות מחיקה, או עידכון וידאו... 
      const url = `${this.mongoServiceUrl}${req.originalUrl}`;
      const config: any = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          // אם קיים Authorization: req.headers.authorization,
        },
      };

      if (req.method !== 'GET' && req.method !== 'HEAD' && body) {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);

      return await response.json();
    } catch (err) {
      console.error('Proxy Error to Mongo Service:', err);
      throw new InternalServerErrorException('Error transparenting data to Mongo service');
    }
  }
}
