import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GenreService } from '../genre.service';
import { Genre } from '../genre.schema';
import { LoggerService } from '@app/logger';
import {
  createChainableMock,
  createLoggerMock,
  createModelMock,
} from '../../__test-helpers__/model.mock';
import {
  VALID_GENRE_ID,
  INVALID_GENRE_ID,
  VALID_CREATE_DTO,
  MOCK_GENRE_DOCUMENT,
  MOCK_GENRE_LIST,
  VALID_UPDATE_DTO,
  MISSING_NAME_CASES,
} from './fixtures/genre.fixtures';

describe('GenreService', () => {
  let service: GenreService;
  let genreModel: ReturnType<typeof createModelMock>;
  let logger: ReturnType<typeof createLoggerMock>;

  beforeEach(async () => {
    genreModel = createModelMock();
    logger = createLoggerMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        { provide: getModelToken(Genre.name), useValue: genreModel },
        { provide: LoggerService, useValue: logger },
      ],
    }).compile();

    service = module.get(GenreService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('returns the created document on valid input', async () => {
      genreModel.create.mockResolvedValue(MOCK_GENRE_DOCUMENT);

      const result = await service.create(VALID_CREATE_DTO);

      expect(result).toEqual(MOCK_GENRE_DOCUMENT);
      expect(genreModel.create).toHaveBeenCalledWith(VALID_CREATE_DTO);
    });

    it.each(MISSING_NAME_CASES)(
      'throws BadRequestException when $label',
      async ({ dto }) => {
        await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
        expect(genreModel.create).not.toHaveBeenCalled();
      },
    );

    it('throws ConflictException on duplicate key error (code 11000)', async () => {
      const dupError = Object.assign(new Error('duplicate'), { code: 11000 });
      genreModel.create.mockRejectedValue(dupError);

      await expect(service.create(VALID_CREATE_DTO)).rejects.toThrow(ConflictException);
    });

    it('throws InternalServerErrorException on generic db error', async () => {
      genreModel.create.mockRejectedValue(new Error('DB failure'));

      await expect(service.create(VALID_CREATE_DTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('returns all genres when no filter is given', async () => {
      genreModel.find.mockReturnValue(createChainableMock(MOCK_GENRE_LIST));

      const result = await service.findAll();

      expect(result).toEqual(MOCK_GENRE_LIST);
      expect(genreModel.find).toHaveBeenCalledWith({});
    });

    it('applies a case-insensitive regex filter when name is provided', async () => {
      genreModel.find.mockReturnValue(createChainableMock([MOCK_GENRE_DOCUMENT]));

      await service.findAll('action');

      const callArg = genreModel.find.mock.calls[0][0] as any;
      expect(callArg.name.$regex).toBeInstanceOf(RegExp);
      expect(callArg.name.$regex.flags).toContain('i');
    });

    it('returns an empty array when no genres match', async () => {
      genreModel.find.mockReturnValue(createChainableMock([]));

      await expect(service.findAll('nonexistent')).resolves.toEqual([]);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      genreModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('returns the document when found', async () => {
      genreModel.findById.mockReturnValue(createChainableMock(MOCK_GENRE_DOCUMENT));

      const result = await service.findOne(VALID_GENRE_ID);

      expect(result).toEqual(MOCK_GENRE_DOCUMENT);
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.findOne(INVALID_GENRE_ID)).rejects.toThrow(BadRequestException);
      expect(genreModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when document does not exist', async () => {
      genreModel.findById.mockReturnValue(createChainableMock(null));

      await expect(service.findOne(VALID_GENRE_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      genreModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findOne(VALID_GENRE_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('returns the updated document on valid input', async () => {
      const updated = { ...MOCK_GENRE_DOCUMENT, ...VALID_UPDATE_DTO };
      genreModel.findByIdAndUpdate.mockReturnValue(createChainableMock(updated));

      const result = await service.update(VALID_GENRE_ID, VALID_UPDATE_DTO);

      expect(result).toEqual(updated);
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.update(INVALID_GENRE_ID, VALID_UPDATE_DTO)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when dto is empty', async () => {
      await expect(service.update(VALID_GENRE_ID, {})).rejects.toThrow(BadRequestException);
      expect(genreModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('throws ConflictException when new name already exists (code 11000)', async () => {
      const dupError = Object.assign(new Error('duplicate'), { code: 11000 });
      genreModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(dupError),
      });

      await expect(service.update(VALID_GENRE_ID, { name: 'Drama' })).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when document does not exist', async () => {
      genreModel.findByIdAndUpdate.mockReturnValue(createChainableMock(null));

      await expect(service.update(VALID_GENRE_ID, VALID_UPDATE_DTO)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException on generic db error', async () => {
      genreModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.update(VALID_GENRE_ID, VALID_UPDATE_DTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('returns { deleted: true, id } on success', async () => {
      genreModel.findByIdAndDelete.mockReturnValue(createChainableMock(MOCK_GENRE_DOCUMENT));

      const result = await service.remove(VALID_GENRE_ID);

      expect(result).toEqual({ deleted: true, id: VALID_GENRE_ID });
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.remove(INVALID_GENRE_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when document does not exist', async () => {
      genreModel.findByIdAndDelete.mockReturnValue(createChainableMock(null));

      await expect(service.remove(VALID_GENRE_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      genreModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.remove(VALID_GENRE_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateGenreName', () => {
    it('returns { valid: true, name } when genre exists', async () => {
      genreModel.exists.mockResolvedValue({ _id: VALID_GENRE_ID });

      const result = await service.validateGenreName('Action');

      expect(result).toEqual({ valid: true, name: 'Action' });
    });

    it.each([
      { label: 'empty name', name: '' },
      { label: 'whitespace name', name: '   ' },
      { label: 'undefined name', name: undefined as any },
    ])('throws BadRequestException for $label', async ({ name }) => {
      await expect(service.validateGenreName(name)).rejects.toThrow(BadRequestException);
      expect(genreModel.exists).not.toHaveBeenCalled();
    });

    it('throws UnprocessableEntityException when genre does not exist', async () => {
      genreModel.exists.mockResolvedValue(null);

      await expect(service.validateGenreName('Unknown')).rejects.toThrow(UnprocessableEntityException);
    });

    it('uses a case-insensitive regex for the name match', async () => {
      genreModel.exists.mockResolvedValue({ _id: VALID_GENRE_ID });

      await service.validateGenreName('action');

      const callArg = genreModel.exists.mock.calls[0][0] as any;
      expect(callArg.name.$regex).toBeInstanceOf(RegExp);
      expect(callArg.name.$regex.flags).toContain('i');
    });
  });
});
