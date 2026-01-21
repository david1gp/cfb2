import type { Env } from "@/types"

export function getUploadUrlExpirationMs(env: Env): number {
  const expirationMs = env.UPLOAD_URL_EXPIRATION_MS
  if (!expirationMs) {
    return 86400000
  }
  const parsed = Number.parseInt(expirationMs, 10)
  return isNaN(parsed) ? 86400000 : parsed
}
