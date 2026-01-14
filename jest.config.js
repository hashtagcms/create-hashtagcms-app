module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/',
    '/resources/',
    '/public/'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['dotenv/config'], // Load .env variables
  testTimeout: 10000 // 10 seconds per test
};
