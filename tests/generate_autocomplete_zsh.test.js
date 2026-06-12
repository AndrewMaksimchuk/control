import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("node:fs", () => {
  return {
    writeFile: vi.fn(),
  };
})

vi.mock("node:path", () => {
  return {
    join: vi.fn().mockImplementation(() => "./project_working_directory"),
  };
})

vi.mock("../repositories.mjs", () => {
  return {
    repositories: ["spending", "control"],
  };
});

import {
  generateArray,
  generateAutocompleteBashArray,
  generateAutocompleteIssuesOfRepositories,
  generateAutocompleteZsh,
  generateCaseInExpression,
  generateCaseInExpressionItem,
  generateFunction,
  generatePairCompletionDescription,
  sumRepositoriesWithAndWithoutIssues
} from "../generate_autocomplete_zsh.mjs"

afterEach(() => {
  vi.clearAllMocks()
})

describe("generatePairCompletionDescription()", () => {
  it("should return string", () => {
    expect(generatePairCompletionDescription("do-work", "description of command"))
    .toBe("'do-work:description of command'")
  })
})

describe("generateArray()", () => {
  it("should return bash array", () => {
    expect(generateArray("repository", ["note", "spending", "control"]))
    .toBe("repository=(note spending control)")
  })
})

describe("generateCaseInExpressionItem()", () => {
  it("should return bash case expression item", () => {
    expect(generateCaseInExpressionItem("control", "issues_of_repositories=('24:Add unit tests')"))
    .toBe("('control') issues_of_repositories=('24:Add unit tests') ;;")
  })
})

describe("generateCaseInExpression()", () => {
  it("should return bash case statement", () => {
    expect(generateCaseInExpression("$1", []))
    .toBe("case \"$1\" in \n \nesac")
  })
})

describe("generateFunction()", () => {
  it("should return bash function", () => {
    expect(generateFunction("get_issues_of_repository", "case 1 in item esac"))
    .toBe("function get_issues_of_repository()\n{\ncase 1 in item esac\n}\n")
  })
})

describe("generateAutocompleteIssuesOfRepositories()", () => {
  it("should return part of zsh autocompletion file with issues of repositories", () => {
    expect(generateAutocompleteIssuesOfRepositories())
    .toContain("\nissues_of_repositories=()\nfunction get_issues_of_repository()\n")
  })
})

describe("sumRepositoriesWithAndWithoutIssues()", () => {
  it("should return array of all repositories with issues", () => {
    expect(sumRepositoriesWithAndWithoutIssues())
    .toEqual(["'spending:0'", "'control:0'"])
  })
})

describe("generateAutocompleteBashArray()", () => {
  it("should return bash array of repositories", () => {
    expect(generateAutocompleteBashArray())
    .toBe("repositories_names=('spending:0' 'control:0')")
  })
})

describe("generateAutocompleteZsh()", () => {
  it("should write to a file all code as zsh autocompletion", async () => {
    const { writeFile } = await import("node:fs")
    const content = "repositories_names=('spending:0' 'control:0')\nissues_of_repositories=()\nfunction get_issues_of_repository()"
    generateAutocompleteZsh(".")
    expect(writeFile)
    .toHaveBeenCalledWith("./project_working_directory", expect.stringContaining(content), { flag: "w"}, expect.any(Function))
  })
})
