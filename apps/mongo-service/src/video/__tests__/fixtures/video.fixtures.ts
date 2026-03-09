import type { CreateVideoDto } from '../../dto/create-video.dto';
import type { UpdateVideoDto } from '../../dto/update-video.dto';
import type { SearchVideoDto } from '../../dto/search-video.dto';

export const VALID_VIDEO_ID = '64a1f2e3b4c5d6e7f8a9b0c1';
export const ANOTHER_VIDEO_ID = '64a1f2e3b4c5d6e7f8a9b0c2';
export const INVALID_VIDEO_ID = 'not-a-valid-id';

export const VALID_CREATE_DTO: CreateVideoDto = {
  title: 'Test Video',
  description: 'A test description',
  language: 'English',
  duration: 120,
  genre: 'Action',
  filePath: '/uploads/test-video.mp4',
  fileName: 'test-video.mp4',
  mimeType: 'video/mp4',
};

export const MOCK_VIDEO_DOCUMENT = {
  _id: VALID_VIDEO_ID,
  ...VALID_CREATE_DTO,
  language: 'english',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const MOCK_VIDEO_LIST = [
  MOCK_VIDEO_DOCUMENT,
  { ...MOCK_VIDEO_DOCUMENT, _id: ANOTHER_VIDEO_ID, title: 'Second Video' },
];

export const VALID_UPDATE_DTO: UpdateVideoDto = {
  title: 'Updated Title',
  duration: 150,
};

export const MISSING_TITLE_CASES: Array<{ label: string; dto: Partial<CreateVideoDto> }> = [
  { label: 'missing title', dto: { ...VALID_CREATE_DTO, title: undefined as any } },
  { label: 'empty title', dto: { ...VALID_CREATE_DTO, title: '' } },
  { label: 'whitespace title', dto: { ...VALID_CREATE_DTO, title: '   ' } },
];

export const MISSING_REQUIRED_FIELD_CASES: Array<{ label: string; dto: Partial<CreateVideoDto> }> = [
  { label: 'missing language', dto: { ...VALID_CREATE_DTO, language: undefined as any } },
  { label: 'empty language', dto: { ...VALID_CREATE_DTO, language: '' } },
  { label: 'missing genre', dto: { ...VALID_CREATE_DTO, genre: undefined as any } },
  { label: 'empty genre', dto: { ...VALID_CREATE_DTO, genre: '' } },
  { label: 'missing filePath', dto: { ...VALID_CREATE_DTO, filePath: undefined as any } },
  { label: 'missing fileName', dto: { ...VALID_CREATE_DTO, fileName: undefined as any } },
  { label: 'missing mimeType', dto: { ...VALID_CREATE_DTO, mimeType: undefined as any } },
  { label: 'null duration', dto: { ...VALID_CREATE_DTO, duration: null as any } },
  { label: 'negative duration', dto: { ...VALID_CREATE_DTO, duration: -1 } },
];

export const VALID_SEARCH_DTO: SearchVideoDto = {
  title: 'Test',
  language: 'English',
  genre: 'Action',
  minDuration: 60,
  maxDuration: 300,
  uploadedFrom: '2024-01-01',
  uploadedTo: '2024-12-31',
  page: 1,
  limit: 10,
};

export const MOCK_SEARCH_RESULT = {
  data: MOCK_VIDEO_LIST,
  total: 2,
  page: 1,
  limit: 10,
};
