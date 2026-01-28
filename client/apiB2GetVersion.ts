import { apiBaseB2 } from "@client/apiBaseB2"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"

export const apiPathVersion = "/version"

export async function apiB2GetVersion(baseUrl: string): PromiseResult<string> {
  const op = "apiB2GetVersion"
  if (!baseUrl) return createError(op, "baseUrl is required")
  const url = new URL(apiBaseB2 + apiPathVersion, baseUrl)
  const response = await fetch(url.toString(), {
    method: "GET",
  })
  if (!response.ok) {
    return createError(op, `Version request failed: ${response.status}`, response.statusText)
  }
  const text = await response.text()
  return createResult(text)
}
