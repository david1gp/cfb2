import { apiBaseB2 } from "@client/apiBaseB2"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export const apiPathKv = "/kv"

export async function apiKvGet(baseUrl: string, key: string, token: string): PromiseResult<string | null> {
  const op = "apiKvGet"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }
  if (!key) {
    return createError(op, "key is required")
  }
  if (!token) {
    return createError(op, "token is required")
  }

  const url = new URL(apiBaseB2 + apiPathKv + "/" + encodeURIComponent(key), baseUrl)

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
  if (text === "null") {
    return createResult(null)
  }

  return createResult(text)
}
