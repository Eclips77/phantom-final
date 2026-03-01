import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import type { CreateGenreDto } from './dto/create-genre.dto';
import type { UpdateGenreDto } from './dto/update-genre.dto';

@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGenreDto) {
    return this.genreService.create(dto);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body('genre') genre: string) {
    if (!genre?.trim()) throw new BadRequestException('genre field is required');
    return this.genreService.validateGenreName(genre);
  }

  @Get()
  findAll(@Query('name') name?: string) {
    return this.genreService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGenreDto) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Genre ID is required');
    return this.genreService.remove(id);
  }
}
