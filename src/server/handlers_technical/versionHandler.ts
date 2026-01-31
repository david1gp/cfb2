import { envVersionResult } from "@/env/envVersionResult"
import { packageVersion } from "@/env/packageVersion"
import type { HonoContext } from "@/utils/HonoContext"

export async function versionHandler(c: HonoContext): Promise<Response> {
  const versionResult = envVersionResult(c.env)
  return c.text(versionResult.success ? versionResult.data : packageVersion, 200, {
    "Content-Type": "text/plain",
  })
}
