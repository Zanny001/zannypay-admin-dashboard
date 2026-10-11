const nextJest = require('next/jest');

// next/jest reads next.config.js and .babelrc automatically and wires up
// SWC-based transforms, so this config doesn't need its own ts-jest/babel
// setup — the same compiler Next.js itself uses for the app runs the tests.
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);
