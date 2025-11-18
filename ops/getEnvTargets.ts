import config from "../wrangler.jsonc"

// Run the function if script is executed directly
// @ts-ignore
if (import.meta.main) {
  getEnvTargets().then((envs) => {
    console.log(`Found environments: ${envs.join(", ")}`)
  })
}

export async function getEnvTargets(): Promise<string[]> {
  if (!config.env || typeof config.env !== "object") {
    return []
  }

  return Object.keys(config.env)
}
