import { getCorsHeaders } from "@/getCorsHeaders"

export interface Env {
  PUBLIC_BUCKET_BASE_URL: string
  CORS_ALLOW_ORIGIN?: string
  CORS_MAX_AGE?: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    // Disallow access to root path
    if (pathname === "/") {
      return new Response("Access to root path is not allowed", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      console.log("[DEBUG] Handling OPTIONS preflight request")
      const corsHeaders = getCorsHeaders(env, request)
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Check if PUBLIC_BUCKET_BASE_URL environment variable is set
    if (!env.PUBLIC_BUCKET_BASE_URL) {
      return new Response("PUBLIC_BUCKET_BASE_URL environment variable is not configured", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Construct the Backblaze B2 URL
    const b2Url = `${env.PUBLIC_BUCKET_BASE_URL}${pathname}${url.search}`

    // Copy headers from original request, excluding host
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value)
      }
    })

    // Fetch the resource from Backblaze B2
    const response = await fetch(b2Url, {
      method: request.method,
      headers: headers,
      body: request.body,
    })

    // Copy response headers, excluding some that shouldn't be forwarded
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    // Add CORS headers
    const corsHeaders = getCorsHeaders(env, request)
    corsHeaders.forEach((value, key) => {
      responseHeaders.set(key, value)
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  },
}
