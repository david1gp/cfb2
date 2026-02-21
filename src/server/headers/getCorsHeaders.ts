import { type Env } from "@/env/Env"
import { uploadHeaderFields } from "@client/apiB2UploadViaWorker"
import { getOriginFromRequest } from "./getOriginFromRequest"
import { parseAllowedOrigins } from "./parseAllowedOrigins"

const corsAllowedHeaders = ["Authorization", "If-Modified-Since", ...Object.values(uploadHeaderFields)].join(", ")

export function getCorsHeaders(env: Env, request: Request): Headers {
  const headers = new Headers()

  // Parse CORS allow origins (comma-separated), default to ["*"]
  const allowOrigins = parseAllowedOrigins(env.HEADER_CORS_ALLOW_ORIGIN)

  const requestOrigin = getOriginFromRequest(request)

  if (requestOrigin && allowOrigins.includes(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin)
  } else if (allowOrigins.includes("*")) {
    headers.set("Access-Control-Allow-Origin", "*")
  }

  // Set max age if provided, default to 300 (5 minutes)
  const maxAge = env.HEADER_CORS_MAX_AGE || "300"
  headers.set("Access-Control-Max-Age", maxAge)

  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, DELETE")
  headers.set("Access-Control-Allow-Headers", corsAllowedHeaders)

  return headers
}
