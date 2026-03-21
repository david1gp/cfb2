import { envVersionResult } from "../../env/envVersionResult.js"
import { packageVersion } from "../../env/packageVersion.js"
import type { HonoContext } from "../../utils/HonoContext.js"

export async function versionHandler(c: HonoContext): Promise<Response> {
  const versionResult = envVersionResult(c.env)
  return c.text(versionResult.success ? versionResult.data : packageVersion, 200, {
    "Content-Type": "text/plain",
  })
}
