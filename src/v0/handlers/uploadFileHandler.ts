import { verifyTokenResult } from "@/auth/jwt_token/verifyTokenResult"
import type { Env } from "@/env/Env"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"

export async function uploadFileHandler(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  const authHeader = request.headers.get(uploadHeaderFields.authorization)
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const tokenResult = await verifyTokenResult(authHeader)
  if (!tokenResult.success) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
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
  return new Response(JSON.stringify({ error: `Missing or empty ${headerName} header` }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  })
}
