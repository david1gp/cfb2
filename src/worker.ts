import { handleUpload } from "@/handlers/handleUpload"
import { handleUploadPath } from "@/handlers/handleUploadPath"
import { handleDownload } from "@/handlers/handleDownload"
import { getCorsHeaders } from "@/headers/getCorsHeaders"
import type { Env } from "@/types"

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

    if (!env.PUBLIC_BUCKET_BASE_URL) {
      return new Response("PUBLIC_BUCKET_BASE_URL environment variable is not configured", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
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
