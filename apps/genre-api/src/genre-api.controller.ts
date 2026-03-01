import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { GenreApiService } from './genre-api.service';
import type { CreateGenreDto } from './dto/create-genre.dto';
import type { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genres')
export class GenreApiController {
  constructor(private readonly genreApiService: GenreApiService) {}

  @Post()
  create(@Body() dto: CreateGenreDto) {
    return this.genreApiService.create(dto);
  }

  @Get()
  findAll() {
    return this.genreApiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreApiService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreApiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreApiService.remove(id);
  }
}
