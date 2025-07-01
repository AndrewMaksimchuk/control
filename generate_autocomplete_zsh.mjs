import { writeFile } from "node:fs";
import { join } from "node:path";
import { fileAutocompletionZsh } from "./variales.mjs";
import { repositories } from "./repositories.mjs";

const itemsAutocomplition = [];
const repositoriesWithIssues = [];
const issuesOfRepositories = [];

function generatePairCompletionDescription(completion = "", description = "") {
  return `'${completion}:${description}'`;
}

function generateArray(name = "", items = []) {
  return `${name}=(${items.join(" ")})`;
}

function generateCaseInExpressionItem(pattern = "", body = "") {
  return `('${pattern}') ${body} ;;`;
}

function generateCaseInExpression(word = "", lists = [""]) {
  return `case "${word}" in \n${lists.join("\n")} \nesac`;
}

function generateFunction(name = "", body = "") {
  return `funtion ${name}()\n{\n${body}\n}\n`;
}

function generateAutocompleteIssuesOfRepositories() {
  const lists = issuesOfRepositories.map(({ reponame, issues }) => {
    const arrayOfIssues = issues.map(({ number, title }) => {
      return generatePairCompletionDescription(number, title);
    });
    const body = generateArray("issues_of_repositories", arrayOfIssues);
    return generateCaseInExpressionItem(reponame, body);
  });
  lists.push(
    generateCaseInExpressionItem("*", generateArray("issues_of_repositories"))
  );
  const functionBody = generateCaseInExpression("$1", lists);
  return (
    "\nissues_of_repositories=()\n" +
    generateFunction("get_issues_of_repository", functionBody)
  );
}

export function addItemAutocompleteZsh(reponame = "unknown", issues = [""]) {
  itemsAutocomplition.push(
    generatePairCompletionDescription(reponame, issues.length)
  );
  repositoriesWithIssues.push(reponame);
  issuesOfRepositories.push({
    reponame,
    issues,
  });
}

function sumRepositoriesWithAndWithoutIssues() {
  const allRepositriesiWithoutIssues = repositories
    .filter((reponame) => !repositoriesWithIssues.includes(reponame))
    .map((reponame) => generatePairCompletionDescription(reponame, 0));
  return [...itemsAutocomplition, ...allRepositriesiWithoutIssues];
}

function generateAutocompleteBashArray() {
  const items = sumRepositoriesWithAndWithoutIssues();
  return generateArray("repositories_names", items);
}

export function generateAutocompleteZsh(path) {
  const content =
    generateAutocompleteBashArray() +
    generateAutocompleteIssuesOfRepositories();
  writeFile(
    join(path, fileAutocompletionZsh),
    content,
    { flag: "w" },
    (err) => {}
  );
}

// Example of generated bash file:
// repositories_names=('ts-to-css:1' 'links:1' 'note:2' 'learn_words:5' 'functions.js:5' 'radiomag:21' 'spending:8' 'nodejsma:11' 'control:2' 'babel-plugin-transform-pipe-operator:0' 'esbuild-plugin-cpp:0' 'mcu:0' 'readbook:0' 'pomodoro:0' 'driver_bot:0' 'dotfiles:0' 'hooks:0' 'vodiy:0' 'web_builder:0' 'web-shell:0' 'invoices:0' 'watchdog:0' 'instalater-in-praha:0')
// issues_of_repositories=()

// functions get_issues_of_repository()
// {
//   case "$1" in
//     ('ts-to-css')
//       issues_of_repositories=('ts-to-css')
//     ;;
//     ('links')
//       issues_of_repositories=('links')
//     ;;
//     ('note')
//       issues_of_repositories=('note')
//     ;;
//     (*)
//       issues_of_repositories=()
//     ;;
//   esac
// }
