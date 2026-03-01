import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Genre, GenreSchema } from './genre.schema';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Genre.name, schema: GenreSchema }]),
    LoggerModule,
  ],
  controllers: [GenreController],
  providers: [GenreService],
  exports: [GenreService],
})
export class GenreModule {}
