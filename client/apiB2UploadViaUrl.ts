import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { b2UploadResultSchema, type B2UploadResult } from "./b2UploadResultSchema"

export interface UploadViaUrlParams {
  uploadUrl: string
  authorizationToken: string
  key: string
  contentType: string
  sha1: string
}

export async function apiB2UploadViaUrl(
  file: Blob,
  params: UploadViaUrlParams,
): PromiseResult<B2UploadResult> {
  const op = "apiB2UploadViaUrl"

  const response = await fetch(params.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: params.authorizationToken,
      "Content-Type": params.contentType,
      "X-Bz-File-Name": params.key,
      "X-Bz-Content-Sha1": params.sha1,
    },
    body: file,
  })

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const parseResult = a.safeParse(b2UploadResultSchema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }

  return createResult(parseResult.output)
}
