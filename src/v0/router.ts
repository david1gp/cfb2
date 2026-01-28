import type { Env } from "@/env/Env"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"
import { downloadHandler } from "./handlers/downloadHandler"
import { getUploadUrlHandler } from "./handlers/getUploadUrlHandler"
import { isOnlineHandler } from "./handlers_technical/isOnlineHandler"
import { notAllowedHandler } from "./handlers_technical/notAllowedHandler"
import { rootHandler } from "./handlers_technical/rootHandler"
import { uploadFileHandler } from "./handlers/uploadFileHandler"

export type RouteHandlerFn = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>

export const getRoutes: Record<string, RouteHandlerFn> = {
  "/": rootHandler,
  [apiBaseB2 + apiPathGetUploadUrl]: getUploadUrlHandler,
  [apiBaseB2 + apiPathIsOnline]: isOnlineHandler,
}

export const postRoutes: Record<string, RouteHandlerFn> = {
  [apiBaseB2 + apiPathUploadFile]: uploadFileHandler,
}

export async function route(
  pathname: string,
  method: string,
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  if (method === "GET") {
    const handler = getRoutes[pathname] || downloadHandler
    return handler(request, env, ctx)
  }
  if (method === "POST") {
    const handler = postRoutes[pathname] || notAllowedHandler
    return handler(request, env, ctx)
  }
  return notAllowedHandler(request, env, ctx)
}
