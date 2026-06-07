import { Octokit } from "@octokit/core";

const TOKEN = process.env.GITHUB_USER_TOKEN

if (TOKEN === undefined) {
  process.stdout.write(
    "Github user token is undefined!\n\
      Please set to GITHUB_USER_TOKEN variable.\n"
  )
  process.exit(1)
}

export const octokit = new Octokit({ auth: TOKEN })

export async function validateToken() {
  try {
    await octokit.request("GET /user") 
  } catch {
    console.error("Token is invalid or expired")
    process.exit(1)
  }
}
