// import { envBaseUrlApiResult } from "@/app/env/public/envBaseUrlApiResult"
// import type { FileDataUnuploaded } from "@/file/model/FileDataUnuploaded"
// import type { FileModel } from "@/file/model/FileModel"
// import { fileSchema } from "@/file/model/fileSchema"
// import { resultTryParsingFetchErr } from "@/utils/result/resultTryParsingFetchErr"
import { type Result, createError, createResult } from "~utils/result/Result"

export const apiBaseB2 = "/api/b2"
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
  // technical data
  fileSize: number
  mimeType: string
  // image
  imageWidth?: number
  imageHeight?: number
  // language
  language?: string

  //

  fileId: string
  resourceId?: string
  sha1: string
}

export async function apiB2UploadViaWorker(
  token: string,
  p: B2UploadProps,
  file: any,
  baseUrl: string,
): Promise<Result<string>> {
  const op = "apiB2Upload"

  if (!baseUrl) {
    return createError(op, "!baseUrl")
  }

  // Build headers object with all required fields
  const headers: Record<string, string> = {
    [uploadHeaderFields.authorization]: token,
    [uploadHeaderFields.fileId]: p.fileId,
    [uploadHeaderFields.displayName]: p.displayName,
    [uploadHeaderFields.fileSize]: p.fileSize.toString(),
    [uploadHeaderFields.contentType]: p.mimeType,
    [uploadHeaderFields.sha1]: p.sha1,
  }

  // Add optional resourceId header if present
  if (p.resourceId !== undefined) {
    headers[uploadHeaderFields.resourceId] = p.resourceId
  }

  // Add optional image headers if present
  if (p.imageWidth !== undefined) {
    headers[uploadHeaderFields.imageWidth] = p.imageWidth.toString()
  }
  if (p.imageHeight !== undefined) {
    headers[uploadHeaderFields.imageHeight] = p.imageHeight.toString()
  }

  const response = await fetch(baseUrl + apiBaseB2 + apiPathUploadFile, {
    method: "POST",
    headers,
    body: file,
  })
  const text = await response.text()
  if (!response.ok) {
    console.error(op, response.status, response.statusText, text)
    return createError(op, response.statusText, text)
  }
  return createResult(text)
}
