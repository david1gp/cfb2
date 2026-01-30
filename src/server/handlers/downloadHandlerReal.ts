import type { HonoContext } from "@/utils/HonoContext"

export async function downloadHandlerReal(c: HonoContext): Promise<Response> {
  const op = "downloadHandlerReal"
  const env = c.env

  // Route: /b2/* - extract path after /b2/
  const objectKey = c.req.path.replace(/^\/b2\//, "")

  if (!objectKey) {
    return c.text("File path required", 400)
  }

  try {
    const targetUrl = new URL(objectKey, env.B2_BUCKET_PUBLIC_BASE_URL).toString()

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
    headers.set(
      "Cache-Control",
      env.HEADER_CACHE_CONTROL?.trim() || "public, max-age=86400, stale-while-revalidate=259200, immutable",
    )

    const corsOrigin = env.HEADER_CORS_ALLOW_ORIGIN?.trim() || "*"
    headers.set("Access-Control-Allow-Origin", corsOrigin)

    if (corsOrigin !== "*") {
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
      headers.set("Access-Control-Max-Age", env.HEADER_CORS_MAX_AGE?.trim() || "86400")
    }

    headers.set("X-Content-Type-Options", "nosniff")

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  } catch (err) {
    console.error("[B2 Proxy]", err)
    return c.text(`Proxy error: ${err instanceof Error ? err.message : "unknown"}`, 502)
  }
}
