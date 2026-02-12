import type { B2ApiUploadData } from "@client/apiB2GetUploadUrl"
import type { B2ApiUploadFileProps } from "@client/B2ApiUploadFileProps"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { b2UploadResultSchema, type B2UploadResult } from "./b2UploadResultSchema"

export interface UploadViaUrlParams extends B2ApiUploadData, B2ApiUploadFileProps {}

export async function apiB2UploadViaUrl(file: Blob, p: UploadViaUrlParams): PromiseResult<B2UploadResult> {
  const op = "apiB2UploadViaUrl"

  const response = await fetch(p.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: p.authorizationToken,
      "Content-Type": p.mimeType,
      "X-Bz-File-Name": p.fullFileName,
      "X-Bz-Content-Sha1": p.sha1,
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
