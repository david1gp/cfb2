import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envHeaderCorsMaxAgeResult(env: Env): Result<string> {
  const op = "envHeaderCorsMaxAgeResult"
  const name = privateEnvVariableName.HEADER_CORS_MAX_AGE
  const value = env.HEADER_CORS_MAX_AGE
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
