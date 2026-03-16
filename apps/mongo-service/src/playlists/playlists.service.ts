import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Playlist, PlaylistDocument } from './playlist.schema';
import * as _ from 'lodash';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<PlaylistDocument>,
  ) {}

  async create(createPlaylistDto: Record<string, unknown>): Promise<Playlist> {
    if (_.isEmpty(createPlaylistDto) || !createPlaylistDto.name) {
      throw new BadRequestException('Missing required field: name');
    }
    const createdPlaylist = new this.playlistModel(createPlaylistDto);
    return createdPlaylist.save();
  }

  async findAll(): Promise<Playlist[]> {
    return this.playlistModel.find().exec();
  }

  async findOne(id: string): Promise<Playlist> {
    const playlist = await this.playlistModel.findById(id).exec();
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }
    return playlist;
  }

  async update(
    id: string,
    updatePlaylistDto: Record<string, unknown>,
  ): Promise<Playlist> {
    if (_.isEmpty(updatePlaylistDto)) {
      throw new BadRequestException('Empty update payload');
    }

    const updatedPlaylist = await this.playlistModel
      .findByIdAndUpdate(id, updatePlaylistDto, { new: true })
      .exec();

    if (!updatedPlaylist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }
    return updatedPlaylist;
  }

  async remove(id: string): Promise<Playlist> {
    const deletedPlaylist = await this.playlistModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedPlaylist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }
    return deletedPlaylist;
  }

  async addVideo(id: string, videoId: string): Promise<Playlist> {
    if (!videoId) {
      throw new BadRequestException('videoId is required');
    }
    const updatedPlaylist = await this.playlistModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { videoIds: videoId } },
        { new: true },
      )
      .exec();

    if (!updatedPlaylist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }
    return updatedPlaylist;
  }

  async removeVideo(id: string, videoId: string): Promise<Playlist> {
    const updatedPlaylist = await this.playlistModel
      .findByIdAndUpdate(id, { $pull: { videoIds: videoId } }, { new: true })
      .exec();

    if (!updatedPlaylist) {
      throw new NotFoundException(`Playlist with ID ${id} not found`);
    }
    return updatedPlaylist;
  }
}
