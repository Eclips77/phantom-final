import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VideoService } from '../video.service';
import { Video } from '../video.schema';
import { VideoQueryResolver } from '../query/video-query.resolver';
import { LoggerService } from '@app/logger';
import {
  createChainableMock,
  createExecMock,
  createLoggerMock,
  createModelMock,
} from '../../__test-helpers__/model.mock';
import {
  VALID_VIDEO_ID,
  INVALID_VIDEO_ID,
  VALID_CREATE_DTO,
  MOCK_VIDEO_DOCUMENT,
  MOCK_VIDEO_LIST,
  VALID_UPDATE_DTO,
  MISSING_TITLE_CASES,
  MISSING_REQUIRED_FIELD_CASES,
} from './fixtures/video.fixtures';

describe('VideoService', () => {
  let service: VideoService;
  let videoModel: ReturnType<typeof createModelMock>;
  let logger: ReturnType<typeof createLoggerMock>;
  let queryResolver: { resolve: jest.Mock };

  beforeEach(async () => {
    videoModel = createModelMock();
    logger = createLoggerMock();
    queryResolver = { resolve: jest.fn().mockReturnValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: getModelToken(Video.name), useValue: videoModel },
        { provide: LoggerService, useValue: logger },
        { provide: VideoQueryResolver, useValue: queryResolver },
      ],
    }).compile();

    service = module.get(VideoService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('returns the created document on valid input', async () => {
      videoModel.create.mockResolvedValue(MOCK_VIDEO_DOCUMENT);

      const result = await service.create(VALID_CREATE_DTO);

      expect(result).toEqual(MOCK_VIDEO_DOCUMENT);
      expect(videoModel.create).toHaveBeenCalledWith(VALID_CREATE_DTO);
    });

    it('accepts zero duration as valid', async () => {
      videoModel.create.mockResolvedValue({ ...MOCK_VIDEO_DOCUMENT, duration: 0 });

      await expect(service.create({ ...VALID_CREATE_DTO, duration: 0 })).resolves.toBeDefined();
    });

    it.each(MISSING_TITLE_CASES)(
      'throws BadRequestException when $label',
      async ({ dto }) => {
        await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
        expect(videoModel.create).not.toHaveBeenCalled();
      },
    );

    it.each(MISSING_REQUIRED_FIELD_CASES)(
      'throws BadRequestException when $label',
      async ({ dto }) => {
        await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
        expect(videoModel.create).not.toHaveBeenCalled();
      },
    );

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.create.mockRejectedValue(new Error('DB failure'));

      await expect(service.create(VALID_CREATE_DTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('returns a list of video documents', async () => {
      videoModel.find.mockReturnValue(createChainableMock(MOCK_VIDEO_LIST));

      const result = await service.findAll();

      expect(result).toEqual(MOCK_VIDEO_LIST);
      expect(videoModel.find).toHaveBeenCalledWith();
    });

    it('returns an empty array when no videos exist', async () => {
      videoModel.find.mockReturnValue(createChainableMock([]));

      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.find.mockReturnValue(createChainableMock(null));
      videoModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('returns the document when found', async () => {
      videoModel.findById.mockReturnValue(createChainableMock(MOCK_VIDEO_DOCUMENT));

      const result = await service.findOne(VALID_VIDEO_ID);

      expect(result).toEqual(MOCK_VIDEO_DOCUMENT);
      expect(videoModel.findById).toHaveBeenCalledWith(VALID_VIDEO_ID);
    });

    it('throws BadRequestException for an invalid ObjectId', async () => {
      await expect(service.findOne(INVALID_VIDEO_ID)).rejects.toThrow(BadRequestException);
      expect(videoModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when no document matches', async () => {
      videoModel.findById.mockReturnValue(createChainableMock(null));

      await expect(service.findOne(VALID_VIDEO_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.findById.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.findOne(VALID_VIDEO_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('returns the updated document on valid input', async () => {
      const updated = { ...MOCK_VIDEO_DOCUMENT, ...VALID_UPDATE_DTO };
      videoModel.findByIdAndUpdate.mockReturnValue(createChainableMock(updated));

      const result = await service.update(VALID_VIDEO_ID, VALID_UPDATE_DTO);

      expect(result).toEqual(updated);
      expect(videoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_VIDEO_ID,
        { $set: VALID_UPDATE_DTO },
        { new: true, runValidators: true },
      );
    });

    it('throws BadRequestException for invalid ObjectId', async () => {
      await expect(service.update(INVALID_VIDEO_ID, VALID_UPDATE_DTO)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when dto is empty', async () => {
      await expect(service.update(VALID_VIDEO_ID, {})).rejects.toThrow(BadRequestException);
      expect(videoModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for negative duration', async () => {
      await expect(service.update(VALID_VIDEO_ID, { duration: -5 })).rejects.toThrow(BadRequestException);
    });

    it('accepts zero duration in update', async () => {
      const updated = { ...MOCK_VIDEO_DOCUMENT, duration: 0 };
      videoModel.findByIdAndUpdate.mockReturnValue(createChainableMock(updated));

      await expect(service.update(VALID_VIDEO_ID, { duration: 0 })).resolves.toEqual(updated);
    });

    it('throws NotFoundException when document does not exist', async () => {
      videoModel.findByIdAndUpdate.mockReturnValue(createChainableMock(null));

      await expect(service.update(VALID_VIDEO_ID, VALID_UPDATE_DTO)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.update(VALID_VIDEO_ID, VALID_UPDATE_DTO)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('returns { deleted: true, id } on success', async () => {
      videoModel.findByIdAndDelete.mockReturnValue(createChainableMock(MOCK_VIDEO_DOCUMENT));

      const result = await service.remove(VALID_VIDEO_ID);

      expect(result).toEqual({ deleted: true, id: VALID_VIDEO_ID });
    });

    it('throws BadRequestException for invalid ObjectId', async () => {
      await expect(service.remove(INVALID_VIDEO_ID)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when document does not exist', async () => {
      videoModel.findByIdAndDelete.mockReturnValue(createChainableMock(null));

      await expect(service.remove(VALID_VIDEO_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await expect(service.remove(VALID_VIDEO_ID)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('search', () => {
    const makeSearchMocks = (docs: unknown[], total: number) => {
      videoModel.find.mockReturnValue(createChainableMock(docs));
      videoModel.countDocuments.mockReturnValue(createExecMock(total));
    };

    it('returns paginated results with default page and limit', async () => {
      makeSearchMocks(MOCK_VIDEO_LIST, 2);

      const result = await service.search({});

      expect(result).toEqual({ data: MOCK_VIDEO_LIST, total: 2, page: 1, limit: 20 });
    });

    it('calls queryResolver.resolve with the provided dto', async () => {
      const filter = { genre: 'Action' };
      queryResolver.resolve.mockReturnValue(filter);
      makeSearchMocks(MOCK_VIDEO_LIST, 2);

      await service.search({ genre: 'Action' });

      expect(queryResolver.resolve).toHaveBeenCalledWith({ genre: 'Action' });
    });

    it('passes the resolved filter to model.find', async () => {
      const filter = { language: 'english' };
      queryResolver.resolve.mockReturnValue(filter);
      makeSearchMocks(MOCK_VIDEO_LIST, 2);

      await service.search({ language: 'English' });

      expect(videoModel.find).toHaveBeenCalledWith(filter);
    });

    it.each([
      { label: 'page below 1 normalises to 1', dto: { page: 0 }, expectedPage: 1 },
      { label: 'negative page normalises to 1', dto: { page: -5 }, expectedPage: 1 },
    ])('$label', async ({ dto, expectedPage }) => {
      makeSearchMocks([], 0);

      const result = await service.search(dto);

      expect(result.page).toBe(expectedPage);
    });

    it.each([
      { label: 'limit above 100 clamps to 100', dto: { limit: 200 }, expectedLimit: 100 },
      { label: 'limit below 1 normalises to 20', dto: { limit: 0 }, expectedLimit: 20 },
      { label: 'limit of 1 is valid', dto: { limit: 1 }, expectedLimit: 1 },
    ])('$label', async ({ dto, expectedLimit }) => {
      makeSearchMocks([], 0);

      const result = await service.search(dto);

      expect(result.limit).toBe(expectedLimit);
    });

    it('returns empty data with correct total when no results', async () => {
      makeSearchMocks([], 0);

      const result = await service.search({ genre: 'Unknown' });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });

    it('propagates BadRequestException thrown by queryResolver', async () => {
      queryResolver.resolve.mockImplementation(() => {
        throw new BadRequestException('minDuration must be a non-negative number');
      });

      await expect(service.search({ minDuration: -1 })).rejects.toThrow(BadRequestException);
      expect(videoModel.find).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when db throws', async () => {
      videoModel.find.mockReturnValue(createChainableMock(null));
      videoModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB failure')),
      });
      videoModel.countDocuments.mockReturnValue(createExecMock(0));

      await expect(service.search({})).rejects.toThrow(InternalServerErrorException);
    });
  });
});
