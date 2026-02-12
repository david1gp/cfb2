import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2BucketPublicBaseUrlResult(env: Env): Result<string> {
  const op = "envB2BucketPublicBaseUrlResult"
  const name = privateEnvVariableName.B2_BUCKET_PUBLIC_BASE_URL
  const value = env.B2_BUCKET_PUBLIC_BASE_URL
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
