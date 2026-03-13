import { Controller, Get } from '@nestjs/common';
import { WowzaStreamerService } from './wowza-streamer.service';

@Controller()
export class WowzaStreamerController {
  constructor(private readonly wowzaStreamerService: WowzaStreamerService) {}

  @Get()
  getHello(): string {
    return this.wowzaStreamerService.getHello();
  }
}
