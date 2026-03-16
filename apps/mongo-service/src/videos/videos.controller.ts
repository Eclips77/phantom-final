import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  async create(@Body() createVideoDto: Record<string, unknown>) {
    return this.videosService.create(createVideoDto);
  }

  @Get()
  async findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVideoDto: Record<string, unknown>,
  ) {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}
