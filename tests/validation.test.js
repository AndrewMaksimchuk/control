import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"

vi.mock("../repositories.mjs", () => {
  return {
    repositories: ["spending", "control"],
  };
});

import {
  isIssNotNumber,
  isRepoNotValid,
} from "../validation.mjs"

let mockProcessExit = undefined

beforeEach(() => {
  mockProcessExit = vi
    .spyOn(process, "exit")
    .mockImplementation(() => undefined)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("isIssNotNumber()", () => {
  it("should be fine", () => {
    isIssNotNumber("23")
    expect(mockProcessExit)
    .not.toHaveBeenCalled()
  })

  it("should terminate process", () => {
    isIssNotNumber("abc")
    expect(mockProcessExit)
    .toHaveBeenCalled()
  })
})

describe("isRepoNotValid()", () => {
  it("should be fine", () => {
    isRepoNotValid("spending")
    expect(mockProcessExit)
    .not.toHaveBeenCalled()
  })

  it("should be terminate process", () => {
    isRepoNotValid("ts-to-html")
    expect(mockProcessExit)
    .toHaveBeenCalled()
  })
})
