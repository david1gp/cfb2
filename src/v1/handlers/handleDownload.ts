import { getCorsHeaders } from "@/headers/getCorsHeaders"
import type { Env } from "../../env/Env"

export async function handleDownload(request: Request, env: Env): Promise<Response> {

  if (!env.B2_BUCKET_PUBLIC_BASE_URL) {
    return new Response("B2_BUCKET_PUBLIC_BASE_URL environment variable is not configured", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }

  const url = new URL(request.url)
  const pathname = url.pathname

  const b2Url = `${env.B2_BUCKET_PUBLIC_BASE_URL}${pathname}${url.search}`
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value)
    }
  })

  const response = await fetch(b2Url, {
    method: request.method,
    headers: headers,
    body: request.body,
  })

  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    if (!["content-encoding", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  const corsHeaders = getCorsHeaders(env, request)
  corsHeaders.forEach((value, key) => {
    responseHeaders.set(key, value)
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}
