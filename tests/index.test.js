import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  beforeAll,
  beforeEach,
  afterAll,
} from "vitest";

const {
  mockAppendFileSync,
  mockUnlinkSync,
  mockExistsSync,
  mockReadFileSync,
  mockOctokitRequest,
  mockValidateToken,
  mockRateLimit,
  mockAddItemAutocompleteZsh,
  mockGenerateAutocompleteZsh,
} = vi.hoisted(() => {
  return {
    mockAppendFileSync: vi.fn().mockImplementation(() => true),
    mockUnlinkSync: vi.fn().mockImplementation(() => true),
    mockExistsSync: vi.fn().mockImplementation(() => true),
    mockReadFileSync: vi.fn().mockImplementation(() => true),
    mockOctokitRequest: vi.fn().mockImplementation(() => {
      return {
        data: [
          { html_url: "github/issues/1", title: "test", number: 1 },
          { html_url: "github/issues/3", title: "test", number: 3 },
        ],
      };
    }),
    mockValidateToken: vi.fn().mockImplementation(() => true),
    mockRateLimit: vi.fn().mockImplementation(() => true),
    mockAddItemAutocompleteZsh: vi.fn().mockImplementation(() => true),
    mockGenerateAutocompleteZsh: vi.fn().mockImplementation(() => true),
  };
});

vi.mock("node:url", () => {
  return {
    fileURLToPath: vi.fn().mockImplementation(() => true),
  };
});

vi.mock("node:path", () => {
  return {
    dirname: vi.fn().mockImplementation(() => "control/"),
    join: vi.fn().mockImplementation((first, second) => first + second),
  };
});

vi.mock("node:fs", () => {
  return {
    appendFileSync: mockAppendFileSync,
    unlinkSync: mockUnlinkSync,
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
  };
});

vi.mock("../gh-api.mjs", () => {
  return {
    octokit: {
      request: mockOctokitRequest,
    },
    validateToken: mockValidateToken,
    ratelimit: mockRateLimit,
  };
});

vi.mock("../repositories.mjs", () => {
  return {
    repositories: [],
    hiddenRepositories: [],
  };
});

vi.mock("../variables.mjs", () => {
  return {
    owner: "Andrew",
    dashboard: "dashboard-test.txt",
  };
});

vi.mock("../generate_autocomplete_zsh.mjs", () => {
  return {
    addItemAutocompleteZsh: mockAddItemAutocompleteZsh,
    generateAutocompleteZsh: mockGenerateAutocompleteZsh,
  };
});

let mockStdoutWrite = vi.fn().mockImplementation(() => true);
let mockConsoleLog = vi.fn().mockImplementation(() => true);
let mockConsoleError = vi.fn().mockImplementation(() => true);

beforeAll(() => {
  vi.spyOn(process.stdout, "write");
  process.stdout.columns = 100;
  mockStdoutWrite = vi
    .spyOn(process.stdout, "write")
    .mockImplementation(() => true);
  vi.spyOn(console, "log");
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => true);
  mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => true);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

/****************************************************************************
Variables:
const column = 100
const pwd = "control/"
const filePath = "control/dashboard-test.txt"
*****************************************************************************/

import {
  getIssues,
  toFile,
  getCurrentJob,
  markCurrentJob,
  getIssuesOfRepository,
  print,
  printHeader,
} from "../index.mjs";

