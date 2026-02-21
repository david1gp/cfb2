import { envB2BucketPublicBaseUrlResult } from "@/env/envB2BucketPublicBaseUrlResult"
import { envHeaderCacheControlResult } from "@/env/envHeaderCacheControlResult"
import { getCorsHeaders } from "@/server/headers/getCorsHeaders"
import type { HonoContext } from "@/utils/HonoContext"

export async function downloadHandler(c: HonoContext): Promise<Response> {
  const op = "downloadHandler"

  const baseUrlResult = envB2BucketPublicBaseUrlResult(c.env)
  if (!baseUrlResult.success) {
    return c.text(`Configuration error: ${baseUrlResult.errorMessage}`, 500)
  }

  const targetUrl = new URL(c.req.path, baseUrlResult.data).toString()

  const upstream = await fetch(targetUrl, {
    method: c.req.method,
    headers: {
      // Forward useful conditional headers
      Range: c.req.header("Range") ?? "",
      "If-None-Match": c.req.header("If-None-Match") ?? "",
      "If-Modified-Since": c.req.header("If-Modified-Since") ?? "",
    },
    redirect: "manual",
  })

  if (!upstream.ok && upstream.status !== 304) {
    // Let 304 pass through for caching
    if (upstream.status === 404) {
      return c.text("File not found", 404)
    }
    throw new Error(`Upstream status ${upstream.status}`)
  }

  // Prepare clean response headers
  const headers = new Headers(upstream.headers)

  // Apply cache & CORS from env
  const cacheControlResult = envHeaderCacheControlResult(c.env)
  const cacheControl = cacheControlResult.success ? cacheControlResult.data.trim() : ""
  if (cacheControl) {
    headers.set("Cache-Control", cacheControl)
  }

  const corsHeaders = getCorsHeaders(c.env, c.req.raw)
  corsHeaders.forEach((value, key) => {
    headers.set(key, value)
  })

  headers.set("X-Content-Type-Options", "nosniff")

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  })
}
