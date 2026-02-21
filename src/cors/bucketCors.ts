import config from "../../wrangler.jsonc"
import { b2ApiAuthorizeAccount } from "@/b2/api/b2ApiAuthorizeAccount"
import { enableLogging } from "@/config/enableLogging"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

const log = true

interface B2CorsRule {
  corsRuleName: string
  allowedOrigins: string[]
  allowedHeaders: string[]
  allowedOperations: string[]
  exposeHeaders: string[]
  maxAgeSeconds: number
}

interface B2BucketResponse {
  accountId: string
  bucketId: string
  bucketName: string
  bucketType: string
  corsRules: B2CorsRule[]
}

async function b2ApiUpdateBucket(
  apiUrl: string,
  authorizationToken: string,
  accountId: string,
  bucketId: string,
  corsRules: B2CorsRule[],
): PromiseResult<B2BucketResponse> {
  const op = "b2ApiUpdateBucket"
  const response = await fetch(`${apiUrl}/b2api/v4/b2_update_bucket`, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountId,
      bucketId,
      corsRules,
    }),
  })

  const fetched = await response.text()
  if (enableLogging) console.log(op, "fetched:", fetched)

  if (!response.ok) {
    return createResultError(op, "API error", fetched)
  }

  try {
    const data = JSON.parse(fetched)
    return createResult(data)
  } catch {
    return createResultError(op, "Failed to parse response", fetched)
  }
}

function getEnvConfig(envName: string) {
  if (!config.env || !config.env[envName] || !config.env[envName].vars) {
    return null
  }
  const vars = config.env[envName].vars
  return {
    keyId: vars.B2_KEY_ID,
    key: vars.B2_KEY,
  }
}

export async function bucketCors(envName: string, allowedDomain: string): PromiseResult<B2BucketResponse> {
  const op = "bucketCors"
  if (enableLogging) console.log(op, envName, allowedDomain)

  const envConfig = getEnvConfig(envName)
  if (!envConfig) {
    return createResultError(op, "Environment '" + envName + "' not found in wrangler.jsonc")
  }

  const { keyId, key } = envConfig

  const authResult = await b2ApiAuthorizeAccount(keyId, key)
  if (!authResult.success) {
    return createResultError(op, "Failed to authorize", authResult.errorMessage)
  }

  const corsRule: B2CorsRule = {
    corsRuleName: "allow-browser-uploads",
    allowedOrigins: ["https://" + allowedDomain, "http://localhost:3000"],
    allowedHeaders: ["authorization", "x-bz-file-name", "x-bz-content-sha1", "content-type"],
    allowedOperations: ["b2_upload_file", "b2_upload_part"],
    exposeHeaders: ["x-bz-content-sha1"],
    maxAgeSeconds: 3600,
  }

  const updateResult = await b2ApiUpdateBucket(
    authResult.data.apiUrl,
    authResult.data.authorizationToken,
    authResult.data.accountId,
    authResult.data.bucketId,
    [corsRule],
  )

  if (!updateResult.success) {
    return createResultError(op, "Failed to update bucket CORS", updateResult.errorMessage)
  }

  if (enableLogging) console.log(op, "success", updateResult.data)
  return createResult(updateResult.data)
}

if (import.meta.main) {
  const args = process.argv.slice(2)
  const envName = args[0]
  const allowedDomain = args[1]

  if (!envName || !allowedDomain) {
    console.error("Usage: bun run bucketCors.ts <env> <allowedDomain>")
    console.error("Example: bun run bucketCors.ts peer app.dcc.com")
    process.exit(1)
  }

  bucketCors(envName, allowedDomain)
    .then((result) => {
      if (result.success) {
        console.log("CORS rules updated successfully:", JSON.stringify(result.data.corsRules, null, 2))
      } else {
        console.error("Error:", result.errorMessage)
        process.exit(1)
      }
    })
    .catch((err) => {
      console.error("Unexpected error:", err)
      process.exit(1)
    })
}
