import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { apiPathVersion } from "../../../client/apiB2GetVersion.js"
import { apiPathIsOnline } from "../../../client/apiB2IsOnline.js"
import type { HonoApp } from "../../utils/HonoApp.js"
import { isOnlineHandler } from "../handlers_technical/isOnlineHandler.js"
import { versionHandler } from "../handlers_technical/versionHandler.js"

export function addRoutesServer(app: HonoApp) {
  app.get(
    apiPathVersion,
    describeRoute({
      description: "Get the current API version",
      tags: ["server"],
      responses: {
        200: {
          description: "Successful response",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    versionHandler,
  )

  app.get(
    apiPathIsOnline,
    describeRoute({
      description: "Health check endpoint",
      tags: ["server"],
      responses: {
        200: {
          description: "Service is healthy",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    isOnlineHandler,
  )
}
