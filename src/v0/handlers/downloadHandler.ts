import type { Env } from "@/env/Env"
import { getCacheControlHeader } from "@/headers/getCacheControlHeader"
import { apiPathDownloadFile } from "@client/apiB2DownloadFile"
import { apiBaseB2 } from "@client/apiBaseB2"

export async function downloadHandler(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname
  const downloadPrefix = apiBaseB2 + apiPathDownloadFile + "/"
  const fullFileName = pathname.startsWith(downloadPrefix)
    ? pathname.slice(downloadPrefix.length - 1).slice(1)
    : "test-file.txt"

  return new Response("dummy file content for: " + fullFileName, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${fullFileName}"`,
      "Cache-Control": getCacheControlHeader(env),
    },
  })
}
