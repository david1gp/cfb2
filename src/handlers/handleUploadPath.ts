import { getApiUrlFromEndpoint, getB2UploadUrl } from "@/handlers/getB2UploadUrl"
import type { Env } from "@/types"
import { uploadPathQuerySchema, uploadPathResponseSchema } from "@/validators"
import { safeParse } from "valibot"

export async function handleUploadPath(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get("key")
  const contentType = url.searchParams.get("contentType")
  const sha1 = url.searchParams.get("sha1")

  const queryData = {
    key: key || "",
    contentType: contentType || "",
    sha1: sha1 || "",
  }

  const parseResult = safeParse(uploadPathQuerySchema, queryData)
  if (!parseResult.success) {
    const issues = parseResult.issues.map((issue) => issue.message).join(", ")
    return new Response(`Validation error: ${issues}`, {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    })
  }

  try {
    const apiUrl = getApiUrlFromEndpoint(env.B2_ENDPOINT)
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new Response("Authorization header with Basic auth is required", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const base64Credentials = authHeader.slice(6)
    const credentials = atob(base64Credentials)
    const [accountId, applicationKey] = credentials.split(":")

    const uploadUrlResult = await getB2UploadUrl(env, apiUrl, `${accountId}:${applicationKey}`)

    if (!uploadUrlResult) {
      return new Response("Failed to get upload URL from B2", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const responseData = {
      uploadUrl: uploadUrlResult.uploadUrl,
      authorizationToken: uploadUrlResult.authorizationToken,
      key: queryData.key,
      contentType: queryData.contentType,
      sha1: queryData.sha1,
    }

    const responseParseResult = safeParse(uploadPathResponseSchema, responseData)
    if (!responseParseResult.success) {
      return new Response("Invalid response data from B2", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Get upload path error:", error)
    return new Response("Failed to get upload path", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
