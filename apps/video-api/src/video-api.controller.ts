import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Req, UsePipes, Get, Put, Delete, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { VideoApiService } from './video-api.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { GenreValidationPipe } from './pipes/genre-validation.pipe';

const UPLOAD_DEST = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DEST)) {
  fs.mkdirSync(UPLOAD_DEST, { recursive: true });
}

@Controller('videos')
export class VideoApiController {
  constructor(private readonly videoApiService: VideoApiService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: UPLOAD_DEST,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(mp4|mov|avi|mkv)$/)) {
          return callback(new BadRequestException('Only video files are allowed!'), false);
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

  // דוגמאות לולידציה של בקשות אחרות (המשתמש בדרך כלל מעביר מזהה).
  // הוספת ולידציה אוטומטית שמוודאת שה-ID הוא מחרוזת תקינה באורך הרצוי ל-Mongo למשל
  @Get(':id')
  async getVideo(@Param('id') id: string, @Req() request: Request) {
    if (!id || id.length < 5) throw new BadRequestException('Invalid Video ID format');
    return this.videoApiService.proxyToMongoService(request);
  }

  @Get()
  async getAllVideos(@Req() request: Request) {
    return this.videoApiService.proxyToMongoService(request);
  }

  @Put(':id')
  async updateVideo(@Param('id') id: string, @Body() body: any, @Req() request: Request) {
    if (!id) throw new BadRequestException('Invalid Video ID');
    if (!body || Object.keys(body).length === 0) throw new BadRequestException('Update body cannot be empty');
    return this.videoApiService.proxyToMongoService(request, body);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string, @Req() request: Request) {
    if (!id) throw new BadRequestException('Invalid Video ID');
    return this.videoApiService.proxyToMongoService(request);
  }
}
