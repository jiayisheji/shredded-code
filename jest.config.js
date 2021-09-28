module.exports = {
  displayName: 'Shredded Code',
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['jest-extended'],
  // npm run add -- --coverage
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!**/node_modules/**', '!src/**/*.d.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleDirectories: ['node_modules', '/src'],
  moduleNameMapper: {
    '^@code/(.*)': '<rootDir>/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
};
