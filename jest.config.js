module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.tsx?$': ['ts-jest', {
        tsconfig: 'tsconfig.json', // Use the project’s tsconfig
        useESM: true, // Enable ECMAScript Modules
      }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['<rootDir>/tests/**/*.test.ts?(x)'],
    // Ensure node_modules are ignored unless explicitly transformed
    transformIgnorePatterns: ['/node_modules/'],
  };