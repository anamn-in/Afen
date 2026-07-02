/** @type {import('jest').Config} */
module.exports = {
  rootDir: '../',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/configs/tsconfig.json',
      diagnostics: false,
    }],
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/configs/node_modules',
  ],
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/ui/',
    '/packages/',
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@storage/(.*)$': '<rootDir>/src/storage/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@utils/(.*)$': '<rootDir>/src/core/utils/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/testSetup.ts'],
  verbose: true,
  testTimeout: 30000,
};