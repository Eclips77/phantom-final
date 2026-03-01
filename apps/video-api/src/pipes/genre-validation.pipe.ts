import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class GenreValidationPipe implements PipeTransform {
  async transform(value: CreateVideoDto, metadata: ArgumentMetadata) {
    if (!value || !value.genre) {
      throw new BadRequestException('Genre is required');
    }

    try {
      // כאן אנחנו עושים קריאה ל-Mongo Service לבדוק אם הז'אנר קיים ומורשה.
      // בדוגמה זו השתמשנו ב-fetch מובנה של Node.js - יש להחליף את ה-URL בכתובת האמיתית של ה-Mongo Service שלכם.
      const response = await fetch(`${process.env.MONGO_SERVICE_URL || 'http://localhost:3001'}/genres/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: value.genre }),
      });

      if (!response.ok) {
        throw new BadRequestException(`Genre validation failed: ${value.genre} is not allowed.`);
      }

      // במידה וחשוב לכם ניתן גם לקרוא את התשובה כדי לוודא שדות ספציפיים
      // const data = await response.json();
      
      return value;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Could not validate genre against Mongo Service');
    }
  }
}
