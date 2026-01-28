import { apiBaseB2 } from "@client/apiBaseB2"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export const apiPathGetUploadUrl = "/get-upload-url"

export interface GetUploadUrlParams {
  key: string
  contentType: string
  sha1: string
}

export const uploadPathResponseSchema = a.object({
  uploadUrl: a.string(),
  authorizationToken: a.string(),
  key: a.string(),
  contentType: a.string(),
  sha1: a.string(),
})

const uploadPathResponseJsonSchema = a.pipe(a.string(), a.parseJson(), uploadPathResponseSchema)

export async function apiB2GetUploadUrl(
  baseUrl: string,
  token: string,
  params: GetUploadUrlParams,
): PromiseResult<UploadPathResponse> {
  const op = "apiB2GetUploadUrl"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiBaseB2 + apiPathGetUploadUrl, baseUrl)
  url.searchParams.set("key", params.key)
  url.searchParams.set("contentType", params.contentType)
  url.searchParams.set("sha1", params.sha1)

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const parseResult = a.safeParse(uploadPathResponseJsonSchema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }

  return createResult(parseResult.output)
}

export type UploadPathResponse = a.InferOutput<typeof uploadPathResponseSchema>
