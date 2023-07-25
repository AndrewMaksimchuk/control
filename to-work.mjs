#!/usr/bin/env node


import { dirname, join } from "path";
import { appendFile, unlinkSync, existsSync } from "fs";
import { octokit } from "./gh-api.mjs"
import { repositories } from "./repositories.mjs"
import { owner } from "./variales.mjs";


const [, , repo, issue_number] = process.argv


const isRepoNotValid =
  !repositories.includes(repo)
if (isRepoNotValid) {
  console.log(
    "This repository name not exist, try again",
  )
  process.exit()
}


const isIssNotNumber = Number.isNaN(parseInt(issue_number))
if (isIssNotNumber) {
  console.log(
    "Issue should be a number, try again",
  )
  process.exit()
}


const issueData = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
  owner,
  repo,
  issue_number,
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  }
})


const { title, body } = issueData.data
const repoLink = `https://github.com/${owner}/${repo}`
const issueLink =
`https://github.com/${owner}/${repo}/issues/${issue_number}`


const inWork = `
You work on repository "${repo}"
${repoLink}

Your issue:
${title}
${body ? body : ''}
${issueLink}
`.trim()


const currentJob = "current_job.txt"
const pwd = dirname(import.meta.url).slice(7)
const filePath = join(pwd, currentJob)

if (existsSync(filePath)) {
  unlinkSync(filePath)
}

appendFile(filePath, inWork + "\n", "utf-8", () => { })
