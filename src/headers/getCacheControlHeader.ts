import type { Env } from "@/types"

export function getCacheControlHeader(env: Env): string {
  return env.HEADER_CACHE_CONTROL || "public, max-age=86400, stale-while-revalidate=259200, immutable"
}
