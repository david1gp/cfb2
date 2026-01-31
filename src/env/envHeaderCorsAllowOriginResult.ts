import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

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
