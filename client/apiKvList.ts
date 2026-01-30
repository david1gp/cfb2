import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export type ApiKvListResult = string[]

export const kvListResponseSchema = a.array(a.string())

export async function apiKvList(
  baseUrl: string,
  token: string,
  options?: { prefix?: string },
): PromiseResult<ApiKvListResult> {
  const op = "apiKvList"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }
  if (!token) {
    return createError(op, "token is required")
  }

  const url = new URL(apiBaseB2 + apiPathKv, baseUrl)
  if (options?.prefix) {
    url.searchParams.set("prefix", options.prefix)
  }

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

  const schema = a.pipe(a.string(), a.parseJson(), kvListResponseSchema)
  const parseResult = a.safeParse(schema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }
  return createResult(parseResult.output)
}
