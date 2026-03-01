import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Genre } from './genre.schema';
import type { GenreDocument } from './genre.schema';
import type { CreateGenreDto } from './dto/create-genre.dto';
import type { UpdateGenreDto } from './dto/update-genre.dto';
import { LoggerService } from '@app/logger';
import { MongoServiceContext, GenreEvent } from '../constants/log-events';

@Injectable()
export class GenreService {
  constructor(
    @InjectModel(Genre.name) private readonly genreModel: Model<GenreDocument>,
    private readonly logger: LoggerService,
  ) {}

  private assertValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`"${id}" is not a valid genre ID`);
    }
  }

  async create(dto: CreateGenreDto): Promise<GenreDocument> {
    if (!dto.name?.trim()) throw new BadRequestException('Genre name is required');

    this.logger.log(GenreEvent.CREATING, MongoServiceContext.GENRE_SERVICE, { name: dto.name });

    try {
      const genre = await this.genreModel.create(dto);
      this.logger.log(GenreEvent.CREATED, MongoServiceContext.GENRE_SERVICE, {
        genreId: String(genre._id),
        name: genre.name,
      });
      return genre;
    } catch (err: any) {
      if (err.code === 11000) {
        this.logger.warn(GenreEvent.DB_ERROR, MongoServiceContext.GENRE_SERVICE, {
          name: dto.name,
          reason: 'duplicate_key',
        });
        throw new ConflictException(`Genre with name "${dto.name}" already exists`);
      }
      this.logger.error(
        GenreEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.GENRE_SERVICE,
        { operation: 'create', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to create genre record');
    }
  }

  async findAll(name?: string): Promise<GenreDocument[]> {
    this.logger.log(GenreEvent.FETCH_ALL, MongoServiceContext.GENRE_SERVICE, { filter: name ?? null });

    const filter = name ? { name: { $regex: new RegExp(name, 'i') } } : {};

    try {
      return await this.genreModel.find(filter).sort({ name: 1 }).lean().exec() as unknown as GenreDocument[];
    } catch (err) {
      this.logger.error(
        GenreEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.GENRE_SERVICE,
        { operation: 'findAll', error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve genres');
    }
  }

  async findOne(id: string): Promise<GenreDocument> {
    this.assertValidId(id);
    this.logger.log(GenreEvent.FETCH_ONE, MongoServiceContext.GENRE_SERVICE, { genreId: id });

    let genre: GenreDocument | null;
    try {
      genre = await this.genreModel.findById(id).lean().exec() as unknown as GenreDocument | null;
    } catch (err) {
      this.logger.error(
        GenreEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.GENRE_SERVICE,
        { operation: 'findOne', genreId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to retrieve genre');
    }

    if (!genre) {
      this.logger.warn(GenreEvent.NOT_FOUND, MongoServiceContext.GENRE_SERVICE, { genreId: id });
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    return genre;
  }

  async update(id: string, dto: UpdateGenreDto): Promise<GenreDocument> {
    this.assertValidId(id);

    const fields = Object.keys(dto).filter((k) => (dto as any)[k] !== undefined);
    if (fields.length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    this.logger.log(GenreEvent.UPDATING, MongoServiceContext.GENRE_SERVICE, { genreId: id, fields });

    let updated: GenreDocument | null;
    try {
      updated = await this.genreModel
        .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
        .lean()
        .exec() as unknown as GenreDocument | null;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException(`Genre with name "${dto.name}" already exists`);
      }
      this.logger.error(
        GenreEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.GENRE_SERVICE,
        { operation: 'update', genreId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to update genre record');
    }

    if (!updated) {
      this.logger.warn(GenreEvent.NOT_FOUND, MongoServiceContext.GENRE_SERVICE, { genreId: id });
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    this.logger.log(GenreEvent.UPDATED, MongoServiceContext.GENRE_SERVICE, { genreId: id });
    return updated;
  }

  async remove(id: string): Promise<{ deleted: boolean; id: string }> {
    this.assertValidId(id);
    this.logger.log(GenreEvent.DELETING, MongoServiceContext.GENRE_SERVICE, { genreId: id });

    let result: GenreDocument | null;
    try {
      result = await this.genreModel.findByIdAndDelete(id).lean().exec() as unknown as GenreDocument | null;
    } catch (err) {
      this.logger.error(
        GenreEvent.DB_ERROR,
        (err as Error).stack,
        MongoServiceContext.GENRE_SERVICE,
        { operation: 'remove', genreId: id, error: (err as Error).message },
      );
      throw new InternalServerErrorException('Failed to delete genre record');
    }

    if (!result) {
      this.logger.warn(GenreEvent.NOT_FOUND, MongoServiceContext.GENRE_SERVICE, { genreId: id });
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    this.logger.log(GenreEvent.DELETED, MongoServiceContext.GENRE_SERVICE, { genreId: id });
    return { deleted: true, id };
  }

  async validateGenreName(name: string): Promise<{ valid: boolean; name: string }> {
    if (!name?.trim()) throw new BadRequestException('Genre name is required for validation');

    this.logger.log(GenreEvent.VALIDATE, MongoServiceContext.GENRE_SERVICE, { name });

    const exists = await this.genreModel.exists({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!exists) {
      this.logger.warn(GenreEvent.NOT_VALID, MongoServiceContext.GENRE_SERVICE, { name });
      throw new UnprocessableEntityException(`Genre "${name}" is not a recognized genre`);
    }

    return { valid: true, name };
  }
}