describe("Module import.mjs", () => {
  it("should not execute the main code after import", () => {
    expect(mockValidateToken).not.toHaveBeenCalled();
  });

  it("getIssues()", async () => {
    const response = await getIssues("control");

    expect(mockOctokitRequest).toHaveBeenCalledWith(
      "GET /repos/{owner}/{repo}/issues",
      {
        owner: "Andrew",
        repo: "control",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    expect(response).toBeTruthy();
  });

  describe("toFile()", () => {
    it("should write to file", () => {
      toFile([]);

      expect(mockAppendFileSync).toHaveBeenCalled();
    });

    it("should print the error message when error occure", () => {
      mockAppendFileSync.mockImplementation(() => {
        throw Error("This only test");
      });
      toFile([]);
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Faile to append to file: ",
        expect.objectContaining({ message: "This only test" }),
      );
    });
  });

  describe("getCurrentJob()", () => {
    it("should get data of current job", () => {
      mockExistsSync.mockImplementation(() => true);
      mockReadFileSync.mockImplementation(
        () =>
          "You work on repository 'control'\nhttps://github.com/AndrewMaksimchuk/control",
      );
      const result = getCurrentJob();
      expect(result).toBe("https://github.com/AndrewMaksimchuk/control");
    });

    it("should not find file with current job data", () => {
      mockExistsSync.mockImplementation(() => false);
      const result = getCurrentJob();
      expect(result).toBeUndefined();
    });
  });

  describe("markCurrentJob()", () => {
    it("should mark", () => {
      expect(
        markCurrentJob(
          "https://github.com/AndrewMaksimchuk/control",
          "https://github.com/AndrewMaksimchuk/control",
        ),
      ).toBe("[ CURRENT JOB ] ");
    });

    it("should not mark", () => {
      expect(
        markCurrentJob("https://github.com/AndrewMaksimchuk/control", ""),
      ).toBe("");
    });
  });

  describe("getIssuesOfRepository()", () => {
    it("should return repository name and all issues", async () => {
      const repositoryIssueResponse = {
        html_url: "https://github.com/AndrewMaksimchuk/control/issues/24",
        title: "Add Unit and Integration Tests to Project",
        number: 24,
        state: "completed",
      };
      const repositoryIssueExpect = {
        html_url: "https://github.com/AndrewMaksimchuk/control/issues/24",
        title: "Add Unit and Integration Tests to Project",
        number: 24,
      };
      mockOctokitRequest.mockResolvedValue({ data: [repositoryIssueResponse] });
      const result = await getIssuesOfRepository("control");
      expect(result).toMatchObject({
        repo: "control",
        issues: [repositoryIssueExpect],
      });
    });

    it("should return repository name and all issues must be empty array if fail to get data of repository", async () => {
      mockOctokitRequest.mockRejectedValue(undefined);
      const result = await getIssuesOfRepository("control");
      expect(result).toMatchObject({ repo: "control", issues: [] });
    });
  });

  describe("print()", () => {
    it("should add items to zsh autocompletion", async () => {
      await print({ repo: "control", issues: [] });
      expect(mockAddItemAutocompleteZsh).toHaveBeenCalledWith("control", []);
    });
  });

  describe("printHeader()", () => {
    it("should print header text", () => {
      printHeader();
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        expect.anything(),
        "PROJECTS OVERVIEW".padStart(50, " ") + "\n",
        expect.anything(),
      );
    });
  });

  describe("printHiddenRepository()", () => {
    it("should do nothing when hidden repository not available", async () => {
      const { printHiddenRepository } = await import("../index.mjs");

      printHiddenRepository();
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it("should print names of hidden repositories", async () => {
      vi.doMock("../repositories.mjs", () => {
        return {
          hiddenRepositories: ["note", "spending"],
        };
      });

      const { printHiddenRepository } = await import("../index.mjs");

      printHiddenRepository();
      expect(mockConsoleLog).toHaveBeenCalledWith("\x1B[1mHidden repositories(not showing): \x1B[0mnote, spending\n");
    });
  });

  describe("printDashboard()", () => {
    it("should print all data about repositories and thay issues", async () => {
      vi.doMock("../repositories.mjs", () => {
        return {
          repositories: ["note", "spending", "control"],
          hiddenRepositories: ["note" ],
        };
      });
      const repositoryIssueResponse = {
        html_url: "https://github.com/AndrewMaksimchuk/control/issues/24",
        title: "Add Unit and Integration Tests to Project",
        number: 24,
        state: "completed",
      };
      mockOctokitRequest.mockResolvedValue({ data: [repositoryIssueResponse] });

      const { printDashboard } = await import("../index.mjs");

      const exitcode = await printDashboard();
      expect(mockAddItemAutocompleteZsh).toHaveBeenCalledTimes(2);
    });

  });
});
