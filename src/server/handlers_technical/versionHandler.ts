import type { Env } from "@/env/Env"
import { packageVersion } from "@/env/packageVersion"

export async function versionHandler(_request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  return new Response(env.VERSION ?? packageVersion, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
}
