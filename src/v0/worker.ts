import type { Env } from "@/env/Env"
import { getCorsHeaders } from "@/headers/getCorsHeaders"
import { route } from "./router"

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (request.method === "OPTIONS") {
      const corsHeaders = getCorsHeaders(env, request)
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    return route(pathname, request.method, request, env, ctx)
  },
}
