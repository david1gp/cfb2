import type { Env } from "@/env/Env"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { apiPathKvList } from "@client/apiKvList"
import { downloadHandler } from "./handlers/downloadHandler"
import { getUploadUrlHandler } from "./handlers/getUploadUrlHandler"
import { kvHandler } from "./handlers/kvHandler"
import { uploadFileHandler } from "./handlers/uploadFileHandler"
import { isOnlineHandler } from "./handlers_technical/isOnlineHandler"
import { notAllowedHandler } from "./handlers_technical/notAllowedHandler"
import { rootHandler } from "./handlers_technical/rootHandler"
import { versionHandler } from "./handlers_technical/versionHandler"

export type RouteHandlerFn = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>

export async function route(
  pathname: string,
  method: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (isKvPath(pathname)) {
    return kvHandler(request, env, ctx)
  }
  if (method === "GET") {
    const handler = getRoutes[pathname]
    if (handler) return handler(request, env, ctx)
    return downloadHandler(request, env, ctx)
  }
  if (method === "POST") {
    const handler = postRoutes[pathname]
    if (handler) return handler(request, env, ctx)
    return notAllowedHandler(request, env, ctx)
  }
  return notAllowedHandler(request, env, ctx)
}

export const getRoutes: Record<string, RouteHandlerFn> = {
  "/": rootHandler,
  "/version": versionHandler,
  [apiBaseB2 + apiPathGetUploadUrl]: getUploadUrlHandler,
  [apiBaseB2 + apiPathIsOnline]: isOnlineHandler,
  [apiBaseB2 + apiPathKvList]: kvHandler,
}

export const postRoutes: Record<string, RouteHandlerFn> = {
  [apiBaseB2 + apiPathUploadFile]: uploadFileHandler,
}

function isKvPath(pathname: string): boolean {
  const kvPrefix = apiBaseB2 + apiPathKv + "/"
  return pathname.startsWith(kvPrefix)
}
