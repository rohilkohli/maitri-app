const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'components/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 20,
      statements: 20,
    },
    './lib/mastery-calculator.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './lib/spaced-repetition.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './lib/decision-engine.ts': {
      branches: 70,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './lib/validation.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
