import { apiPathB2 } from "@client/apiBaseB2"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"

export const apiPathIsOnline = "/health"

export async function apiB2IsOnline(baseUrl: string): PromiseResult<boolean> {
  const op = "apiB2IsOnline"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  let url: URL
  try {
    url = new URL(apiPathB2 + apiPathIsOnline, baseUrl)
  } catch {
    return createError(op, `Invalid URL: ${baseUrl}`)
  }

  let response: Response
  try {
    response = await fetch(url.toString(), {
      method: "GET",
    })
  } catch (error) {
    return createError(op, `Connection failed: ${error}`)
  }

  if (!response.ok) {
    return createError(op, `Health check failed: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()
  if (text === "OK") {
    return createResult(true)
  }

  return createError(op, `Unexpected response: ${text}`)
}
