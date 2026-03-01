import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import type { FilterQuery } from 'mongoose';
import { Video } from './video.schema';
import type { VideoDocument } from './video.schema';
import type { CreateVideoDto } from './dto/create-video.dto';
import type { UpdateVideoDto } from './dto/update-video.dto';
import type { SearchVideoDto } from './dto/search-video.dto';
import { LoggerService } from '@app/logger';
import { MongoServiceContext, VideoEvent } from '../constants/log-events';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private readonly videoModel: Model<VideoDocument>,
    private readonly logger: LoggerService,
  ) {}

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" is not a valid video ID`);
    }
  }

  async create(dto: CreateVideoDto): Promise<VideoDocument> {
    if (!dto.title?.trim()) throw new BadRequestException('Video title is required');
    if (!dto.language?.trim()) throw new BadRequestException('Video language is required');
    if (!dto.genre?.trim()) throw new BadRequestException('Video genre is required');
    if (!dto.filePath || !dto.fileName || !dto.mimeType) {
      throw new BadRequestException('File metadata (filePath, fileName, mimeType) is required');
    }
    if (dto.duration == null || Number(dto.duration) < 0) {
      throw new BadRequestException('Video duration must be a non-negative number');
    }

    this.logger.log(VideoEvent.CREATING, MongoServiceContext.VIDEO_SERVICE, {
      title: dto.title,
      genre: dto.genre,
      language: dto.language,
    });

    try {
      const video = await this.videoModel.create(dto);
      this.logger.log(VideoEvent.CREATED, MongoServiceContext.VIDEO_SERVICE, {
        videoId: String(video._id),
        title: video.title,
      });
      return video;
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'create', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to create video record');
    }
  }

  async findAll(): Promise<VideoDocument[]> {
    this.logger.log(VideoEvent.FETCH_ALL, MongoServiceContext.VIDEO_SERVICE);
    try {
      return await this.videoModel.find().sort({ createdAt: -1 }).lean().exec() as unknown as VideoDocument[];
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'findAll', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve videos');
    }
  }

  async findOne(id: string): Promise<VideoDocument> {
    this.assertValidId(id);
    this.logger.log(VideoEvent.FETCH_ONE, MongoServiceContext.VIDEO_SERVICE, { videoId: id });

    let video: VideoDocument | null;
    try {
      video = await this.videoModel.findById(id).lean().exec() as unknown as VideoDocument | null;
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'findOne', videoId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve video');
    }

    if (!video) {
      this.logger.warn(VideoEvent.NOT_FOUND, MongoServiceContext.VIDEO_SERVICE, { videoId: id });
      throw new NotFoundException(`Video with id "${id}" not found`);
    }

    return video;
  }

  async update(id: string, dto: UpdateVideoDto): Promise<VideoDocument> {
    this.assertValidId(id);

    const fields = Object.keys(dto).filter((k) => (dto as any)[k] !== undefined);
    if (fields.length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    if (dto.duration !== undefined && Number(dto.duration) < 0) {
      throw new BadRequestException('Video duration must be a non-negative number');
    }

    this.logger.log(VideoEvent.UPDATING, MongoServiceContext.VIDEO_SERVICE, {
      videoId: id,
      fields,
    });

    let updated: VideoDocument | null;
    try {
      updated = await this.videoModel
        .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
        .lean()
        .exec() as unknown as VideoDocument | null;
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'update', videoId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to update video record');
    }

    if (!updated) {
      this.logger.warn(VideoEvent.NOT_FOUND, MongoServiceContext.VIDEO_SERVICE, { videoId: id });
      throw new NotFoundException(`Video with id "${id}" not found`);
    }

    this.logger.log(VideoEvent.UPDATED, MongoServiceContext.VIDEO_SERVICE, { videoId: id });
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    this.assertValidId(id);
    this.logger.log(VideoEvent.DELETING, MongoServiceContext.VIDEO_SERVICE, { videoId: id });

    let result: VideoDocument | null;
    try {
      result = await this.videoModel.findByIdAndDelete(id).lean().exec() as unknown as VideoDocument | null;
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'remove', videoId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to delete video record');
    }

    if (!result) {
      this.logger.warn(VideoEvent.NOT_FOUND, MongoServiceContext.VIDEO_SERVICE, { videoId: id });
      throw new NotFoundException(`Video with id "${id}" not found`);
    }

    this.logger.log(VideoEvent.DELETED, MongoServiceContext.VIDEO_SERVICE, { videoId: id });
    return { deleted: true, id };
  }

  async search(dto: SearchVideoDto): Promise<{ data: VideoDocument[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(dto.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<VideoDocument> = {};

    if (dto.title?.trim()) {
      filter.$text = { $search: dto.title };
    }

    if (dto.language?.trim()) {
      filter.language = dto.language.toLowerCase();
    }

    if (dto.genre?.trim()) {
      filter.genre = dto.genre;
    }

    if (dto.minDuration !== undefined || dto.maxDuration !== undefined) {
      filter.duration = {};
      if (dto.minDuration !== undefined) {
        const min = Number(dto.minDuration);
        if (isNaN(min) || min < 0) throw new BadRequestException('minDuration must be a non-negative number');
        filter.duration.$gte = min;
      }
      if (dto.maxDuration !== undefined) {
        const max = Number(dto.maxDuration);
        if (isNaN(max) || max < 0) throw new BadRequestException('maxDuration must be a non-negative number');
        filter.duration.$lte = max;
      }
      if (filter.duration.$gte !== undefined && filter.duration.$lte !== undefined && filter.duration.$gte > filter.duration.$lte) {
        throw new BadRequestException('minDuration cannot be greater than maxDuration');
      }
    }

    if (dto.uploadedFrom || dto.uploadedTo) {
      filter.createdAt = {};
      if (dto.uploadedFrom) {
        const from = new Date(dto.uploadedFrom);
        if (isNaN(from.getTime())) throw new BadRequestException('uploadedFrom is not a valid ISO date');
        filter.createdAt.$gte = from;
      }
      if (dto.uploadedTo) {
        const to = new Date(dto.uploadedTo);
        if (isNaN(to.getTime())) throw new BadRequestException('uploadedTo is not a valid ISO date');
        filter.createdAt.$lte = to;
      }
    }

    this.logger.log(VideoEvent.SEARCHING, MongoServiceContext.VIDEO_SERVICE, {
      filter: JSON.stringify(filter),
      page,
      limit,
    });

    try {
      const [data, total] = await Promise.all([
        this.videoModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec() as unknown as VideoDocument[],
        this.videoModel.countDocuments(filter).exec(),
      ]);

      this.logger.log(VideoEvent.SEARCH_RESULT, MongoServiceContext.VIDEO_SERVICE, {
        total,
        page,
        limit,
        returned: data.length,
      });

      return { data, total, page, limit };
    } catch (err) {
      this.logger.error(
        VideoEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.VIDEO_SERVICE,
        { operation: 'search', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to search videos');
    }
  }
}
