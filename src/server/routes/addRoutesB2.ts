import { getUploadUrlHandler } from "@/server/handlers/getUploadUrlHandler"
import { uploadFileHandler } from "@/server/handlers/uploadFileHandler"
import type { HonoApp } from "@/utils/HonoApp"
import { apiPathGetUploadUrl } from "@client/apiB2GetUploadUrl"
import { apiPathUploadFile } from "@client/apiB2UploadViaWorker"
import { apiPathB2 } from "@client/apiBaseB2"
import { b2GetUploadUrlResponseSchema } from "@client/b2GetUploadUrlResponseSchema"
import { b2UploadResultSchema } from "@client/b2UploadResultSchema"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"
import { downloadHandler } from "../handlers/downloadHandler"

export function addRoutesB2(app: HonoApp) {
  app.get(
    `${apiPathB2}${apiPathGetUploadUrl}`,
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
    `${apiPathB2}${apiPathUploadFile}`,
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

  app.get(
    "/*",
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
        500: {
          description: "Configuration error - B2_BUCKET_PUBLIC_BASE_URL or header env vars not set",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    downloadHandler,
  )
}
