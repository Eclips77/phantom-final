import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PlaylistService } from '../playlist.service';
import { Playlist } from '../playlist.schema';
import { LoggerService } from '@app/logger';
import {
  createChainableMock,
  createLoggerMock,
  createModelMock,
} from '../../__test-helpers__/model.mock';
import {
  VALID_PLAYLIST_ID,
  INVALID_PLAYLIST_ID,
  VALID_CREATE_DTO,
  MOCK_PLAYLIST_DOCUMENT,
  MOCK_PLAYLIST_LIST,
  VALID_UPDATE_DTO,
  MISSING_NAME_CASES,
} from './fixtures/playlist.fixtures';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let playlistModel: ReturnType<typeof createModelMock>;
  let logger: ReturnType<typeof createLoggerMock>;

  beforeEach(async () => {
    playlistModel = createModelMock();
    logger = createLoggerMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistService,
        { provide: getModelToken(Playlist.name), useValue: playlistModel },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get(PlaylistService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('returns the created document on valid input', async () => {
      playlistModel.create.mockResolvedValue(MOCK_PLAYLIST_DOCUMENT);

      const result = await service.create(VALID_CREATE_DTO);

      expect(result).toEqual(MOCK_PLAYLIST_DOCUMENT);
      expect(playlistModel.create).toHaveBeenCalledWith(VALID_CREATE_DTO);
    });

    it('creates a playlist without videoIds', async () => {
      const dto = { name: 'Empty Playlist' };
      const doc = { ...MOCK_PLAYLIST_DOCUMENT, videoIds: [] };
      playlistModel.create.mockResolvedValue(doc);

      await expect(service.create(dto)).resolves.toEqual(doc);
    });

    it.each(MISSING_NAME_CASES)(
      'throws BadRequestException when $label',
      async ({ dto }) => {
        await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
        expect(playlistModel.create).not.toHaveBeenCalled();
      },
    );

    it('throws InternalServerErrorException when db throws', async () => {
      playlistModel.create.mockRejectedValue(new Error('DB failure'));

      await expect(service.create(VALID_CREATE_DTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('returns all playlists', async () => {
      playlistModel.find.mockReturnValue(createChainableMock(MOCK_PLAYLIST_LIST));

      const result = await service.findAll();

      expect(result).toEqual(MOCK_PLAYLIST_LIST);
    });

    it('returns an empty array when no playlists exist', async () => {
      playlistModel.find.mockReturnValue(createChainableMock([]));

      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      playlistModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('returns the document when found', async () => {
      playlistModel.findById.mockReturnValue(createChainableMock(MOCK_PLAYLIST_DOCUMENT));

      const result = await service.findOne(VALID_PLAYLIST_ID);

      expect(result).toEqual(MOCK_PLAYLIST_DOCUMENT);
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.findOne(INVALID_PLAYLIST_ID)).rejects.toThrow(BadRequestException);
      expect(playlistModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when document does not exist', async () => {
      playlistModel.findById.mockReturnValue(createChainableMock(null));

      await expect(service.findOne(VALID_PLAYLIST_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      playlistModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findOne(VALID_PLAYLIST_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('returns the updated document on valid input', async () => {
      const updated = { ...MOCK_PLAYLIST_DOCUMENT, ...VALID_UPDATE_DTO };
      playlistModel.findByIdAndUpdate.mockReturnValue(createChainableMock(updated));

      const result = await service.update(VALID_PLAYLIST_ID, VALID_UPDATE_DTO);

      expect(result).toEqual(updated);
      expect(playlistModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_PLAYLIST_ID,
        { $set: VALID_UPDATE_DTO },
        { new: true, runValidators: true },
      );
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.update(INVALID_PLAYLIST_ID, VALID_UPDATE_DTO)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when dto is empty', async () => {
      await expect(service.update(VALID_PLAYLIST_ID, {})).rejects.toThrow(BadRequestException);
      expect(playlistModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('allows updating only videoIds', async () => {
      const dto = { videoIds: ['64a1f2e3b4c5d6e7f8a9b0c1'] };
      const updated = { ...MOCK_PLAYLIST_DOCUMENT, ...dto };
      playlistModel.findByIdAndUpdate.mockReturnValue(createChainableMock(updated));

      await expect(service.update(VALID_PLAYLIST_ID, dto)).resolves.toEqual(updated);
    });

    it('throws NotFoundException when document does not exist', async () => {
      playlistModel.findByIdAndUpdate.mockReturnValue(createChainableMock(null));

      await expect(service.update(VALID_PLAYLIST_ID, VALID_UPDATE_DTO)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      playlistModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.update(VALID_PLAYLIST_ID, VALID_UPDATE_DTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('returns { deleted: true, id } on success', async () => {
      playlistModel.findByIdAndDelete.mockReturnValue(createChainableMock(MOCK_PLAYLIST_DOCUMENT));

      const result = await service.remove(VALID_PLAYLIST_ID);

      expect(result).toEqual({ deleted: true, id: VALID_PLAYLIST_ID });
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.remove(INVALID_PLAYLIST_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when document does not exist', async () => {
      playlistModel.findByIdAndDelete.mockReturnValue(createChainableMock(null));

      await expect(service.remove(VALID_PLAYLIST_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      playlistModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.remove(VALID_PLAYLIST_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
