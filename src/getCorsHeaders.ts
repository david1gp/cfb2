import { type Env } from "@/worker"
import { getOriginFromRequest } from "./getOriginFromRequest"
import { parseAllowedOrigins } from "./parseAllowedOrigins"

export function getCorsHeaders(env: Env, request: Request): Headers {
  const headers = new Headers()

  // Parse CORS allow origins (comma-separated), default to ["*"]
  const allowOrigins = parseAllowedOrigins(env.CORS_ALLOW_ORIGIN)

  const requestOrigin = getOriginFromRequest(request)

  if (requestOrigin && allowOrigins.includes(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin)
  } else if (allowOrigins.includes("*")) {
    headers.set("Access-Control-Allow-Origin", "*")
  }

  // Set max age if provided, default to 300 (5 minutes)
  const maxAge = env.CORS_MAX_AGE || "300"
  headers.set("Access-Control-Max-Age", maxAge)

  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, If-Modified-Since")

  return headers
}
