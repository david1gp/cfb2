import { verifyToken } from "@/auth/jwt_token/verifyToken"
import type { Env } from "@/env/Env"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"
import { createResultError } from "~utils/result/Result"

export async function uploadFileHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
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

  const saltResult = envTokenSecretResult(_env as unknown as Record<string, string>)
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

  const responseData = {
    fileId: "test-file-id-" + Date.now(),
    uploadTimestamp: Date.now(),
  }
  return new Response(JSON.stringify(responseData), {
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
