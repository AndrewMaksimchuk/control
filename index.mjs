#!/usr/bin/env node

import { Octokit } from "@octokit/core";

export const repositories = [
  // "radiomag",
  // "kids_tablet",
  // "learn_words",
  "readbook",
  // "note",
  "spending",
  // "dotfiles",
  // "driver_bot",
  // "hooks",
  // "nodejsma",
  // "pomodoro",
  // "vodiy",
  // "web_builder",
  // "web-shell",
]

const TOKEN = process.env.GITHUB_USER_TOKEN
if (TOKEN === undefined) {
  process.stdout.write(
    "Github user token is undefined!\n\
      Please set to GITHUB_USER_TOKEN variable.\n"
  )
  process.exit(1)
}

const owner = "AndrewMaksimchuk"
const octokit = new Octokit({ auth: TOKEN })
const columns = process.stdout.columns

const getIssues = async (repo) => {
  return await octokit.request(
    'GET /repos/{owner}/{repo}/issues',
    {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      },
    }
  );
}

const print = async (repo) => {
  const { data } = await getIssues(repo)
  const issues = data
    .map(({ html_url, title }) => ({ html_url, title }))

  if (issues.length === 0) {
    return;
  }

  console.log(`\x1B[1mRepository: \x1B[0m${repo}`)
  console.log(`Issues status -> open`)
  const headerTitle = `TITLE`.padEnd(50)
  const headerUrl = `URL`
  const delimiter = " ".repeat(2)

  console.log(
    '\x1B[1m' +
    headerTitle + 
    delimiter +
    headerUrl + 
    '\x1B[0m'
  )

  issues.forEach((issue) => {
    const title = issue
      .title
      .padEnd(50)
    console.log(
      `${title}${delimiter}${issue.html_url}`
    )
  })
  console.log("=".repeat(columns))
}

const printHeader = () => {
  const text = "Projects overview".toUpperCase()
  const start = Math.floor(columns / 2)
  const header = text.padStart(start, " ")
  console.log(header)
}

process.stdout.write("\x1Bc")
printHeader()
repositories.map((repo) => print(repo))
