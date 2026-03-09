import type { CreateGenreDto } from '../../dto/create-genre.dto';
import type { UpdateGenreDto } from '../../dto/update-genre.dto';

export const VALID_GENRE_ID = '64a1f2e3b4c5d6e7f8a9c0d1';
export const ANOTHER_GENRE_ID = '64a1f2e3b4c5d6e7f8a9c0d2';
export const INVALID_GENRE_ID = 'bad-id';

export const VALID_CREATE_DTO: CreateGenreDto = {
  name: 'Action',
  videoIds: [],
};

export const MOCK_GENRE_DOCUMENT = {
  _id: VALID_GENRE_ID,
  name: 'Action',
  videoIds: [],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const MOCK_GENRE_LIST = [
  MOCK_GENRE_DOCUMENT,
  { ...MOCK_GENRE_DOCUMENT, _id: ANOTHER_GENRE_ID, name: 'Drama' },
];

export const VALID_UPDATE_DTO: UpdateGenreDto = {
  name: 'Updated Action',
};

export const MISSING_NAME_CASES: Array<{ label: string; dto: Partial<CreateGenreDto> }> = [
  { label: 'missing name', dto: { ...VALID_CREATE_DTO, name: undefined as any } },
  { label: 'empty name', dto: { ...VALID_CREATE_DTO, name: '' } },
  { label: 'whitespace name', dto: { ...VALID_CREATE_DTO, name: '   ' } },
];
