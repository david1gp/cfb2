import { apiBaseB2 } from "@client/apiBaseB2"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export const apiPathKvList = "/kv"

export type ApiKvListResult = string[]

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

  const url = new URL(apiBaseB2 + apiPathKvList, baseUrl)
  if (options?.prefix) {
    url.searchParams.set("prefix", options.prefix)
  }

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

  const text = await response.text()
  try {
    const keys = JSON.parse(text)
    if (!Array.isArray(keys)) {
      return createError(op, "Expected array response", text)
    }
    return createResult(keys)
  } catch {
    return createError(op, "Invalid JSON response", text)
  }
}
