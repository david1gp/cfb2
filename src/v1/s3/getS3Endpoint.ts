import type { Env } from "@/env/Env"


export function getS3Endpoint(env: Env): string {
  return env.B2_ENDPOINT
}
