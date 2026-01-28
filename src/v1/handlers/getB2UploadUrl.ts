import { fetchResult } from "@/utils/fetchResult"
import type { B2UploadUrlResponse } from "@/v1/validators"
import { b2UploadUrlResponseSchema } from "@/v1/validators"
import { parseJson, pipe, string, type BaseIssue, type BaseSchema } from "valibot"
import type { Env } from "../../env/Env"

const b2UploadUrlJsonSchema = pipe(string(), parseJson(), b2UploadUrlResponseSchema) as BaseSchema<
  string,
  B2UploadUrlResponse,
  BaseIssue<string>
>

export async function getB2UploadUrl(
  env: Env,
  apiUrl: string,
  authorizationToken: string,
): Promise<B2UploadUrlResponse | null> {
  const response = await fetch(`https://${apiUrl}/b2api/v4/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId: env.B2_BUCKET_ID }),
  })

  const result = await fetchResult<B2UploadUrlResponse>("b2_get_upload_url", b2UploadUrlJsonSchema, response)

  if (result.success) {
    return result.data
  }

  console.error("Failed to get B2 upload URL:", result.errorMessage)
  return null
}

export function getApiUrlFromEndpoint(endpoint: string): string {
  const url = new URL(endpoint)
  const hostname = url.hostname
  const parts = hostname.split(".")
  if (parts.length >= 4 && parts[parts.length - 3] === "backblazeb2") {
    const region = parts[parts.length - 4]
    return `api.${region}.backblazeb2.com`
  }
  return "api.backblazeb2.com"
}
