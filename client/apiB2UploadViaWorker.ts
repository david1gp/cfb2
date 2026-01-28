import { apiBaseB2 } from "@client/apiBaseB2"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { b2UploadResultSchema, type B2UploadResult } from "./b2UploadResultSchema"

export const apiPathUploadFile = "/upload"

export const uploadHeaderFields = {
  authorization: "Authorization",
  fileId: "File-Id",
  resourceId: "Resource-Id",
  displayName: "Display-Name",
  fileSize: "File-Size",
  contentType: "Content-Type",
  imageWidth: "Image-Width",
  imageHeight: "Image-Height",
  sha1: "SHA-1",
} as const

export interface B2UploadProps {
  displayName: string
  fileSize: number
  mimeType: string
  fileId: string
  sha1: string
}

const b2UploadResultJsonSchema = a.pipe(a.string(), a.parseJson(), b2UploadResultSchema)

export async function apiB2UploadViaWorker(
  token: string,
  p: B2UploadProps,
  file: any,
  baseUrl: string,
): PromiseResult<B2UploadResult> {
  const op = "apiB2UploadViaWorker"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const headers: Record<string, string> = {
    [uploadHeaderFields.authorization]: token,
    [uploadHeaderFields.fileId]: p.fileId,
    [uploadHeaderFields.displayName]: p.displayName,
    [uploadHeaderFields.fileSize]: p.fileSize.toString(),
    [uploadHeaderFields.contentType]: p.mimeType,
    [uploadHeaderFields.sha1]: p.sha1,
  }

  const response = await fetch(baseUrl + apiBaseB2 + apiPathUploadFile, {
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
