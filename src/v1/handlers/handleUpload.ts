import { getApiUrlFromEndpoint, getB2UploadUrl } from "@/v1/handlers/getB2UploadUrl"
import { uploadRequestSchema } from "@/v1/validators"
import { safeParse } from "valibot"
import type { Env } from "../../env/Env"

export async function handleUpload(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get("content-type")
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return new Response("Content-Type must be multipart/form-data", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!file || !(file instanceof Blob)) {
    return new Response("File is required", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    })
  }

  const key = formData.get("key")
  const contentTypeVal = formData.get("contentType")
  const sha1 = formData.get("sha1")

  if (!key || !contentTypeVal || !sha1) {
    return new Response("key, contentType, and sha1 are required", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    })
  }

  const requestData = {
    key: key.toString(),
    contentType: contentTypeVal.toString(),
    sha1: sha1.toString(),
  }

  const parseResult = safeParse(uploadRequestSchema, requestData)
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

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const uploadResponse = await fetch(uploadUrlResult.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrlResult.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(requestData.key),
        "Content-Type": requestData.contentType,
        "Content-Length": uint8Array.length.toString(),
        "X-Bz-Content-Sha1": requestData.sha1,
      },
      body: uint8Array,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("B2 upload error:", uploadResponse.status, uploadResponse.statusText, errorText)
      return new Response("Upload to B2 failed", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        key: requestData.key,
        size: uint8Array.length,
        contentType: requestData.contentType,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Upload error:", error)
    return new Response("Upload failed", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
