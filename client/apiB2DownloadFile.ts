import { apiBaseB2 } from "@client/apiBaseB2"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export const apiPathDownloadFile = "/download"

export interface DownloadFileParams {
  key: string
  localPath: string
}

export const downloadResponseSchema = a.object({
  success: a.literal(true),
  key: a.string(),
  size: a.number(),
  contentType: a.string(),
})

export type DownloadResponse = a.InferOutput<typeof downloadResponseSchema>

export async function apiB2DownloadFile(
  baseUrl: string,
  token: string,
  params: DownloadFileParams,
): PromiseResult<DownloadResponse> {
  const op = "apiB2DownloadFile"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiBaseB2 + apiPathDownloadFile, baseUrl)
  url.searchParams.set("key", params.key)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const arrayBuffer = await response.arrayBuffer()
  const fileData = new Uint8Array(arrayBuffer)

  const dir = path.dirname(params.localPath)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(params.localPath, fileData)

  const parseResult = a.safeParse(downloadResponseSchema, response.url)
  if (!parseResult.success) {
    return createResult({
      success: true,
      key: params.key,
      size: fileData.length,
      contentType: response.headers.get("content-type") || "application/octet-stream",
    })
  }

  return createResult(parseResult.output)
}
