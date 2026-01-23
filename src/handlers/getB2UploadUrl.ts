import type { Env } from "@/types"
import { fetchResult } from "@/utils/fetchResult"
import type { B2UploadUrlResponse } from "@/validators"
import { b2UploadUrlResponseSchema } from "@/validators"
import { parseJson, pipe, string, type BaseIssue, type BaseSchema } from "valibot"

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
    body: JSON.stringify({ bucketId: env.PEER_BUCKET_ID }),
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
  return url.host
}
