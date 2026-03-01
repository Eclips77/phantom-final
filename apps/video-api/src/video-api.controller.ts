import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Req, UsePipes, Get, Put, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request as ExpressRequest } from 'express';
import { VideoApiService } from './video-api.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { GenreValidationPipe } from './pipes/genre-validation.pipe';

@Controller('videos')
export class VideoApiController {
  constructor(private readonly videoApiService: VideoApiService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|mov|avi|mkv)$/)) {
          return callback(new BadRequestException('Only video files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  @UsePipes(GenreValidationPipe)
  async createVideo(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }
    return this.videoApiService.processVideoUpload(createVideoDto, file);
  }

  @Get(':id')
  async getVideo(@Param('id') id: string, @Req() request: ExpressRequest) {
    if (!id || id.length < 5) throw new BadRequestException('Invalid Video ID format');
    return this.videoApiService.proxyToMongoService(request);
  }

  @Get()
  async getAllVideos(@Req() request: ExpressRequest) {
    return this.videoApiService.proxyToMongoService(request);
  }

  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() body: unknown, @Req() request: ExpressRequest) {
    if (!id) throw new BadRequestException('Invalid Video ID');
    if (!body || Object.keys(body as object).length === 0) throw new BadRequestException('Update body cannot be empty');
    return this.videoApiService.proxyToMongoService(request, body);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string, @Req() request: ExpressRequest) {
    if (!id) throw new BadRequestException('Invalid Video ID');
    return this.videoApiService.proxyToMongoService(request);
  }
}
