import { verifyToken } from "@/auth/jwt_token/verifyToken"
import { b2ApiGetUploadUrl } from "@/b2/api/b2ApiGetUploadUrl"
import { b2ApiUploadFile } from "@/b2/api/b2ApiUploadFile"
import { enableLogging } from "@/config/enableLogging"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { b2AuthKvGetAndSave } from "@/server/cache/b2AuthKv"
import type { HonoContext } from "@/utils/HonoContext"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"
import { createResultError } from "~utils/result/Result"

export async function uploadFileHandler(c: HonoContext): Promise<Response> {
  const op = "uploadFileHandler"
  if (enableLogging) console.log(">>>", op, "START")

  let authHeader = c.req.header(uploadHeaderFields.authorization)
  if (enableLogging) console.log(op, "authHeader:", authHeader ? "present" : "missing")
  if (!authHeader) {
    const error = createResultError("uploadFileHandler", "Missing Authorization header")
    console.error(op, "error: Missing Authorization header")
    return c.json(error, 401)
  }

  if (authHeader.startsWith("Bearer ")) {
    authHeader = authHeader.slice(7)
  }

  const saltResult = envTokenSecretResult(c.env)
  if (enableLogging) console.log(op, "saltResult success:", saltResult.success)
  if (!saltResult.success) {
    console.error(op, "error getting salt:", saltResult.errorMessage)
    return c.json(saltResult, 500)
  }

  const tokenResult = await verifyToken(authHeader, saltResult.data)
  if (enableLogging) console.log(op, "tokenResult success:", tokenResult.success)
  if (!tokenResult.success) {
    const error = createResultError("uploadFileHandler", "Invalid token")
    console.error(op, "error: Invalid token", tokenResult.errorMessage)
    return c.json(error, 401)
  }

  const fullFileName = c.req.header(uploadHeaderFields.displayName)
  if (enableLogging) console.log(op, "fullFileName:", fullFileName)
  if (!fullFileName) {
    return missingHeaderError(c, uploadHeaderFields.displayName)
  }

  const contentLength = c.req.header(uploadHeaderFields.fileSize)
  if (enableLogging) console.log(op, "contentLength:", contentLength)
  if (!contentLength) {
    return missingHeaderError(c, uploadHeaderFields.fileSize)
  }

  const mimeType = c.req.header(uploadHeaderFields.contentType)
  if (enableLogging) console.log(op, "mimeType:", mimeType)
  if (!mimeType) {
    return missingHeaderError(c, uploadHeaderFields.contentType)
  }

  const sha1 = c.req.header(uploadHeaderFields.sha1)
  if (enableLogging) console.log(op, "sha1:", sha1)
  if (!sha1) {
    return missingHeaderError(c, uploadHeaderFields.sha1)
  }

  if (enableLogging) console.log(op, "Getting B2 auth...")
  const b2AuthResult = await b2AuthKvGetAndSave(c.env)
  if (enableLogging) console.log(op, "b2AuthResult success:", b2AuthResult.success)
  if (!b2AuthResult.success) {
    const error = createResultError("uploadFileHandler", b2AuthResult.errorMessage || "Failed to get B2 auth")
    console.error(op, "error getting B2 auth:", b2AuthResult.errorMessage)
    return c.json(error, 500)
  }

  if (enableLogging) console.log(op, "Getting upload URL...")
  const uploadUrlResult = await b2ApiGetUploadUrl(b2AuthResult.data)
  if (enableLogging) console.log(op, "uploadUrlResult success:", uploadUrlResult.success)
  if (!uploadUrlResult.success) {
    const error = createResultError("uploadFileHandler", uploadUrlResult.errorMessage || "Failed to get upload URL")
    console.error(op, "error getting upload URL:", uploadUrlResult.errorMessage)
    return c.json(error, 500)
  }

  if (enableLogging) console.log(op, "Reading body...")
  const body = await c.req.arrayBuffer()
  if (enableLogging) console.log(op, "body size:", body.byteLength)

  if (enableLogging) console.log(op, "Uploading file...")
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

  if (enableLogging) console.log(op, "uploadResult success:", uploadResult.success)
  if (!uploadResult.success) {
    const error = uploadResult
    console.error(op, "error uploading file:", uploadResult.errorMessage)
    return c.json(error, 500)
  }

  if (enableLogging) console.log(">>>", op, "SUCCESS")
  return c.json(uploadResult.data, 200)
}

function missingHeaderError(c: HonoContext, headerName: string): Response {
  const error = createResultError("uploadFileHandler", `Missing or empty ${headerName} header`)
  return c.json(error, 400)
}
