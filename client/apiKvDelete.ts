import { apiBaseB2 } from "@client/apiBaseB2"
import { apiPathKv } from "@client/apiKvGet"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"

export async function apiKvDelete(baseUrl: string, key: string, token: string): PromiseResult<null> {
  const op = "apiKvDelete"

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
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  })

  if (!response.ok) {
    const text = await response.text()
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  return createResult(null)
}
