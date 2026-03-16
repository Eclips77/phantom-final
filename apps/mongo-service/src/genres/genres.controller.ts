import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  async create(@Body() createGenreDto: Record<string, unknown>) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  async findAll(@Query() query: Record<string, string>) {
    return this.genresService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.genresService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGenreDto: Record<string, unknown>,
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.genresService.remove(id);
  }
}
