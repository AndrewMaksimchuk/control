import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";

const response = {
  headers: {
    "x-ratelimit-remaining": 1000,
    "x-ratelimit-reset": Date.now(),
  },
};

const mockRequest = vi.fn().mockResolvedValue(response);

vi.mock("@octokit/core", () => {
  return {
    Octokit: class mockOctokit {
      constructor() {}
      request = mockRequest
    },
  };
});

let mockProcessExit = undefined;

beforeEach(() => {
  vi.resetModules();

  vi.stubEnv("GITHUB_USER_TOKEN", "some_github_token");

  vi.spyOn(console, "log").mockImplementation(() => true);
  vi.spyOn(console, "error").mockImplementation(() => true);
  vi.spyOn(process.stdout, "write")
    .mockImplementation(() => true)

  mockProcessExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("check token()", () => {
  it("should terminate process if token undefine", async () => {
    vi.stubEnv("GITHUB_USER_TOKEN", undefined);
    await import("../gh-api.mjs");
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should be fine and execute to the end", async () => {
    await import("../gh-api.mjs");
    expect(mockProcessExit).not.toHaveBeenCalled();
  });
});

describe("validateToken()", () => {
  it("should be executed without terminate process", async () => {
    const { validateToken } = await import("../gh-api.mjs")
    await validateToken()
    expect(mockProcessExit)
      .not.toHaveBeenCalled()
  })

  it("should terminate process", async () => {
    mockRequest.mockRejectedValue(undefined)
    const { validateToken } = await import("../gh-api.mjs")
    await validateToken()
    expect(mockProcessExit)
      .toHaveBeenCalled()
  })
})

describe("ratelimit()", async () => {
  it("should not terminate the script", async () => {
    mockRequest.mockResolvedValue(response);
    const { ratelimit } = await import("../gh-api.mjs");
    await ratelimit();
    expect(mockProcessExit)
      .not.toHaveBeenCalled();
  })

  it("should terminate the process when remaining is low", async () => {
    response.headers["x-ratelimit-remaining"] = 50;
    mockRequest.mockResolvedValue(response);
    const { ratelimit } = await import("../gh-api.mjs");
    await ratelimit();
    expect(mockProcessExit)
      .toHaveBeenCalledWith(0);
  })

  it("should terminate the process when github request rejected of error occure", async () => {
    mockRequest.mockRejectedValue(undefined);
    const { ratelimit } = await import("../gh-api.mjs");
    await ratelimit();
    expect(mockProcessExit)
      .toHaveBeenCalledWith(1);
  })
})
