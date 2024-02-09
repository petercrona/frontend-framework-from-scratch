import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "jsdom",
  maxWorkers: 1,
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
};

export default jestConfig;
