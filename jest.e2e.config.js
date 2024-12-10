module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts)$": "ts-jest"
  },
  setupFilesAfterEnv: ["jest-extended/all"],
  globals: {
    "__DEV__": true,
    "ts-jest": {
      tsconfig: "./tsconfig.json",
      diagnostics: false
    }
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/test/scripts/**/*.test.(ts|tsx)"],
};
