import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envB2BucketNameResult(env: Env): Result<string> {
  const op = "envB2BucketNameResult"
  const name = privateEnvVariableName.B2_BUCKET_NAME
  const value = env.B2_BUCKET_NAME
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
