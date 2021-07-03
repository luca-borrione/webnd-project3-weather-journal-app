module.exports = {
  automock: false,
  coveragePathIgnorePatterns: [
    '<rootDir>/public/js/utils/index.js'
  ],
  modulePathIgnorePatterns: ['<rootDir>/.history/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  snapshotResolver: '<rootDir>/snapshotResolver.js',
};
