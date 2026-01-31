import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

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
