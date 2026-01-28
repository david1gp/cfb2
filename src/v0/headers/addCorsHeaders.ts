import { getCorsHeaders } from "@/headers/getCorsHeaders"
import type { Env } from "@/env/Env"

export function addCorsHeaders(response: Response, env: Env, request: Request): Response {
  const corsHeaders = getCorsHeaders(env, request)
  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value)
  })
  return response
}
