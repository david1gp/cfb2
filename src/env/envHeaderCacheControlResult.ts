import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

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
