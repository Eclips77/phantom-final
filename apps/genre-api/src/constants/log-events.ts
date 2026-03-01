export const GenreApiContext = {
  SERVICE: 'GenreApiService',
  CONTROLLER: 'GenreApiController',
} as const;

export const GenreApiEvent = {
  CREATING: 'genre.creating',
  CREATED: 'genre.created',
  DUPLICATE_NAME: 'genre.duplicate_name',
  FETCH_ALL: 'genre.fetch_all',
  FETCH_ONE: 'genre.fetch_one',
  NOT_FOUND: 'genre.not_found',
  UPDATING: 'genre.updating',
  UPDATED: 'genre.updated',
  DELETING: 'genre.deleting',
  DELETED: 'genre.deleted',
  MONGO_ERROR: 'genre.mongo_error',
} as const;
