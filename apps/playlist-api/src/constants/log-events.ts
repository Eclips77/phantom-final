export const PlaylistApiContext = {
  SERVICE: 'PlaylistApiService',
  CONTROLLER: 'PlaylistApiController',
} as const;

export const PlaylistApiEvent = {
  CREATING: 'playlist.creating',
  CREATED: 'playlist.created',
  VIDEOS_NOT_FOUND: 'playlist.videos_not_found',
  FETCH_ALL: 'playlist.fetch_all',
  FETCH_ONE: 'playlist.fetch_one',
  NOT_FOUND: 'playlist.not_found',
  UPDATING: 'playlist.updating',
  UPDATED: 'playlist.updated',
  DELETING: 'playlist.deleting',
  DELETED: 'playlist.deleted',
  MONGO_ERROR: 'playlist.mongo_error',
} as const;
