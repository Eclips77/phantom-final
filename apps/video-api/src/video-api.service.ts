import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
