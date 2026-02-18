import { apiPathB2 } from "./apiBaseB2"
import type { B2ApiUploadFileProps } from "./B2ApiUploadFileProps"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { b2UploadResultSchema, type B2UploadResult } from "./b2UploadResultSchema"

export const apiPathUploadFile = "/upload"

export const uploadHeaderFields = {
  authorization: "Authorization",
  displayName: "Display-Name",
  fileSize: "File-Size",
  contentType: "Content-Type",
  sha1: "SHA-1",
} as const

const b2UploadResultJsonSchema = a.pipe(a.string(), a.parseJson(), b2UploadResultSchema)

export async function apiB2UploadViaWorker(
  token: string,
  p: B2ApiUploadFileProps,
  file: any,
  baseUrl: string,
): PromiseResult<B2UploadResult> {
  const op = "apiB2UploadViaWorker"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const headers: Record<string, string> = {
    [uploadHeaderFields.authorization]: `Bearer ${token}`,
    [uploadHeaderFields.displayName]: p.fullFileName,
    [uploadHeaderFields.fileSize]: p.contentLength.toString(),
    [uploadHeaderFields.contentType]: p.mimeType,
    [uploadHeaderFields.sha1]: p.sha1,
  }

  const response = await fetch(baseUrl + apiPathB2 + apiPathUploadFile, {
    method: "POST",
    headers,
    body: file,
  })

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const parseResult = a.safeParse(b2UploadResultJsonSchema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }

  return createResult(parseResult.output)
}
