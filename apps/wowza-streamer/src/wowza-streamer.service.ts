import { Injectable } from '@nestjs/common';

@Injectable()
export class WowzaStreamerService {
  getHello(): string {
    return 'Hello World!';
  }
}
