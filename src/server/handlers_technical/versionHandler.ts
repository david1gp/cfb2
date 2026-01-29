import { packageVersion } from "@/env/packageVersion"
import type { HonoContext } from "@/utils/HonoContext"

export async function versionHandler(c: HonoContext): Promise<Response> {
  return c.text(c.env.VERSION ?? packageVersion, 200, {
    "Content-Type": "text/plain",
  })
}
