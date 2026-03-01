import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import type { CreatePlaylistDto } from './dto/create-playlist.dto';
import type { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePlaylistDto) {
    return this.playlistService.create(dto);
  }

  @Get()
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistService.remove(id);
  }
}
