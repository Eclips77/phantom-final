import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Playlist } from './playlist.schema';
import type { PlaylistDocument } from './playlist.schema';
import type { CreatePlaylistDto } from './dto/create-playlist.dto';
import type { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { LoggerService } from '@app/logger';
import { MongoServiceContext, PlaylistEvent } from '../constants/log-events';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel(Playlist.name) private readonly playlistModel: Model<PlaylistDocument>,
    private readonly logger: LoggerService,
  ) {}

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" is not a valid playlist ID`);
    }
  }

  async create(dto: CreatePlaylistDto): Promise<PlaylistDocument> {
    if (!dto.name?.trim()) throw new BadRequestException('Playlist name is required');

    this.logger.log(PlaylistEvent.CREATING, MongoServiceContext.PLAYLIST_SERVICE, {
      name: dto.name,
      videoCount: dto.videoIds?.length ?? 0,
    });

    try {
      const playlist = await this.playlistModel.create(dto);
      this.logger.log(PlaylistEvent.CREATED, MongoServiceContext.PLAYLIST_SERVICE, {
        playlistId: String(playlist._id),
        name: playlist.name,
      });
      return playlist;
    } catch (err) {
      this.logger.error(
        PlaylistEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.PLAYLIST_SERVICE,
        { operation: 'create', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to create playlist record');
    }
  }

  async findAll(): Promise<PlaylistDocument[]> {
    this.logger.log(PlaylistEvent.FETCH_ALL, MongoServiceContext.PLAYLIST_SERVICE);
    try {
      return await this.playlistModel.find().sort({ createdAt: -1 }).lean().exec() as unknown as PlaylistDocument[];
    } catch (err) {
      this.logger.error(
        PlaylistEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.PLAYLIST_SERVICE,
        { operation: 'findAll', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve playlists');
    }
  }

  async findOne(id: string): Promise<PlaylistDocument> {
    this.assertValidId(id);
    this.logger.log(PlaylistEvent.FETCH_ONE, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });

    let playlist: PlaylistDocument | null;
    try {
      playlist = await this.playlistModel.findById(id).lean().exec() as unknown as PlaylistDocument | null;
    } catch (err) {
      this.logger.error(
        PlaylistEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.PLAYLIST_SERVICE,
        { operation: 'findOne', playlistId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve playlist');
    }

    if (!playlist) {
      this.logger.warn(PlaylistEvent.NOT_FOUND, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });
      throw new NotFoundException(`Playlist with id "${id}" not found`);
    }

    return playlist;
  }

  async update(id: string, dto: UpdatePlaylistDto): Promise<PlaylistDocument> {
    this.assertValidId(id);

    const fields = Object.keys(dto).filter((k) => (dto as any)[k] !== undefined);
    if (fields.length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    this.logger.log(PlaylistEvent.UPDATING, MongoServiceContext.PLAYLIST_SERVICE, {
      playlistId: id,
      fields,
    });

    let updated: PlaylistDocument | null;
    try {
      updated = await this.playlistModel
        .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
        .lean()
        .exec() as unknown as PlaylistDocument | null;
    } catch (err) {
      this.logger.error(
        PlaylistEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.PLAYLIST_SERVICE,
        { operation: 'update', playlistId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to update playlist record');
    }

    if (!updated) {
      this.logger.warn(PlaylistEvent.NOT_FOUND, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });
      throw new NotFoundException(`Playlist with id "${id}" not found`);
    }

    this.logger.log(PlaylistEvent.UPDATED, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    this.assertValidId(id);
    this.logger.log(PlaylistEvent.DELETING, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });

    let result: PlaylistDocument | null;
    try {
      result = await this.playlistModel.findByIdAndDelete(id).lean().exec() as unknown as PlaylistDocument | null;
    } catch (err) {
      this.logger.error(
        PlaylistEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.PLAYLIST_SERVICE,
        { operation: 'remove', playlistId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to delete playlist record');
    }

    if (!result) {
      this.logger.warn(PlaylistEvent.NOT_FOUND, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });
      throw new NotFoundException(`Playlist with id "${id}" not found`);
    }

    this.logger.log(PlaylistEvent.DELETED, MongoServiceContext.PLAYLIST_SERVICE, { playlistId: id });
    return { deleted: true, id };
  }
}
