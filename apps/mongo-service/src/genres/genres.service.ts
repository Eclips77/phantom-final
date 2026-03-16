import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Genre, GenreDocument } from './genre.schema';
import * as _ from 'lodash';

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private genreModel: Model<GenreDocument>,
  ) {}

  async create(createGenreDto: Record<string, unknown>): Promise<Genre> {
    if (_.isEmpty(createGenreDto) || !createGenreDto.name) {
      throw new BadRequestException('Missing required field: name');
    }
    const createdGenre = new this.genreModel(createGenreDto);
    return createdGenre.save();
  }

  async findAll(query?: Record<string, string>): Promise<Genre[]> {
    const filter = {};
    if (query?.name) {
      Object.assign(filter, { name: new RegExp(query.name, 'i') });
    }
    return this.genreModel.find(filter).exec();
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreModel.findById(id).exec();
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async update(
    id: string,
    updateGenreDto: Record<string, unknown>,
  ): Promise<Genre> {
    if (_.isEmpty(updateGenreDto)) {
      throw new BadRequestException('Empty update payload');
    }

    const updatedGenre = await this.genreModel
      .findByIdAndUpdate(id, updateGenreDto, { new: true })
      .exec();

    if (!updatedGenre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return updatedGenre;
  }

  async remove(id: string): Promise<Genre> {
    const deletedGenre = await this.genreModel.findByIdAndDelete(id).exec();
    if (!deletedGenre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return deletedGenre;
  }
}
