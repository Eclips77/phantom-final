export const mockMongoServiceConfig = {
  port: 3006,
  logLevel: 'info',
  mongoDbUri: 'mongodb://mock-mongo:27017/test',
};

export const createMockModel = (): any => ({
  new: jest.fn(),
  save: jest.fn(),
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findByIdAndUpdate: jest.fn().mockReturnThis(),
  findByIdAndDelete: jest.fn().mockReturnThis(),
  exec: jest.fn(),
});
