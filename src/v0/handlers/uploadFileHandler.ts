import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadFile } from "@/b2/api/b2ApiUploadFile"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { b2AuthKvGetAndSave } from "@/v0/cache/b2AuthKv"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"
import { createResultError } from "~utils/result/Result"

export async function uploadFileHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  let authHeader = request.headers.get(uploadHeaderFields.authorization)
  if (!authHeader) {
    const error = createResultError("uploadFileHandler", "Missing Authorization header")
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(env as unknown as Record<string, string>)
  if (!saltResult.success) {
    return new Response(JSON.stringify(saltResult), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError("uploadFileHandler", "Invalid token")
    return new Response(JSON.stringify(error), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const fullFileName = request.headers.get(uploadHeaderFields.displayName)
  if (!fullFileName) {
    return missingHeaderError(uploadHeaderFields.displayName)
  }

  const contentLength = request.headers.get(uploadHeaderFields.fileSize)
  if (!contentLength) {
    return missingHeaderError(uploadHeaderFields.fileSize)
  }

  const mimeType = request.headers.get(uploadHeaderFields.contentType)
  if (!mimeType) {
    return missingHeaderError(uploadHeaderFields.contentType)
  }

  const sha1 = request.headers.get(uploadHeaderFields.sha1)
  if (!sha1) {
    return missingHeaderError(uploadHeaderFields.sha1)
  }

  const b2AuthResult = await b2AuthKvGetAndSave(env as Env)
  if (!b2AuthResult.success) {
    const error = createResultError("uploadFileHandler", b2AuthResult.errorMessage || "Failed to get B2 auth")
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const uploadUrlResult = await b2ApiGetUploadUrl(b2AuthResult.data)
  if (!uploadUrlResult.success) {
    const error = createResultError("uploadFileHandler", uploadUrlResult.errorMessage || "Failed to get upload URL")
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const body = await request.arrayBuffer()
  const uploadResult = await b2ApiUploadFile(
    uploadUrlResult.data,
    {
      fullFileName,
      mimeType,
      contentLength,
      sha1,
    },
    body,
  )

  if (!uploadResult.success) {
    const error = uploadResult
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify(uploadResult.data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

function missingHeaderError(headerName: string): Response {
  const error = createResultError("uploadFileHandler", `Missing or empty ${headerName} header`)
  return new Response(JSON.stringify(error), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  })
}
