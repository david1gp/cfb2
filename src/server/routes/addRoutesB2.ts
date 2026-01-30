import { downloadHandlerDummy } from "@/server/handlers/downloadHandlerDummy"
import { getUploadUrlHandler } from "@/server/handlers/getUploadUrlHandler"
import { uploadFileHandler } from "@/server/handlers/uploadFileHandler"
import { isOnlineHandler } from "@/server/handlers_technical/isOnlineHandler"
import { versionHandler } from "@/server/handlers_technical/versionHandler"
import type { HonoApp } from "@/utils/HonoApp"
import { apiPathDownloadFile } from "@client/apiB2DownloadFile"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathVersion } from "@client/apiB2GetVersion"
import { apiPathIsOnline } from "@client/apiB2IsOnline"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiBaseB2 } from "@client/apiBaseB2"
import { b2GetUploadUrlResponseSchema } from "@client/b2GetUploadUrlResponseSchema"
import { b2UploadResultSchema } from "@client/b2UploadResultSchema"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"
import { downloadHandlerReal } from "../handlers/downloadHandlerReal"

export function addRoutesB2(app: HonoApp) {
  app.get(
    `${apiBaseB2}${apiPathVersion}`,
    describeRoute({
      description: "Get the current API version",
      tags: ["b2"],
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
    `${apiBaseB2}${apiPathIsOnline}`,
    describeRoute({
      description: "Health check endpoint",
      tags: ["b2"],
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

  app.get(
    "/b2/*",
    describeRoute({
      description: "Download a file from Backblaze B2 storage",
      tags: ["b2"],
      responses: {
        200: {
          description: "File content",
          content: {
            "application/octet-stream": { schema: resolver(a.string()) },
          },
        },
        404: {
          description: "File not found in bucket",
          content: {
            "text/plain": {
              schema: resolver(a.string()),
            },
          },
        },
      },
    }),
    downloadHandlerReal,
  )

  app.get(
    `${apiBaseB2}${apiPathGetUploadUrl}`,
    describeRoute({
      description: "Get B2 upload URL and authorization token",
      tags: ["b2"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Upload URL and token",
          content: {
            "application/json": { schema: resolver(b2GetUploadUrlResponseSchema) },
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
    getUploadUrlHandler,
  )

  app.post(
    `${apiBaseB2}${apiPathUploadFile}`,
    describeRoute({
      description: "Upload a file to Backblaze B2 via the worker",
      tags: ["b2"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Upload result",
          content: {
            "application/json": { schema: resolver(b2UploadResultSchema) },
          },
        },
        400: {
          description: "Bad request - missing headers",
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
    uploadFileHandler,
  )
}
