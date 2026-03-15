import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import type { CreateGenreDto } from './dto/create-genre.dto';
import type { UpdateGenreDto } from './dto/update-genre.dto';
import { GenreApiContext, GenreApiEvent } from './constants/log-events';
import { genreApiConfig } from './config/app.config';

@Injectable()
export class GenreApiService {
  constructor(
    @Inject(genreApiConfig.KEY)
    private readonly config: ConfigType<typeof genreApiConfig>,
    private readonly logger: LoggerService,
  ) {}

  private get mongoServiceUrl(): string {
    return this.config.mongoServiceUrl;
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
        GenreApiEvent.MONGO_ERROR,
        (err as Error).stack,
        GenreApiContext.SERVICE,
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

  private async assertNameUnique(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const results = await this.fetchMongo<unknown[]>(
      `/genres?name=${encodeURIComponent(name)}`,
    );

    const conflicts = Array.isArray(results)
      ? results.filter(
          (g: { _id?: string }) => !excludeId || g._id !== excludeId,
        )
      : [];

    if (conflicts.length > 0) {
      this.logger.warn(GenreApiEvent.DUPLICATE_NAME, GenreApiContext.SERVICE, {
        name,
      });
      throw new ConflictException(`Genre with name "${name}" already exists`);
    }
  }

  async create(dto: CreateGenreDto): Promise<unknown> {
    if (!dto.name?.trim()) {
      throw new BadRequestException('Genre name is required');
    }

    this.logger.log(GenreApiEvent.CREATING, GenreApiContext.SERVICE, {
      name: dto.name,
    });

    await this.assertNameUnique(dto.name);

    const created = await this.fetchMongo<unknown>('/genres', {
      method: 'POST',
      body: JSON.stringify(dto),
    });

    this.logger.log(GenreApiEvent.CREATED, GenreApiContext.SERVICE, {
      name: dto.name,
    });
    return created;
  }

  async findAll(): Promise<unknown> {
    this.logger.log(GenreApiEvent.FETCH_ALL, GenreApiContext.SERVICE);
    return this.fetchMongo<unknown>('/genres');
  }

  async findOne(id: string): Promise<unknown> {
    this.logger.log(GenreApiEvent.FETCH_ONE, GenreApiContext.SERVICE, { id });

    try {
      return await this.fetchMongo<unknown>(`/genres/${id}`);
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Genre with id "${id}" not found`);
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateGenreDto): Promise<unknown> {
    if (!dto.name && !dto.videoIds) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    this.logger.log(GenreApiEvent.UPDATING, GenreApiContext.SERVICE, {
      id,
      ...dto,
    });

    if (dto.name?.trim()) {
      await this.assertNameUnique(dto.name, id);
    }

    try {
      const updated = await this.fetchMongo<unknown>(`/genres/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });

      this.logger.log(GenreApiEvent.UPDATED, GenreApiContext.SERVICE, { id });
      return updated;
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Genre with id "${id}" not found`);
      }
      throw err;
    }
  }

  async remove(id: string): Promise<unknown> {
    this.logger.log(GenreApiEvent.DELETING, GenreApiContext.SERVICE, { id });

    try {
      const result = await this.fetchMongo<unknown>(`/genres/${id}`, {
        method: 'DELETE',
      });

      this.logger.log(GenreApiEvent.DELETED, GenreApiContext.SERVICE, { id });
      return result;
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) {
        throw new NotFoundException(`Genre with id "${id}" not found`);
      }
      throw err;
    }
  }
}
