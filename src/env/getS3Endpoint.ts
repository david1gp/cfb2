import type { Env } from "@/types"


export function getS3Endpoint(env: Env): string {
  return env.B2_ENDPOINT
}
