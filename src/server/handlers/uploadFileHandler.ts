import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadFile } from "@/b2/api/b2ApiUploadFile"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { b2AuthKvGetAndSave } from "@/server/cache/b2AuthKv"
import type { HonoContext } from "@/utils/HonoContext"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"
import { createResultError } from "~utils/result/Result"

export async function uploadFileHandler(c: HonoContext): Promise<Response> {
  let authHeader = c.req.header(uploadHeaderFields.authorization)
  if (!authHeader) {
    const error = createResultError("uploadFileHandler", "Missing Authorization header")
    return c.json(error, 401)
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(c.env as unknown as Record<string, string>)
  if (!saltResult.success) {
    return c.json(saltResult, 500)
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (!tokenResult.success) {
    const error = createResultError("uploadFileHandler", "Invalid token")
    return c.json(error, 401)
  }

  const fullFileName = c.req.header(uploadHeaderFields.displayName)
  if (!fullFileName) {
    return missingHeaderError(c, uploadHeaderFields.displayName)
  }

  const contentLength = c.req.header(uploadHeaderFields.fileSize)
  if (!contentLength) {
    return missingHeaderError(c, uploadHeaderFields.fileSize)
  }

  const mimeType = c.req.header(uploadHeaderFields.contentType)
  if (!mimeType) {
    return missingHeaderError(c, uploadHeaderFields.contentType)
  }

  const sha1 = c.req.header(uploadHeaderFields.sha1)
  if (!sha1) {
    return missingHeaderError(c, uploadHeaderFields.sha1)
  }

  const b2AuthResult = await b2AuthKvGetAndSave(c.env)
  if (!b2AuthResult.success) {
    const error = createResultError("uploadFileHandler", b2AuthResult.errorMessage || "Failed to get B2 auth")
    return c.json(error, 500)
  }

  const uploadUrlResult = await b2ApiGetUploadUrl(b2AuthResult.data)
  if (!uploadUrlResult.success) {
    const error = createResultError("uploadFileHandler", uploadUrlResult.errorMessage || "Failed to get upload URL")
    return c.json(error, 500)
  }

  const body = await c.req.arrayBuffer()
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
    return c.json(error, 500)
  }

  return c.json(uploadResult.data, 200)
}

function missingHeaderError(c: HonoContext, headerName: string): Response {
  const error = createResultError("uploadFileHandler", `Missing or empty ${headerName} header`)
  return c.json(error, 400)
}
