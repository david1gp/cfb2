import type { Env } from "./Env"
import { envVariableErrorMessage } from "./envVariableErrorMessage"
import { privateEnvVariableName } from "./privateEnvVariableName"
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
