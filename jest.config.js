module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/lambda/**/*.js', // Exclude lambda handlers from coverage (integration tests)
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/src/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000
};
