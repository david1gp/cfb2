import type { Env } from "./Env"
import { envVariableErrorMessage } from "./envVariableErrorMessage"
import { privateEnvVariableName } from "./privateEnvVariableName"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envHeaderCacheControlResult(env: Env): Result<string> {
  const op = "envHeaderCacheControlResult"
  const name = privateEnvVariableName.HEADER_CACHE_CONTROL
  const value = env.HEADER_CACHE_CONTROL
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
