import type { Env } from "@/env/Env"
import { getCorsHeaders } from "@/headers/getCorsHeaders"
import { setHeaderTimingSingleValue } from "@/v0/headers/setHeaderTimingSingleValue"
import { route } from "./router"

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const url = new URL(request.url)
    const pathname = url.pathname

    if (request.method === "OPTIONS") {
      const corsHeaders = getCorsHeaders(env, request)
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    const response = await route(pathname, request.method, request, env, ctx)
    const corsHeaders = getCorsHeaders(env, request)
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value)
    })
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
