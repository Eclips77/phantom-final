import type { CreatePlaylistDto } from '../../dto/create-playlist.dto';
import type { UpdatePlaylistDto } from '../../dto/update-playlist.dto';

export const VALID_PLAYLIST_ID = '64a1f2e3b4c5d6e7f8a9d0e1';
export const ANOTHER_PLAYLIST_ID = '64a1f2e3b4c5d6e7f8a9d0e2';
export const INVALID_PLAYLIST_ID = 'bad-id';

export const VALID_VIDEO_ID_1 = '64a1f2e3b4c5d6e7f8a9b0c1';
export const VALID_VIDEO_ID_2 = '64a1f2e3b4c5d6e7f8a9b0c2';

export const VALID_CREATE_DTO: CreatePlaylistDto = {
  name: 'My Playlist',
  videoIds: [VALID_VIDEO_ID_1, VALID_VIDEO_ID_2],
};

export const MOCK_PLAYLIST_DOCUMENT = {
  _id: VALID_PLAYLIST_ID,
  name: 'My Playlist',
  videoIds: [VALID_VIDEO_ID_1, VALID_VIDEO_ID_2],
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

export const MOCK_PLAYLIST_LIST = [
  MOCK_PLAYLIST_DOCUMENT,
  { ...MOCK_PLAYLIST_DOCUMENT, _id: ANOTHER_PLAYLIST_ID, name: 'Second Playlist' },
];

export const VALID_UPDATE_DTO: UpdatePlaylistDto = {
  name: 'Updated Playlist',
};

export const MISSING_NAME_CASES: Array<{ label: string; dto: Partial<CreatePlaylistDto> }> = [
  { label: 'missing name', dto: { ...VALID_CREATE_DTO, name: undefined as any } },
  { label: 'empty name', dto: { ...VALID_CREATE_DTO, name: '' } },
  { label: 'whitespace name', dto: { ...VALID_CREATE_DTO, name: '   ' } },
];
