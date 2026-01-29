import type { Env } from "@/env/Env"
import { getCorsHeaders } from "@/headers/getCorsHeaders"
import { downloadHandler } from "@/server/handlers/downloadHandler"
import { getUploadUrlHandler } from "@/server/handlers/getUploadUrlHandler"
import { kvHandler } from "@/server/handlers/kvHandler"
import { uploadFileHandler } from "@/server/handlers/uploadFileHandler"
import { isOnlineHandler } from "@/server/handlers_technical/isOnlineHandler"
import { notAllowedHandler } from "@/server/handlers_technical/notAllowedHandler"
import { rootHandler } from "@/server/handlers_technical/rootHandler"
import { versionHandler } from "@/server/handlers_technical/versionHandler"
import { setHeaderTimingSingleValue } from "@/server/headers/setHeaderTimingSingleValue"
import { apiPathDownloadFile } from "@client/apiB2DownloadFile"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathVersion } from "@client/apiB2GetVersion"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { Hono } from "hono"

const app = new Hono<{ Bindings: Env }>()

app.use("/*", async (c, next) => {
  const corsHeaders = getCorsHeaders(c.env, c.req.raw)
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  await next()
  corsHeaders.forEach((value, key) => {
    c.header(key, value)
  })
  return
})

app.get("/", rootHandler)
app.get(`${apiBaseB2}${apiPathVersion}`, versionHandler)

app.get(`${apiBaseB2}${apiPathIsOnline}`, isOnlineHandler)
app.get(`${apiBaseB2}${apiPathDownloadFile}/*`, downloadHandler)
app.get(`${apiBaseB2}${apiPathGetUploadUrl}`, getUploadUrlHandler)

app.post(`${apiBaseB2}${apiPathUploadFile}`, uploadFileHandler)

app.get(`${apiBaseB2}${apiPathKv}`, kvHandler)
app.get(`${apiBaseB2}${apiPathKv}/:key`, kvHandler)
app.post(`${apiBaseB2}${apiPathKv}/:key`, kvHandler)
app.delete(`${apiBaseB2}${apiPathKv}/:key`, kvHandler)

app.notFound(notAllowedHandler)

const notAllowedMethods = ["PUT", "PATCH", "DELETE"]
for (const method of notAllowedMethods) {
  app.on(method, "/*", notAllowedHandler)
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startedAt = Date.now()
    const response = await app.fetch(request, env, ctx)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
}
