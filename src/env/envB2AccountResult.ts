import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2AccountResult(env: Env): Result<string> {
  const op = "envB2AccountResult"
  const name = privateEnvVariableName.B2_ACCOUNT
  const value = env.B2_ACCOUNT
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
