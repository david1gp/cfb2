import { getS3Client } from "@/getS3Client"
import type { Env } from "@/types"
import { uploadRequestSchema } from "@/validators"
import { safeParse } from "valibot"

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
    const s3 = getS3Client(env)
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    await s3.putAnyObject(requestData.key, uint8Array, requestData.contentType)

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
