#!/usr/bin/env node

// https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#update-an-issue

import { octokit } from "./gh-api.mjs";
import { owner } from "./variales.mjs";
import { isRepoNotValid, isIssNotNumber } from "./validation.mjs";

const [, , repo, issue_number] = process.argv

isRepoNotValid(repo)
isIssNotNumber(issue_number)

const updateIssue = async () => {
  const { status, data } = await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner,
    repo,
    issue_number,
    state: 'closed',
    state_reason: 'completed',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (200 !== status || 'closed' !== data.state) {
    process.exit(1)
  }
}

await updateIssue()
