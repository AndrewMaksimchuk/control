import { repositories } from "./repositories.mjs"

export const isRepoNotValid = (repo = "") => {
  const isNotValid = !repositories.includes(repo)
  if (isNotValid) {
    console.log(
      "This repository name not exist, try again",
    )
    process.exit()
  }
}

export const isIssNotNumber = (issue_number = "") => {
  const isNotNumber = Number.isNaN(parseInt(issue_number))
  if (isNotNumber) {
    console.log(
      "Issue should be a number, try again",
    )
    process.exit()
  }
}
