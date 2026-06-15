import { describe, it, expect, vi, afterEach, beforeAll, beforeEach } from "vitest";

const response = {
  status: 200,
  data: {
    state: "closed",
  },
}

const mockRequest = vi.fn().mockResolvedValue(response);

vi.mock("../gh-api.mjs", () => {
  return {
    octokit: {
      request: mockRequest,
    },
  };
})

vi.mock("../variables.mjs", () => {
  return {
    owner: "Andrew",
  };
})

vi.mock("../validation.mjs", () => {
  return {
    isRepoNotValid: vi.fn().mockImplementation(() => true),
    isIssNotNumber: vi.fn().mockImplementation(() => true),
  };
})

let mockProcessExit = undefined;

beforeEach(() => {
  vi.resetModules();

  process.argv = ["node", "done-work.mjs", "control", "23"];

  mockProcessExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined);
  
  vi
    .spyOn(console, "error")
    .mockImplementation(() => true);

  vi
    .spyOn(console, "warn")
    .mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updataIssue()", () => {
  it("should terminate the script when issue not close, state not closed", async () => {
    response.data.state = "open"
    mockRequest.mockResolvedValue(response)
    await import("../done-work.mjs")
    expect(mockProcessExit)
      .toHaveBeenCalledWith(1)
  })

  it("should executed fine", async () => {
    response.data.state = "closed"
    mockRequest.mockResolvedValue(response)
    await import("../done-work.mjs")
    expect(mockProcessExit)
      .not.toHaveBeenCalled()
  })

  it("should terminate the process when request rejected", async () => {
    mockRequest.mockRejectedValue(undefined)
    await import("../done-work.mjs")
    expect(mockProcessExit)
      .toHaveBeenCalledWith(2)
  })
})
