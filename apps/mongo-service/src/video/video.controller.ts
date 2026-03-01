import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { VideoService } from './video.service';
import type { CreateVideoDto } from './dto/create-video.dto';
import type { UpdateVideoDto } from './dto/update-video.dto';
import type { SearchVideoDto } from './dto/search-video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVideoDto) {
    return this.videoService.create(dto);
  }

  @Get('search')
  search(@Query() query: SearchVideoDto) {
    return this.videoService.search(query);
  }

  @Get()
  findAll() {
    return this.videoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Video ID is required');
    return this.videoService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    if (!id?.trim()) throw new BadRequestException('Video ID is required');
    return this.videoService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Video ID is required');
    return this.videoService.remove(id);
  }
}
