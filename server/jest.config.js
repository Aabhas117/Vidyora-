module.exports = {
  testEnvironment: "node",
  testTimeout: 120000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
