export const MongoServiceContext = {
  VIDEO_SERVICE: 'VideoService',
  VIDEO_CONTROLLER: 'VideoController',
  GENRE_SERVICE: 'GenreService',
  GENRE_CONTROLLER: 'GenreController',
  PLAYLIST_SERVICE: 'PlaylistService',
  PLAYLIST_CONTROLLER: 'PlaylistController',
} as const;

export const VideoEvent = {
  CREATING: 'video.creating',
  CREATED: 'video.created',
  FETCH_ALL: 'video.fetch_all',
  FETCH_ONE: 'video.fetch_one',
  NOT_FOUND: 'video.not_found',
  UPDATING: 'video.updating',
  UPDATED: 'video.updated',
  DELETING: 'video.deleting',
  DELETED: 'video.deleted',
  SEARCHING: 'video.searching',
  SEARCH_RESULT: 'video.search_result',
  DB_ERROR: 'video.db_error',
} as const;

export const GenreEvent = {
  CREATING: 'genre.creating',
  CREATED: 'genre.created',
  FETCH_ALL: 'genre.fetch_all',
  FETCH_ONE: 'genre.fetch_one',
  NOT_FOUND: 'genre.not_found',
  UPDATING: 'genre.updating',
  UPDATED: 'genre.updated',
  DELETING: 'genre.deleting',
  DELETED: 'genre.deleted',
  VALIDATE: 'genre.validate',
  NOT_VALID: 'genre.not_valid',
  DB_ERROR: 'genre.db_error',
} as const;

export const PlaylistEvent = {
  CREATING: 'playlist.creating',
  CREATED: 'playlist.created',
  FETCH_ALL: 'playlist.fetch_all',
  FETCH_ONE: 'playlist.fetch_one',
  NOT_FOUND: 'playlist.not_found',
  UPDATING: 'playlist.updating',
  UPDATED: 'playlist.updated',
  DELETING: 'playlist.deleting',
  DELETED: 'playlist.deleted',
  DB_ERROR: 'playlist.db_error',
} as const;
