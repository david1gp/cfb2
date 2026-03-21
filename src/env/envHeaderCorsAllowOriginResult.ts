import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envHeaderCorsAllowOriginResult(env: Env): Result<string> {
  const op = "envHeaderCorsAllowOriginResult"
  const name = privateEnvVariableName.HEADER_CORS_ALLOW_ORIGIN
  const value = env.HEADER_CORS_ALLOW_ORIGIN
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
