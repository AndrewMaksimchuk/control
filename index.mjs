#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { appendFileSync, unlinkSync, existsSync, readFileSync } from "node:fs";
import { octokit, validateToken, ratelimit } from "./gh-api.mjs";
import { repositories, hiddenRepositories } from "./repositories.mjs";
import { owner, dashboard } from "./variables.mjs";
import {
  addItemAutocompleteZsh,
  generateAutocompleteZsh,
} from "./generate_autocomplete_zsh.mjs";

const pwd = dirname(fileURLToPath(import.meta.url))
export const filePath = join(pwd, dashboard);

export const getIssues = async (repo) => {
  // Docs: https://docs.github.com/en/rest/issues/issues?apiVersion=2026-03-10#list-repository-issues
  // List issues in a repository. Only open issues will be listed.
  return await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

export const toFile = (data) => {
  try {
    appendFileSync(filePath, data + "\n", {encoding: "utf-8"});
  } catch (error) {
    console.error("Faile to append to file: ", error);
  }
};

export const getCurrentJob = () => {
  const filePathCurrentJob = join(pwd, "current_job.txt");
  if (existsSync(filePathCurrentJob)) {
    const fileContent = String(readFileSync(filePathCurrentJob));
    return fileContent
      .split("\n")
      .reverse()
      .find((str) => str.startsWith("http"));
  }
};

export const markCurrentJob = (url, currentJobUrl) => {
  return url === currentJobUrl ? "[ CURRENT JOB ] " : "";
};

export const getIssuesOfRepository = async (repo) => {
  try {
    const { data } = await getIssues(repo);
    const issues = data.map(({ html_url, title, number }) => ({
      html_url,
      title,
      number,
    }));
    return { repo, issues };
  } catch {
    return { repo, issues: [] };
  }
}

export const print = async ({repo, issues}) => {
  const textRepo = `Repository: `;
  const linkRepo = `https://github.com/${owner}/${repo}`;
  const textIssues = `Opened issues [${issues.length}]`;
  console.log(`\x1B[1m${textRepo}\x1B[0m${repo}`);
  console.log(linkRepo);
  console.log(textIssues);
  toFile(textRepo + repo);
  toFile(linkRepo);
  toFile(textIssues);
  const headerTitle = `TITLE`.padEnd(50);
  const headerUrl = `URL`;
  const delimiter = " ".repeat(2);
  const text = headerTitle + delimiter + headerUrl;

  console.log("\x1B[1m" + text + "\x1B[0m");

  toFile(text);
  const currentJobUrl = getCurrentJob();
  addItemAutocompleteZsh(repo, issues);

  issues.forEach((issue) => {
    const title =
      issue.title.length > 50
        ? issue.title.slice(0, 47).concat("...")
        : issue.title.padEnd(50).slice(0, 50);
    const text = `${markCurrentJob(
      issue.html_url,
      currentJobUrl
    )}${title}${delimiter}${issue.html_url}`;
    console.log(text);
    toFile(text);
  });
  const delimiterRepo = "=".repeat(process.stdout.columns);
  console.log(delimiterRepo);
  toFile(delimiterRepo);
};

export const printHeader = () => {
  const start = Math.floor(process.stdout.columns / 2);
  const header = "PROJECTS OVERVIEW".padStart(start, " ");
  console.log(header);
  toFile(header);
};

export const printHiddenRepository = () => {
  if (0 === hiddenRepositories.length) return;
  console.log(
    `\x1B[1mHidden repositories(not showing): \x1B[0m${hiddenRepositories.join(
      ", "
    )}\n`
  );
};

export const printDashboard = async () => {
  const process = repositories
    .filter((repo) => !hiddenRepositories.includes(repo))
    .map(getIssuesOfRepository)
  const data = await Promise.all(process);
  data.filter(item => Boolean(item.issues.length))
    .sort((a, b) => b.issues.length - a.issues.length)
    .map(print);
};

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  await validateToken();
  await ratelimit();

  process.stdout.write("\x1Bc");

  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  printHeader();
  await printDashboard();
  generateAutocompleteZsh(pwd);
  printHiddenRepository();
}
