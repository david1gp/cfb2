#!/usr/bin/env bun

import { packageVersion } from "../src/env/packageVersion"
import { getEnvTargets } from "./getEnvTargets"

// Run the function if script is executed directly
// @ts-ignore
if (import.meta.main) {
  deployAllEnvironments()
}

async function deployAllEnvironments() {
  const environments = await getEnvTargets()

  if (environments.length === 0) {
    console.log("No environments found in wrangler.jsonc")
    return
  }

  console.log(`Found environments: ${environments.join(", ")}`)
  console.log(`Deploying version: ${packageVersion}`)
  console.log("")

  for (const env of environments) {
    console.log(`Deploying environment: ${env}`)

    const process = Bun.spawn(
      ["bun", "run", "wrangler", "deploy", "--env", env, "--var", `VERSION:${packageVersion}`],
      {
        stdout: "inherit",
        stderr: "inherit",
      },
    )

    const exitCode = await process.exited
    if (exitCode === 0) {
      console.log(`✓ Successfully deployed ${env}`)
    } else {
      console.log(`✗ Failed to deploy ${env} (exit code: ${exitCode})`)
    }

    console.log("")
  }
}
