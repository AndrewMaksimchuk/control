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

export async function ratelimit() {
  try {
    const response = await octokit.request("GET /rate_limit") 
    const remaining = response.headers["x-ratelimit-remaining"]
    
    if (remaining < 100) {
      const reset = response.headers["x-ratelimit-reset"]
      const resetAsNeesForHuman = (new Date(reset * 1000)).toLocaleString()
      console.log("Near rate limit")
      console.log("Wait until " + resetAsNeesForHuman)
      process.exit(0)
    }

    console.log(response)
  } catch {
    console.error("Fail to check rate limit")
   process.exit(1) 
  }
}
