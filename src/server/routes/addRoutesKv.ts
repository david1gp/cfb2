import { kvHandler } from "@/server/handlers/kvHandler"
import type { HonoApp } from "@/utils/HonoApp"
import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

export function addRoutesKv(app: HonoApp) {
  app.get(
    `${apiBaseB2}${apiPathKv}/:key`,
    describeRoute({
      description: "Get value for a specific KV key",
      tags: ["kv"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Key value",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    kvHandler,
  )

  app.post(
    `${apiBaseB2}${apiPathKv}/:key`,
    describeRoute({
      description: "Set value for a KV key with optional expiration",
      tags: ["kv"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Success",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
        400: {
          description: "Bad request - invalid key",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    kvHandler,
  )

  app.delete(
    `${apiBaseB2}${apiPathKv}/:key`,
    describeRoute({
      description: "Delete a specific KV key",
      tags: ["kv"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Success",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
        400: {
          description: "Bad request - invalid key",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    kvHandler,
  )
}
