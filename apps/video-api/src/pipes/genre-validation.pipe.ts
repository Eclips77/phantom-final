import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateVideoDto } from '../dto/create-video.dto';

@Injectable()
export class GenreValidationPipe implements PipeTransform {
  constructor(private readonly config: ConfigService) {}

  async transform(value: CreateVideoDto): Promise<CreateVideoDto> {
    if (!value?.genre) {
      throw new BadRequestException('Genre is required');
    }

    const mongoServiceUrl = this.config.get<string>(
      'videoApi.mongoServiceUrl',
    )!;

    try {
      const response = await fetch(`${mongoServiceUrl}/genres/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: value.genre }),
      });

      if (!response.ok) {
        throw new BadRequestException(
          `Genre validation failed: ${value.genre} is not allowed`,
        );
      }

      return value;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        'Could not validate genre against Mongo Service',
      );
    }
  }
}
