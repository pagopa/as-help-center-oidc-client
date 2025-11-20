/* eslint-disable no-useless-escape */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\.tsx?$': ['ts-jest', {}],
    '^.+\\.m?js$': ['ts-jest', {}],
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  transformIgnorePatterns: ['node_modules/(?!uuid)', '<rootDir>/jest.setup.js', '<rootDir>/jest.config.js'],
  // coverage
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/src/utils/openapi.ts'],
  collectCoverageFrom: [
    'src/middlewares/**/*.ts',
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
