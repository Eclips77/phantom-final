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
import { PlaylistApiService } from './playlist-api.service';
import type { CreatePlaylistDto } from './dto/create-playlist.dto';
import type { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlists')
export class PlaylistApiController {
  constructor(private readonly playlistApiService: PlaylistApiService) {}

  @Post()
  create(@Body() dto: CreatePlaylistDto) {
    return this.playlistApiService.create(dto);
  }

  @Get()
  findAll() {
    return this.playlistApiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistApiService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistApiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    if (!id?.trim()) throw new BadRequestException('Playlist ID is required');
    return this.playlistApiService.remove(id);
  }
}
