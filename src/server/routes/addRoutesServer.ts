import { isOnlineHandler } from "@/server/handlers_technical/isOnlineHandler"
import { versionHandler } from "@/server/handlers_technical/versionHandler"
import type { HonoApp } from "@/utils/HonoApp"
import { apiPathVersion } from "@client/apiB2GetVersion"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"

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
