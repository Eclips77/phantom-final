import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { MongoServiceModule } from './../src/mongo-service.module';
import { getModelToken } from '@nestjs/mongoose';
import { Video } from '../src/videos/video.schema';
import { Genre } from '../src/genres/genre.schema';
import { Playlist } from '../src/playlists/playlist.schema';
import { createMockModel } from './mongo-service.mock';

describe('MongoServiceControllers (e2e)', () => {
  let app: INestApplication<App>;

  let videoModel: any;

  let genreModel: any;

  let playlistModel: any;

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    videoModel = createMockModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    genreModel = createMockModel();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    playlistModel = createMockModel();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongoServiceModule],
    })
      .overrideProvider('CONFIGURATION(mongoService)')
      .useValue({ mongoDbUri: 'mongodb://mock', port: 3006, logLevel: 'info' })
      .overrideProvider(getModelToken(Video.name))
      .useValue(videoModel)
      .overrideProvider(getModelToken(Genre.name))
      .useValue(genreModel)
      .overrideProvider(getModelToken(Playlist.name))
      .useValue(playlistModel)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/videos', () => {
    it('/videos (GET)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      videoModel.exec.mockResolvedValue([{ title: 'Test Video' }]);
      return request(app.getHttpServer())
        .get('/videos')
        .expect(200)
        .expect([{ title: 'Test Video' }]);
    });
  });

  describe('/genres', () => {
    it('/genres (GET)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      genreModel.exec.mockResolvedValue([{ name: 'Action' }]);
      return request(app.getHttpServer())
        .get('/genres')
        .expect(200)
        .expect([{ name: 'Action' }]);
    });
  });

  describe('/playlists', () => {
    it('/playlists (GET)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      playlistModel.exec.mockResolvedValue([{ name: 'Favorites' }]);
      return request(app.getHttpServer())
        .get('/playlists')
        .expect(200)
        .expect([{ name: 'Favorites' }]);
    });
  });
});
