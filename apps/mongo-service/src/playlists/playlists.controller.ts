import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  async create(@Body() createPlaylistDto: Record<string, unknown>) {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  async findAll() {
    return this.playlistsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: Record<string, unknown>,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @Post(':id/videos')
  async addVideo(@Param('id') id: string, @Body('videoId') videoId: string) {
    return this.playlistsService.addVideo(id, videoId);
  }

  @Delete(':id/videos/:videoId')
  async removeVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
  ) {
    return this.playlistsService.removeVideo(id, videoId);
  }
}
