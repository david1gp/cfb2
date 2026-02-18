import { apiPathB2 } from "./apiBaseB2"
import { b2GetUploadUrlResponseSchema } from "./b2GetUploadUrlResponseSchema"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export const apiPathGetUploadUrl = "/get-upload-url"

export type B2ApiUploadData = {
  uploadUrl: string
  authorizationToken: string
}

export async function apiB2GetUploadUrl(baseUrl: string, token: string): PromiseResult<B2ApiUploadData> {
  const op = "apiB2GetUploadUrl"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiPathB2 + apiPathGetUploadUrl, baseUrl)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const schema = a.pipe(a.string(), a.parseJson(), b2GetUploadUrlResponseSchema)
  const parseResult = a.safeParse(schema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }

  return createResult(parseResult.output)
}
