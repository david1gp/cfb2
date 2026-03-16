import type { Env } from "./Env"
import { envVariableErrorMessage } from "./envVariableErrorMessage"
import { privateEnvVariableName } from "./privateEnvVariableName"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

export function envB2BucketIdResult(env: Env): Result<string> {
  const op = "envB2BucketIdResult"
  const name = privateEnvVariableName.B2_BUCKET_ID
  const value = env.B2_BUCKET_ID
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
