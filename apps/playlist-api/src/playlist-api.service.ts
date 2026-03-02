import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import type { CreatePlaylistDto } from './dto/create-playlist.dto';
import type { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistApiContext, PlaylistApiEvent } from './constants/log-events';

@Injectable()
export class PlaylistApiService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private get mongoServiceUrl(): string {
    return this.config.get<string>('playlistApi.mongoServiceUrl')!;
  }

  private get videoServiceUrl(): string {
    return this.config.get<string>('playlistApi.videoServiceUrl')!;
  }

  private async fetchMongo<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.mongoServiceUrl}${path}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...init,
      });
    } catch (err) {
      this.logger.error(
        PlaylistApiEvent.MONGO_ERROR,
        (err as Error).stack,
        PlaylistApiContext.SERVICE,
        { url, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Mongo service is unreachable');
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new HttpException(body || response.statusText, response.status);
    }

    return response.json() as Promise<T>;
  }

  private async assertVideosExist(videoIds: string[]): Promise<void> {
    if (!videoIds.length) return;

    const unique = [...new Set(videoIds)];

    const checks = await Promise.allSettled(
      unique.map(async (id) => {
        const url = `${this.videoServiceUrl}/videos/${id}`;
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(id);
        return id;
      }),
    );

    const missing = checks
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => (r.reason as Error).message);

    if (missing.length > 0) {
      this.logger.warn(
        PlaylistApiEvent.VIDEOS_NOT_FOUND,
        PlaylistApiContext.SERVICE,
        {
          missingVideoIds: missing,
        },
      );
      throw new BadRequestException(
        `The following video IDs do not exist: ${missing.join(', ')}`,
      );
    }
  }

  async create(dto: CreatePlaylistDto): Promise<unknown> {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Playlist name is required');
    }

    this.logger.log(PlaylistApiEvent.CREATING, PlaylistApiContext.SERVICE, {
      name: dto.name,
    });

    if (dto.videoIds?.length) {
      await this.assertVideosExist(dto.videoIds);
    }

    const created = await this.fetchMongo<unknown>('/playlists', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    this.logger.log(PlaylistApiEvent.CREATED, PlaylistApiContext.SERVICE, {
      name: dto.name,
      videoCount: dto.videoIds?.length ?? 0,
    });

    return created;
  }

  async findAll(): Promise<unknown> {
    this.logger.log(PlaylistApiEvent.FETCH_ALL, PlaylistApiContext.SERVICE);
    return this.fetchMongo<unknown>('/playlists');
  }

  async findOne(id: string): Promise<unknown> {
    this.logger.log(PlaylistApiEvent.FETCH_ONE, PlaylistApiContext.SERVICE, {
      id,
    });

    try {
      return await this.fetchMongo<unknown>(`/playlists/${id}`);
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Playlist with id "${id}" not found`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdatePlaylistDto): Promise<unknown> {
    if (!dto.name && !dto.videoIds) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    this.logger.log(PlaylistApiEvent.UPDATING, PlaylistApiContext.SERVICE, {
      id,
      ...dto,
    });

    if (dto.videoIds?.length) {
      await this.assertVideosExist(dto.videoIds);
    }

    try {
      const updated = await this.fetchMongo<unknown>(`/playlists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });

      this.logger.log(PlaylistApiEvent.UPDATED, PlaylistApiContext.SERVICE, {
        id,
      });
      return updated;
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Playlist with id "${id}" not found`);
      }
      throw err;
    }
  }

  async remove(id: string): Promise<unknown> {
    this.logger.log(PlaylistApiEvent.DELETING, PlaylistApiContext.SERVICE, {
      id,
    });

    try {
      const result = await this.fetchMongo<unknown>(`/playlists/${id}`, {
        method: 'DELETE',
      });

      this.logger.log(PlaylistApiEvent.DELETED, PlaylistApiContext.SERVICE, {
        id,
      });
      return result;
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Playlist with id "${id}" not found`);
      }
      throw err;
    }
  }
}
