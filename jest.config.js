module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  moduleNameMapper: {
    'src/utils': '<rootDir>/src/utils',
    'src/generated': '<rootDir>/src/generated',
  },
}
