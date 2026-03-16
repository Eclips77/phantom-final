import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './video.schema';
import * as _ from 'lodash';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async create(createVideoDto: Record<string, unknown>): Promise<Video> {
    if (
      _.isEmpty(createVideoDto) ||
      !createVideoDto.title ||
      !createVideoDto.filePath ||
      !createVideoDto.fileName ||
      !createVideoDto.mimeType
    ) {
      throw new BadRequestException('Missing required fields');
    }
    const createdVideo = new this.videoModel(createVideoDto);
    return createdVideo.save();
  }

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }

  async update(
    id: string,
    updateVideoDto: Record<string, unknown>,
  ): Promise<Video> {
    if (_.isEmpty(updateVideoDto)) {
      throw new BadRequestException('Empty update payload');
    }

    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return updatedVideo;
  }

  async remove(id: string): Promise<Video> {
    const deletedVideo = await this.videoModel.findByIdAndDelete(id).exec();
    if (!deletedVideo) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return deletedVideo;
  }
}
