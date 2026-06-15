import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeAll,
  beforeEach,
} from "vitest";

vi.mock("node:path", () => {
  return {
    dirname: vi.fn().mockImplementation(() => "control"),
    join: vi.fn().mockImplementation((first, second) => second),
  };
});

const mockAppendFile = vi.fn().mockImplementation(() => true);
const mockUnlinkSync = vi.fn().mockImplementation(() => true);
const mockExistsSync = vi.fn().mockImplementation(() => true);

vi.mock("node:fs", () => {
  return {
    appendFile: mockAppendFile,
    unlinkSync: mockUnlinkSync,
    existsSync: mockExistsSync,
  };
});

const response = {
  status: 200,
  data: {
    title: "Test",
    body: "",
  },
};

const mockRequest = vi.fn().mockResolvedValue(response);

vi.mock("../gh-api.mjs", () => {
  return {
    octokit: {
      request: mockRequest,
    },
  };
});

vi.mock("../variables.mjs", () => {
  return {
    owner: "Andrew",
  };
});

vi.mock("../validation.mjs", () => {
  return {
    isRepoNotValid: vi.fn().mockImplementation(() => true),
    isIssNotNumber: vi.fn().mockImplementation(() => true),
  };
});

beforeEach(() => {
  vi.resetModules();

  process.argv = ["node", "done-work.mjs", "control", "23"];
});

afterEach(() => {
  vi.restoreAllMocks();
});

const inWork = `
You work on repository "control"
https://github.com/Andrew/control

Your issue:
Test

https://github.com/Andrew/control/issues/23
`.trim();

describe("to-work.mjs", () => {
  it("should delete old file if exist", async () => {
    await import("../to-work.mjs");

    expect(mockUnlinkSync).toHaveBeenCalled();
  });

  it("should create new file with information about work", async () => {
    mockExistsSync.mockImplementation(() => false);
    await import("../to-work.mjs");

    expect(mockAppendFile).toHaveBeenCalledWith(
      expect.stringContaining("current_job.txt"),
      expect.stringContaining(inWork),
      "utf-8",
      expect.any(Function),
    );
  });
});
