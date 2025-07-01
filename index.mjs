#!/usr/bin/env node

import { dirname, join } from "path";
import { appendFile, unlinkSync, existsSync, readFileSync } from "fs";
import { octokit } from "./gh-api.mjs";
import { repositories, hiddenRepositories } from "./repositories.mjs";
import { owner, dashboard } from "./variales.mjs";
import {
  addItemAutocompleteZsh,
  generateAutocompleteZsh,
} from "./generate_autocomplete_zsh.mjs";

const columns = process.stdout.columns;
const pwd = dirname(import.meta.url).slice(7);
const filePath = join(pwd, dashboard);

const getIssues = async (repo) => {
  return await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
};

const toFile = (data) => {
  appendFile(filePath, data + "\n", "utf-8", () => {});
};

const getCurrentJob = () => {
  const filePathCurrentJob = join(pwd, "current_job.txt");
  if (existsSync(filePathCurrentJob)) {
    const fileContent = String(readFileSync(filePathCurrentJob));
    return fileContent
      .split("\n")
      .reverse()
      .find((str) => str.startsWith("http"));
  }
};

const markCurrentJob = (url, currentJobUrl) => {
  return url === currentJobUrl ? "[ CURRENT JOB ] " : "";
};

const print = async (repo) => {
  const { data } = await getIssues(repo);
  const issues = data.map(({ html_url, title, number }) => ({
    html_url,
    title,
    number,
  }));

  if (issues.length === 0) {
    return;
  }

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
    const title = issue.title.padEnd(50);
    const text = `${markCurrentJob(
      issue.html_url,
      currentJobUrl
    )}${title}${delimiter}${issue.html_url}`;
    console.log(text);
    toFile(text);
  });
  const delimiterRepo = "=".repeat(columns);
  console.log(delimiterRepo);
  toFile(delimiterRepo);
};

const printHeader = () => {
  const text = "Projects overview".toUpperCase();
  const start = Math.floor(columns / 2);
  const header = text.padStart(start, " ");
  console.log(header);
  toFile(header);
};

const printHiddenRepository = () => {
  if (0 === hiddenRepositories.length) return;
  console.log(
    `\x1B[1mHidden repositories(not showing): \x1B[0m${hiddenRepositories.join(
      ", "
    )}\n`
  );
};

const printDashboard = () => {
  return repositories
    .filter((repo) => !hiddenRepositories.includes(repo))
    .map((repo) => print(repo));
};

process.stdout.write("\x1Bc");

if (existsSync(filePath)) {
  unlinkSync(filePath);
}

printHeader();
const printDashboardStatus = await printDashboard();
await Promise.all(printDashboardStatus);
generateAutocompleteZsh(pwd);
printHiddenRepository();
