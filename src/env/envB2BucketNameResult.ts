import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

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
