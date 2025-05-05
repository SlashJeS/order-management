/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
  testTimeout: 10000, // 10 seconds
  verbose: true,
  detectOpenHandles: true
}; 