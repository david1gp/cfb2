import type { Env } from "./Env.js"
import { envVariableErrorMessage } from "./envVariableErrorMessage.js"
import { privateEnvVariableName } from "./privateEnvVariableName.js"
import { createResult, createResultError, type Result } from "@adaptive-ds/result"

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
