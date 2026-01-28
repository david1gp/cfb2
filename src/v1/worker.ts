import { getCorsHeaders } from "@/headers/getCorsHeaders"
import { handleDownload } from "@/v1/handlers/handleDownload"
import { handleUpload } from "@/v1/handlers/handleUpload"
import { handleUploadPath } from "@/v1/handlers/handleUploadPath"
import type { Env } from "../env/Env"

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname === "/") {
      return new Response("Access to root path is not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (request.method === "OPTIONS") {
      const corsHeaders = getCorsHeaders(env, request)
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    if (pathname === "/upload" && request.method === "POST") {
      return handleUpload(request, env)
    }

    if (pathname === "/upload-path" && request.method === "GET") {
      return handleUploadPath(request, env)
    }

    return handleDownload(request, env)
  },
}
