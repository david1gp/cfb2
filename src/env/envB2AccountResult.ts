import type { Env } from "@/env/Env"
import { envVariableErrorMessage } from "@/env/envVariableErrorMessage"
import { privateEnvVariableName } from "@/env/privateEnvVariableName"
import { createResult, createResultError, type Result } from "~utils/result/Result"

export function envB2KeyIdResult(env: Env): Result<string> {
  const op = "envB2AccountResult"
  const name = privateEnvVariableName.B2_KEY_ID
  const value = env.B2_KEY_ID
  if (!value) {
    const errorMessage = envVariableErrorMessage(name)
    return createResultError(op, errorMessage)
  }
  return createResult(value)
}
